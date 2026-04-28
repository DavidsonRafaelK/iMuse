import { cacheCoverImage } from "@/lib/cover-cache";
import { parseId3 } from "@/lib/id3";
import { readId3Bytes } from "@/lib/read-id3-bytes";
import type { LyricLine } from "@/data/real-song";

export type LocalSongMetadata = {
  artist: string;
  album?: string;
  image?: string;
  lyrics: LyricLine[];
};

const EMPTY_METADATA: LocalSongMetadata = { artist: "", lyrics: [] };

const cache = new Map<string, Promise<LocalSongMetadata>>();

// Parsed lazily per file (only when the user actually opens a song) rather
// than for the whole folder up front, since a library can hold many files.
// Some files on device can't be read at all (SAF/content:// URIs are
// occasionally flaky for arbitrary third-party folders) — that's treated
// the same as "no tags found" rather than a fatal error, so a broken or
// tagless file never blocks playback or the UI.
export function loadLocalSongMetadata(uri: string): Promise<LocalSongMetadata> {
  const cached = cache.get(uri);
  if (cached) return cached;

  const promise = (async () => {
    try {
      const tags = parseId3(await readId3Bytes(uri));
      return {
        artist: tags.artist ?? "",
        album: tags.album,
        image: tags.cover ? cacheCoverImage(uri, tags.cover) : undefined,
        lyrics: tags.lyrics,
      };
    } catch (error) {
      console.warn(`Couldn't read tags for ${uri}, continuing without them:`, error);
      return EMPTY_METADATA;
    }
  })();

  cache.set(uri, promise);
  return promise;
}
