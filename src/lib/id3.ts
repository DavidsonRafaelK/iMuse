// Minimal ID3v2.3/2.4 tag reader — no Node builtins, works directly on the
// Uint8Array bytes of an mp3 file. Only decodes the frames this app needs
// (text frames, APIC cover art, SYLT synchronised lyrics).

export type Id3SyncedLyricLine = {
  time: number; // seconds (only meaningful when the frame's timestamp format is milliseconds)
  text: string;
};

// Cover art is handed back as raw bytes rather than a data URI: turning a
// few hundred KB into base64 in JS is slow enough to be visible, and the
// image can be written to a cache file and referenced by URI instead.
export type Id3Cover = {
  mime: string;
  bytes: Uint8Array;
};

export type Id3Tags = {
  artist?: string;
  album?: string;
  year?: string;
  cover?: Id3Cover;
  lyrics: Id3SyncedLyricLine[];
};

/** Bytes of the ID3 header that precede the tag body. */
export const ID3_HEADER_SIZE = 10;

function decodeLatin1(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function decodeUtf8(bytes: Uint8Array): string {
  let out = "";
  let i = 0;
  while (i < bytes.length) {
    const b0 = bytes[i];
    if (b0 < 0x80) {
      out += String.fromCharCode(b0);
      i += 1;
    } else if ((b0 & 0xe0) === 0xc0 && i + 1 < bytes.length) {
      out += String.fromCharCode(((b0 & 0x1f) << 6) | (bytes[i + 1] & 0x3f));
      i += 2;
    } else if ((b0 & 0xf0) === 0xe0 && i + 2 < bytes.length) {
      out += String.fromCharCode(
        ((b0 & 0x0f) << 12) |
          ((bytes[i + 1] & 0x3f) << 6) |
          (bytes[i + 2] & 0x3f),
      );
      i += 3;
    } else if ((b0 & 0xf8) === 0xf0 && i + 3 < bytes.length) {
      let cp =
        ((b0 & 0x07) << 18) |
        ((bytes[i + 1] & 0x3f) << 12) |
        ((bytes[i + 2] & 0x3f) << 6) |
        (bytes[i + 3] & 0x3f);
      cp -= 0x10000;
      out += String.fromCharCode(0xd800 + (cp >> 10), 0xdc00 + (cp & 0x3ff));
      i += 4;
    } else {
      i += 1;
    }
  }
  return out;
}

function decodeUtf16(bytes: Uint8Array, littleEndian: boolean): string {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let out = "";
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    out += String.fromCharCode(view.getUint16(i, littleEndian));
  }
  return out;
}

// ID3 text encoding byte: 0=Latin1, 1=UTF-16 w/ BOM, 2=UTF-16BE, 3=UTF-8
function decodeByEncoding(bytes: Uint8Array, encoding: number): string {
  if (encoding === 0) return decodeLatin1(bytes);
  if (encoding === 3) return decodeUtf8(bytes);
  if (encoding === 2) return decodeUtf16(bytes, false);
  // encoding === 1: has a 2-byte BOM (FF FE = LE, FE FF = BE)
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return decodeUtf16(bytes.subarray(2), true);
  }
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return decodeUtf16(bytes.subarray(2), false);
  }
  return decodeUtf16(bytes, true);
}

function stripTrailingNulls(text: string): string {
  return text.replace(/\u0000+$/g, "");
}

// Reads a string terminated by 0x00 (or 0x00 0x00 for UTF-16), starting at `offset`.
// Returns the decoded text and the offset right after the terminator.
function readTerminatedString(
  bytes: Uint8Array,
  offset: number,
  encoding: number,
): { text: string; next: number } {
  const isWide = encoding === 1 || encoding === 2;
  let end = offset;
  if (isWide) {
    while (
      end + 1 < bytes.length &&
      !(bytes[end] === 0 && bytes[end + 1] === 0)
    ) {
      end += 2;
    }
  } else {
    while (end < bytes.length && bytes[end] !== 0) {
      end += 1;
    }
  }
  const text = decodeByEncoding(bytes.subarray(offset, end), encoding);
  const next = Math.min(end + (isWide ? 2 : 1), bytes.length);
  return { text, next };
}

function readSyncsafeInt(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] & 0x7f) << 21) |
    ((bytes[offset + 1] & 0x7f) << 14) |
    ((bytes[offset + 2] & 0x7f) << 7) |
    (bytes[offset + 3] & 0x7f)
  );
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  );
}

function parseTextFrame(frameData: Uint8Array): string {
  const encoding = frameData[0];
  const text = decodeByEncoding(frameData.subarray(1), encoding);
  return stripTrailingNulls(text).split("\u0000")[0] ?? "";
}

