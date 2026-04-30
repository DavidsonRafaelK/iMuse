import { useRouter } from "expo-router";

import { setPlaybackQueue, type QueueSong } from "@/data/playback-queue";

export function usePlaySong() {
  const router = useRouter();

  return function playSong(
    song: QueueSong,
    // The full list `song` came from, plus its position in it — powers
    // Previous/Next on the now-playing screen. Omit for a one-off song.
    queueContext?: { queue: QueueSong[]; index: number },
  ) {
    setPlaybackQueue(queueContext?.queue ?? [song], queueContext?.index ?? 0);
    router.push({
      pathname: "/now-playing",
      params: {
        id: song.id ?? "",
        title: song.title,
        artist: song.artist,
        image: song.image,
      },
    });
  };
}
