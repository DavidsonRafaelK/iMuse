import { useMemo } from "react";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { MoreVertical } from "lucide-react-native";

import { favouriteItems } from "@/data/favourites";
import { realSong, useRealSongMetadata } from "@/data/real-song";
import { usePagedWidth } from "@/hooks/use-paged-width";
import { usePlaySong } from "@/hooks/use-play-song";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SongItem } from "@/types/music";

export function FavouriteSection({
  onSelectSong,
}: {
  onSelectSong: (song: SongItem) => void;
}) {
  const { colors } = useThemeColors();
  const favouritePageWidth = usePagedWidth();
  const playSong = usePlaySong();
  const realSongMetadata = useRealSongMetadata();

  // Applied once so Previous/Next in now-playing walks the same list (with
  // the same real-song art/artist) the user sees here, paged or not.
  const queueSongs = useMemo(
    () =>
      favouriteItems.map((item) =>
        item.id === realSong.id && realSongMetadata
          ? { ...item, artist: realSongMetadata.artist, image: realSongMetadata.image }
          : item,
      ),
    [realSongMetadata],
  );
  const favouritePages = useMemo(
    () =>
      Array.from({ length: Math.ceil(queueSongs.length / 4) }, (_, i) =>
        queueSongs.slice(i * 4, i * 4 + 4),
      ),
    [queueSongs],
  );

  return (
    <>
      <View className="mt-8 px-4">
        <Text className="text-4xl font-bold text-foreground">Favourite</Text>
        <Text className="mt-1 text-md text-muted-foreground">
          Songs you keep coming back to.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={favouritePageWidth}
        decelerationRate="fast"
        disableIntervalMomentum
        className="mt-3"
      >
        {favouritePages.map((page, pageIndex) => (
          <View key={pageIndex} style={{ width: favouritePageWidth }}>
            <View className="gap-3 pl-4 pr-6">
              {page.map((item, i) => {
                const globalIndex = pageIndex * 4 + i;
                return (
                  <Pressable
                    key={item.id}
                    className="flex-row items-center gap-3"
                    onPress={() =>
                      playSong(item, { queue: queueSongs, index: globalIndex })
                    }
                  >
                    <Image
                      source={{ uri: item.image }}
                      className="h-14 w-14 rounded-2xl border border-slate-50 dark:border-gray-800"
                    />
                    <View className="flex-1">
                      <Text
                        className="font-medium text-foreground"
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text
                        className="text-sm text-muted-foreground"
                        numberOfLines={1}
                      >
                        {item.artist}
                      </Text>
                    </View>
                    <Pressable
                      className="p-2"
                      onPress={() => onSelectSong(item)}
                    >
                      <MoreVertical size={20} color={colors.mutedForeground} />
                    </Pressable>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </>
  );
}
