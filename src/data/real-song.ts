import { useEffect, useSyncExternalStore } from "react";
import { Asset } from "expo-asset";

import { cacheCoverImage } from "@/lib/cover-cache";
import { parseId3 } from "@/lib/id3";
import { readId3Bytes } from "@/lib/read-id3-bytes";

export type LyricLine = {
  time: number; // seconds
  text: string;
};

export type RealSongMetadata = {
  artist: string;
  album?: string;
  year?: string;
  image: string;
  lyrics: LyricLine[];
};

// Shown until the real cover art has been parsed out of the file.
export const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=60";

const audioSource = require("../../assets/audio/impostor-syndrome.mp3");

export const realSong = {
  id: "real-1",
  // No TIT2 (title) frame is embedded in the file, so this is derived from
  // the filename rather than "detected" — everything else below is read
  // straight out of the file's ID3 tags at runtime.
  title: "Impostor Syndrome",
  audioSource,
};

let cachedMetadata: RealSongMetadata | null = null;
let pendingLoad: Promise<RealSongMetadata> | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

async function loadMetadata(): Promise<RealSongMetadata> {
  if (cachedMetadata) return cachedMetadata;
  if (pendingLoad) return pendingLoad;

  pendingLoad = (async () => {
    try {
      const asset = Asset.fromModule(audioSource);
      await asset.downloadAsync();

      const uri = asset.localUri ?? asset.uri;
      const tags = parseId3(await readId3Bytes(uri));

      const metadata: RealSongMetadata = {
        artist: tags.artist ?? "",
        album: tags.album,
        year: tags.year,
        image: tags.cover ? cacheCoverImage(uri, tags.cover) : FALLBACK_IMAGE,
        lyrics: tags.lyrics,
      };
      cachedMetadata = metadata;
      notifyListeners();
      return metadata;
    } catch (error) {
      console.error("Failed to read real song metadata:", error);
      pendingLoad = null;
      throw error;
    }
  })();

  return pendingLoad;
}

export function useRealSongMetadata(): RealSongMetadata | null {
  // Deliberately started from a subscriber rather than at import time.
  // Kicking the parse off at module scope meant the asset download and tag
  // read ran before React could render anything, holding the splash screen
  // up behind work no first screen actually needs.
  useEffect(() => {
    // Already logged inside loadMetadata; a rejection here just means the
    // hook keeps reporting null, which callers handle.
    loadMetadata().catch(() => {});
  }, []);

  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    () => cachedMetadata,
    () => null,
  );
}

export function getActiveLyricIndex(
  lyrics: LyricLine[],
  currentTime: number,
): number {
  let index = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (lyrics[i].time <= currentTime) {
      index = i;
    } else {
      break;
    }
  }
  return index;
}
