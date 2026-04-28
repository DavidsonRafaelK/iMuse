import { useSyncExternalStore } from "react";

export type QueueSong = {
  id?: string;
  title: string;
  artist: string;
  image: string;
  // content:// URIs don't survive a round trip through the URL, so local
  // songs travel through this in-memory queue instead of route params.
  localUri?: string;
};

let queue: QueueSong[] = [];
let index = 0;
const listeners = new Set<() => void>();

function notify() {
  snapshot = computeSnapshot();
  listeners.forEach((listener) => listener());
}

export function setPlaybackQueue(songs: QueueSong[], startIndex: number) {
  queue = songs;
  index = Math.max(0, Math.min(startIndex, songs.length - 1));
  notify();
}

export function playNextInQueue(): boolean {
  if (index + 1 >= queue.length) return false;
  index += 1;
  notify();
  return true;
}

export function playPreviousInQueue(): boolean {
  if (index - 1 < 0) return false;
  index -= 1;
  notify();
  return true;
}

type QueueSnapshot = {
  song: QueueSong | null;
  // Identifies which song is current, so callers can react to a skip even
  // when the two songs happen to look alike.
  index: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

const EMPTY_SNAPSHOT: QueueSnapshot = {
  song: null,
  index: 0,
  hasNext: false,
  hasPrevious: false,
};

function computeSnapshot(): QueueSnapshot {
  const song = queue[index] ?? null;
  if (!song) return EMPTY_SNAPSHOT;
  return {
    song,
    index,
    hasNext: index + 1 < queue.length,
    hasPrevious: index > 0,
  };
}

// useSyncExternalStore compares snapshots by reference, so building a fresh
// object per call reads as "changed on every render" and spins forever.
// Rebuild it only when the queue actually moves.
let snapshot: QueueSnapshot = EMPTY_SNAPSHOT;

function getSnapshot(): QueueSnapshot {
  return snapshot;
}

export function useQueueState(): QueueSnapshot {
  return useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    getSnapshot,
    () => EMPTY_SNAPSHOT,
  );
}
