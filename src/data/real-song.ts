import { useSyncExternalStore } from "react";
import { Asset } from "expo-asset";
import { File } from "expo-file-system";

import { parseId3 } from "@/lib/id3";

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
    const asset = Asset.fromModule(audioSource);
    await asset.downloadAsync();

    const file = new File(asset.localUri ?? asset.uri);
    const buffer = await file.arrayBuffer();
    const tags = parseId3(new Uint8Array(buffer));

    const metadata: RealSongMetadata = {
      artist: tags.artist ?? "",
      album: tags.album,
      year: tags.year,
      image: tags.coverDataUri ?? FALLBACK_IMAGE,
      lyrics: tags.lyrics,
    };
    cachedMetadata = metadata;
    notifyListeners();
    return metadata;
  })();

  return pendingLoad;
}

// Kick off the parse immediately so it's usually already resolved by the
// time a screen needs it.
loadMetadata();

export function useRealSongMetadata(): RealSongMetadata | null {
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