function parseApicFrame(frameData: Uint8Array): Id3Cover | undefined {
  const encoding = frameData[0];
  let offset = 1;

  // MIME type is always Latin1, terminated by a single 0x00.
  let mimeEnd = offset;
  while (mimeEnd < frameData.length && frameData[mimeEnd] !== 0) mimeEnd += 1;
  const mime = decodeLatin1(frameData.subarray(offset, mimeEnd)) || "image/jpeg";
  offset = mimeEnd + 1;

  offset += 1; // picture type byte

  const { next } = readTerminatedString(frameData, offset, encoding);
  offset = next;

  const imageBytes = frameData.subarray(offset);
  if (imageBytes.length === 0) return undefined;
  return { mime, bytes: imageBytes };
}

function parseSyltFrame(frameData: Uint8Array): Id3SyncedLyricLine[] {
  const encoding = frameData[0];
  const timestampFormat = frameData[4]; // 1 = MPEG frames, 2 = milliseconds
  let offset = 6;

  // Content descriptor — skip past it, value unused.
  const descriptor = readTerminatedString(frameData, offset, encoding);
  offset = descriptor.next;

  const lines: Id3SyncedLyricLine[] = [];
  while (offset < frameData.length) {
    const { text, next } = readTerminatedString(frameData, offset, encoding);
    if (next + 4 > frameData.length) break;
    const timestamp = readUint32BE(frameData, next);
    offset = next + 4;
    lines.push({
      time: timestampFormat === 2 ? timestamp / 1000 : timestamp,
      text: stripTrailingNulls(text),
    });
  }
  return lines;
}

function hasId3Magic(bytes: Uint8Array): boolean {
  return (
    bytes.length >= ID3_HEADER_SIZE &&
    bytes[0] === 0x49 && // 'I'
    bytes[1] === 0x44 && // 'D'
    bytes[2] === 0x33 // '3'
  );
}

// Given just the first ID3_HEADER_SIZE bytes of a file, reports how many
// bytes the whole tag occupies (header included), or 0 when the file
// carries no ID3 tag. Lets a caller read the tag off disk without pulling
// in the audio that follows it.
export function readId3TotalSize(header: Uint8Array): number {
  if (!hasId3Magic(header)) return 0;
  return ID3_HEADER_SIZE + readSyncsafeInt(header, 6);
}

// Header flag 0x40 means an extended header sits between the header and the
// first frame. Its own length is stored differently per version: 2.4 counts
// the whole extended header as a syncsafe int, 2.3 stores a plain int that
// excludes the four size bytes themselves. Reading frames from the wrong
// offset yields pure garbage, so skip whatever it claims.
function extendedHeaderSize(bytes: Uint8Array, majorVersion: number): number {
  const hasExtendedHeader = (bytes[5] & 0x40) !== 0;
  if (!hasExtendedHeader || bytes.length < ID3_HEADER_SIZE + 4) return 0;

  return majorVersion >= 4
    ? readSyncsafeInt(bytes, ID3_HEADER_SIZE)
    : 4 + readUint32BE(bytes, ID3_HEADER_SIZE);
}

export function parseId3(bytes: Uint8Array): Id3Tags {
  const tags: Id3Tags = { lyrics: [] };

  if (!hasId3Magic(bytes)) return tags;

  const majorVersion = bytes[3];
  const tagSize = readSyncsafeInt(bytes, 6);
  const tagEnd = Math.min(ID3_HEADER_SIZE + tagSize, bytes.length);

  let offset = ID3_HEADER_SIZE + extendedHeaderSize(bytes, majorVersion);
  while (offset + 10 <= tagEnd) {
    const id = decodeLatin1(bytes.subarray(offset, offset + 4));
    if (id === "\u0000\u0000\u0000\u0000") break;

    const frameSize =
      majorVersion >= 4
        ? readSyncsafeInt(bytes, offset + 4)
        : readUint32BE(bytes, offset + 4);
    const frameDataStart = offset + 10;
    const frameDataEnd = frameDataStart + frameSize;
    if (frameSize <= 0 || frameDataEnd > tagEnd) break;

    const frameData = bytes.subarray(frameDataStart, frameDataEnd);

    try {
      if (id === "TPE1") tags.artist = parseTextFrame(frameData);
      else if (id === "TALB") tags.album = parseTextFrame(frameData);
      else if (id === "TDRC" || id === "TYER") {
        tags.year = parseTextFrame(frameData).slice(0, 4);
      } else if (id.startsWith("APIC")) {
        tags.cover = parseApicFrame(frameData);
      } else if (id.startsWith("SYLT")) {
        tags.lyrics = parseSyltFrame(frameData);
      }
    } catch {
      // Skip any frame we fail to decode rather than aborting the whole parse.
    }

    offset = frameDataEnd;
  }

  return tags;
}
