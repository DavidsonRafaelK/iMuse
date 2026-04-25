import { Image, Pressable, Text, View } from "react-native";
import { ChevronDown, MoreVertical, Pause, Play, Star } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export function FullPlayerHeader({
  image,
  title,
  artist,
  canPlay,
  playing,
  favourited,
  onBack,
  onTitlePress,
  onTogglePlayback,
  onToggleFavourite,
  onOpenOptions,
}: {
  image: string;
  title: string;
  artist: string;
  canPlay: boolean;
  playing: boolean;
  favourited: boolean;
  onBack: () => void;
  onTitlePress: () => void;
  onTogglePlayback: () => void;
  onToggleFavourite: () => void;
  onOpenOptions: () => void;
}) {
  const { colors } = useThemeColors();

  return (
    <View className="w-full max-w-2xl flex-row items-center gap-3 px-4 py-2">
      <Pressable className="p-2" onPress={onBack}>
        <ChevronDown color={colors.foreground} size={22} />
      </Pressable>
      <Image source={{ uri: image }} className="h-12 w-12 rounded-md" />
      <Pressable className="flex-1" onPress={onTitlePress}>
        <Text className="font-semibold text-foreground" numberOfLines={1}>
          {title}
        </Text>
        <Text className="text-sm text-muted-foreground" numberOfLines={1}>
          {artist}
        </Text>
      </Pressable>
      <Pressable
        className={
          canPlay
            ? "h-9 w-9 items-center justify-center rounded-full bg-foreground"
            : "h-9 w-9 items-center justify-center rounded-full bg-secondary"
        }
        onPress={onTogglePlayback}
      >
        {playing ? (
          <Pause
            color={canPlay ? colors.background : colors.foreground}
            fill={canPlay ? colors.background : "transparent"}
            size={16}
          />
        ) : (
          <Play
            color={canPlay ? colors.background : colors.foreground}
            fill={canPlay ? colors.background : "transparent"}
            size={16}
          />
        )}
      </Pressable>
      <Pressable
        className={
          favourited
            ? "h-9 w-9 items-center justify-center rounded-full bg-foreground"
            : "h-9 w-9 items-center justify-center rounded-full bg-secondary"
        }
        onPress={onToggleFavourite}
      >
        <Star
          color={favourited ? colors.background : colors.foreground}
          fill={favourited ? colors.background : "transparent"}
          size={16}
        />
      </Pressable>
      <Pressable
        className="h-9 w-9 items-center justify-center rounded-full bg-secondary"
        onPress={onOpenOptions}
      >
        <MoreVertical color={colors.foreground} size={18} />
      </Pressable>
    </View>
  );
}
