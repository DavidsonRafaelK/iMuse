import { Platform } from "react-native";
import { Directory, File, Paths } from "expo-file-system";

import type { Id3Cover } from "@/lib/id3";

// Cover art comes out of the ID3 tag as raw bytes. Encoding those to a
// base64 data URI costs a pass over every byte in JS and leaves a string
// hundreds of KB long travelling through props on each render. Writing the
// bytes to a cache file once and handing <Image> a plain URI skips both.

const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// FNV-1a — the file name only needs to be stable and collision-resistant
// enough to key one cover per source file, not cryptographically sound.
function hashKey(key: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}

const webObjectUrls = new Map<string, string>();

export function cacheCoverImage(key: string, cover: Id3Cover): string {
  const extension = MIME_EXTENSIONS[cover.mime.toLowerCase()] ?? "jpg";
  const name = `${hashKey(key)}.${extension}`;

  if (Platform.OS === "web") {
    const existing = webObjectUrls.get(name);
    if (existing) return existing;
    const url = URL.createObjectURL(
      new Blob([cover.bytes as BlobPart], { type: cover.mime }),
    );
    webObjectUrls.set(name, url);
    return url;
  }

  const directory = new Directory(Paths.cache, "covers");
  if (!directory.exists) directory.create({ intermediates: true });

  const file = new File(directory, name);
  // Same source file, same bytes — a cover already on disk is reusable, so
  // only pay for the write the first time we see it.
  if (!file.exists) {
    file.create();
    file.write(cover.bytes);
  }
  return file.uri;
}
