import { Platform } from "react-native";
import { File, FileMode } from "expo-file-system";

import { ID3_HEADER_SIZE, readId3TotalSize } from "@/lib/id3";

// An ID3 tag sits at the very front of the file and is tiny next to the
// audio behind it — a few hundred KB against several megabytes. Reading the
// whole file just to look at that header stalled the JS thread long enough
// to hold up the first render, so read the header, ask it how long the tag
// is, then read exactly that much and stop.

// A corrupt header can advertise a nonsense length; cap what we'll act on.
const MAX_TAG_SIZE = 4 * 1024 * 1024;

function tagLengthFrom(header: Uint8Array): number {
  const total = readId3TotalSize(header);
  return total > 0 && total <= MAX_TAG_SIZE ? total : 0;
}

export async function readId3Bytes(uri: string): Promise<Uint8Array> {
  // expo-file-system's File does real native file I/O on iOS/Android, but is
  // an unimplemented stub on web (its constructor throws). fetch() reads
  // local/bundled/picked file URIs fine there — it can't do a ranged read of
  // a file:// or blob: URI though, so web still pays for the full download
  // and just trims the result.
  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const length = tagLengthFrom(bytes);
    return length > 0 ? bytes.subarray(0, length) : bytes;
  }

  const handle = new File(uri).open(FileMode.ReadOnly);
  try {
    const header = handle.readBytes(ID3_HEADER_SIZE);
    const length = tagLengthFrom(header);
    // No tag (or an unusable one) — hand back the header so the parser can
    // reach the same "no tags found" conclusion without a second read.
    if (length === 0) return header;

    const tag = new Uint8Array(length);
    tag.set(header, 0);
    tag.set(handle.readBytes(length - ID3_HEADER_SIZE), ID3_HEADER_SIZE);
    return tag;
  } finally {
    handle.close();
  }
}
