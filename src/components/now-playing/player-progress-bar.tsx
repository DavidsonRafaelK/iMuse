import { useState } from "react";
import { Pressable, Text, View } from "react-native";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function PlayerProgressBar({
  currentTime,
  duration,
  onSeek,
}: {
  currentTime: number;
  duration: number;
  onSeek: (seconds: number) => void;
}) {
  const [barWidth, setBarWidth] = useState(0);
  const ratio = duration > 0 ? Math.min(currentTime / duration, 1) : 0;

  return (
    <View className="w-full">
      <Pressable
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => {
          if (barWidth > 0 && duration > 0) {
            onSeek((e.nativeEvent.locationX / barWidth) * duration);
          }
        }}
        className="justify-center py-2"
      >
        <View className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <View
            className="h-1.5 rounded-full bg-foreground"
            style={{ width: `${ratio * 100}%` }}
          />
        </View>
      </Pressable>
      <View className="mt-1 flex-row justify-between">
        <Text className="text-xs text-muted-foreground">
          {formatTime(currentTime)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}
