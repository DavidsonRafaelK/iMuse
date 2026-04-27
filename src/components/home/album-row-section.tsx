import { Image, Pressable, ScrollView, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { usePlaySong } from "@/hooks/use-play-song";
import { useThemeColors } from "@/hooks/use-theme-colors";
import type { SongItem } from "@/types/music";

export function AlbumRowSection({
  title,
  items,
}: {
  title: string;
  items: SongItem[];
}) {
  const { colors } = useThemeColors();
  const playSong = usePlaySong();

  return (
    <>
      <Pressable className="mt-8 flex-row items-center gap-1 px-4">
        <Text className="text-2xl font-bold text-foreground">{title}</Text>
        <ChevronRight size={20} color={colors.mutedForeground} />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
        contentContainerClassName="gap-4 px-4"
      >
        {items.map((item, index) => (
          <Pressable
            key={item.id}
            className="w-36"
            onPress={() => playSong(item, { queue: items, index })}
          >
            <Image
              source={{ uri: item.image }}
              className="h-36 w-36 rounded-2xl border border-slate-50 dark:border-gray-800"
            />
            <Text
              className="mt-2 font-medium text-foreground"
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
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}
