import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { MoreVertical } from "lucide-react-native";

import { favouriteItems } from "@/data/favourites";
import { realSong, useRealSongMetadata } from "@/data/real-song";
import { usePagedWidth } from "@/hooks/use-paged-width";
import { usePlaySong } from "@/hooks/use-play-song";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SongItem } from "@/types/music";

const favouritePages = Array.from(
  { length: Math.ceil(favouriteItems.length / 4) },
  (_, i) => favouriteItems.slice(i * 4, i * 4 + 4),
);

export function FavouriteSection({
  onSelectSong,
}: {
  onSelectSong: (song: SongItem) => void;
}) {
  const { colors } = useThemeColors();
  const favouritePageWidth = usePagedWidth();
  const playSong = usePlaySong();
  const realSongMetadata = useRealSongMetadata();

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
              {page.map((rawItem) => {
                const item =
                  rawItem.id === realSong.id && realSongMetadata
                    ? {
                        ...rawItem,
                        artist: realSongMetadata.artist,
                        image: realSongMetadata.image,
                      }
                    : rawItem;
                return (
                  <Pressable
                    key={item.id}
                    className="flex-row items-center gap-3"
                    onPress={() => playSong(item)}
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
