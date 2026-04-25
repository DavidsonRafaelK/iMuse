import { Image, Pressable, Text, View } from "react-native";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react-native";

import { PlayerProgressBar } from "@/components/now-playing/player-progress-bar";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function PlayerCoverView({
  image,
  title,
  artist,
  canPlay,
  playing,
  currentTime,
  duration,
  onTogglePlayback,
  onSeek,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  image: string;
  title: string;
  artist: string;
  canPlay: boolean;
  playing: boolean;
  currentTime: number;
  duration: number;
  onTogglePlayback: () => void;
  onSeek: (seconds: number) => void;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const { colors } = useThemeColors();

  return (
    <View className="w-full max-w-2xl flex-1 items-center justify-center px-8">
      <Image
        source={{ uri: image }}
        className="h-72 w-72 rounded-2xl border border-slate-50 dark:border-gray-800"
      />
      <Text className="mt-6 text-center text-2xl font-bold text-foreground">
        {title}
      </Text>
      <Text className="mt-1 text-center text-lg text-muted-foreground">
        {artist}
      </Text>

      <View className="mt-8 w-full">
        <PlayerProgressBar
          currentTime={currentTime}
          duration={duration}
          onSeek={onSeek}
        />
      </View>

      <View className="mt-4 flex-row items-center gap-10">
        <Pressable
          className="p-2"
          disabled={!hasPrevious}
          onPress={onPrevious}
        >
          <SkipBack
            color={colors.foreground}
            fill={colors.foreground}
            size={26}
            opacity={hasPrevious ? 1 : 0.3}
          />
        </Pressable>
        <Pressable
          className={
            canPlay
              ? "h-16 w-16 items-center justify-center rounded-full bg-foreground"
              : "h-16 w-16 items-center justify-center rounded-full bg-secondary"
          }
          onPress={onTogglePlayback}
        >
          {playing ? (
            <Pause
              color={canPlay ? colors.background : colors.foreground}
              fill={canPlay ? colors.background : "transparent"}
              size={26}
            />
          ) : (
            <Play
              color={canPlay ? colors.background : colors.foreground}
              fill={canPlay ? colors.background : "transparent"}
              size={26}
            />
          )}
        </Pressable>
        <Pressable className="p-2" disabled={!hasNext} onPress={onNext}>
          <SkipForward
            color={colors.foreground}
            fill={colors.foreground}
            size={26}
            opacity={hasNext ? 1 : 0.3}
          />
        </Pressable>
      </View>
    </View>
  );
}
