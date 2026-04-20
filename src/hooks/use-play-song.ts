import { useRouter } from "expo-router";

export function usePlaySong() {
  const router = useRouter();

  return function playSong(song: {
    id?: string;
    title: string;
    artist: string;
    image: string;
  }) {
    router.push({
      pathname: "/now-playing",
      params: { id: song.id ?? "", title: song.title, artist: song.artist, image: song.image },
    });
  };
}
