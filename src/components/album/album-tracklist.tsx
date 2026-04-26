import { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { MoreVertical } from "lucide-react-native";

import { usePlaySong } from "@/hooks/use-play-song";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { Track } from "@/data/listen-now";
import type { SongOptionsSong } from "@/components/song-options-sheet";

export function AlbumTracklist({
  tracks,
  album,
  onSelectTrack,
}: {
  tracks: Track[];
  album: { title: string; artist: string; image: string };
  onSelectTrack: (song: SongOptionsSong) => void;
}) {
  const { colors } = useThemeColors();
  const playSong = usePlaySong();

  const queueSongs = useMemo(
    () =>
      tracks.map((track) => ({
        title: track.title,
        artist: album.artist,
        image: album.image,
      })),
    [tracks, album.artist, album.image],
  );

  return (
    <View className="mt-6 px-4">
      {tracks.map((track, i) => (
        <Pressable
          key={track.title}
          className="flex-row items-center gap-3 py-3"
          onPress={() =>
            playSong(queueSongs[i], { queue: queueSongs, index: i })
          }
        >
          <Text className="w-5 text-muted-foreground">{i + 1}</Text>
          <Text className="flex-1 text-foreground" numberOfLines={1}>
            {track.title}
          </Text>
          <Pressable
            className="p-2"
            onPress={() =>
              onSelectTrack({
                title: track.title,
                artist: album.artist,
                album: album.title,
                image: album.image,
              })
            }
          >
            <MoreVertical size={18} color={colors.mutedForeground} />
          </Pressable>
        </Pressable>
      ))}
    </View>
  );
}
