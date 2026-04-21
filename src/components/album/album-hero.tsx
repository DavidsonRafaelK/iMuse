import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Check, Play, Plus, Shuffle } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";
import { getReleaseYear, type ListenNowItem } from "@/data/listen-now";

export function AlbumHero({ album }: { album: ListenNowItem }) {
  const { colors } = useThemeColors();
  const [shuffleOn, setShuffleOn] = useState(false);
  const [added, setAdded] = useState(false);

  return (
    <View className="items-center px-4 pt-2">
      <Image
        source={{ uri: album.image }}
        className="h-72 w-72 rounded-2xl border border-slate-50 dark:border-gray-800"
      />
      <Text className="mt-4 text-center text-2xl font-bold text-foreground">
        {album.title}
      </Text>
      <Text className="mt-1 text-center text-lg text-muted-foreground">
        {album.artist}
      </Text>
      <Text className="mt-1 text-center text-sm text-muted-foreground">
        {album.genre} {getReleaseYear(album)}
      </Text>

      <View className="mt-6 flex-row items-center gap-4">
        <Pressable
          className={
            shuffleOn
              ? "h-12 w-12 items-center justify-center rounded-full bg-foreground"
              : "h-12 w-12 items-center justify-center rounded-full bg-secondary"
          }
          onPress={() => setShuffleOn((value) => !value)}
        >
          <Shuffle
            color={shuffleOn ? colors.background : colors.foreground}
            size={20}
          />
        </Pressable>
        <Pressable
          className="flex-row items-center gap-2 rounded-full bg-foreground px-8 py-3"
          onPress={() => console.log("play")}
        >
          <Play color={colors.background} size={18} fill={colors.background} />
          <Text className="font-semibold text-background">Play</Text>
        </Pressable>
        <Pressable
          className={
            added
              ? "h-12 w-12 items-center justify-center rounded-full bg-foreground"
              : "h-12 w-12 items-center justify-center rounded-full bg-secondary"
          }
          onPress={() => setAdded((value) => !value)}
        >
          {added ? (
            <Check color={colors.background} size={20} />
          ) : (
            <Plus color={colors.foreground} size={20} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
