// Minimal ID3v2.3/2.4 tag reader — no Node builtins, works directly on the
// Uint8Array bytes of an mp3 file. Only decodes the frames this app needs
// (text frames, APIC cover art, SYLT synchronised lyrics).

export type Id3SyncedLyricLine = {
  time: number; // seconds (only meaningful when the frame's timestamp format is milliseconds)
  text: string;
};

export type Id3Tags = {
  artist?: string;
  album?: string;
  year?: string;
  coverDataUri?: string;
  lyrics: Id3SyncedLyricLine[];
};

const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function bytesToBase64(bytes: Uint8Array): string {
  let result = "";
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;

    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 0x03) << 4) | (b1 >> 4)];
    result += i + 1 < len ? BASE64_CHARS[((b1 & 0x0f) << 2) | (b2 >> 6)] : "=";
    result += i + 2 < len ? BASE64_CHARS[b2 & 0x3f] : "=";
  }
  return result;
}

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

function parseApicFrame(frameData: Uint8Array): string | undefined {
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
  return `data:${mime};base64,${bytesToBase64(imageBytes)}`;
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

export function parseId3(bytes: Uint8Array): Id3Tags {
  const tags: Id3Tags = { lyrics: [] };

  if (
    bytes.length < 10 ||
    bytes[0] !== 0x49 || // 'I'
    bytes[1] !== 0x44 || // 'D'
    bytes[2] !== 0x33 // '3'
  ) {
    return tags;
  }

  const majorVersion = bytes[3];
  const tagSize = readSyncsafeInt(bytes, 6);
  const tagEnd = Math.min(10 + tagSize, bytes.length);

  let offset = 10;
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
        tags.coverDataUri = parseApicFrame(frameData);
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
