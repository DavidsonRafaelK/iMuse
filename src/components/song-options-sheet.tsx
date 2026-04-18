import { useEffect, useState, type RefObject } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Info, Radio, Share2 } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export type SongOptionsSong = {
  title: string;
  artist: string;
  album?: string;
  image: string;
};

const actions = [
  { label: "Share Song", icon: Share2 },
  { label: "View Credits", icon: Info },
  { label: "Create Station", icon: Radio },
];

// Off-screen starting offset for the sheet's slide-up animation.
const SHEET_OFFSET = 420;

export function SongOptionsSheet({
  song,
  onClose,
  blurTarget,
}: {
  song: SongOptionsSong | null;
  onClose: () => void;
  blurTarget?: RefObject<View | null>;
}) {
  const { scheme, colors } = useThemeColors();

  const [mounted, setMounted] = useState(false);
  const backdropOpacity = useSharedValue(0);
  const sheetTranslateY = useSharedValue(SHEET_OFFSET);

  useEffect(() => {
    if (song) {
      backdropOpacity.value = withTiming(1, { duration: 200 });
      sheetTranslateY.value = withTiming(0, { duration: 250 });
    } else if (mounted) {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      sheetTranslateY.value = withTiming(
        SHEET_OFFSET,
        { duration: 250 },
        (finished) => {
          if (finished) runOnJS(setMounted)(false);
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  if (!song && !mounted) {
    return null;
  }

  return (
    <View
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Animated.View style={[{ flex: 1 }, backdropStyle]}>
        <Pressable className="flex-1" onPress={onClose}>
          <BlurView
            intensity={40}
            tint={scheme === "dark" ? "dark" : "light"}
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={{ flex: 1 }}
          />
        </Pressable>
      </Animated.View>

      {song ? (
        <Animated.View
          style={[
            { position: "absolute", bottom: 0, left: 0, right: 0 },
            sheetStyle,
          ]}
        >
          <SafeAreaView
            edges={["bottom"]}
            style={{ backgroundColor: colors.background }}
          >
          <View className="bg-background pt-4">
            <View className="flex-row items-center gap-3 border-b border-border px-4 pb-4">
              <Image
                source={{ uri: song.image }}
                className="h-14 w-14 rounded-2xl"
              />
              <View className="flex-1">
                <Text
                  className="font-semibold text-foreground"
                  numberOfLines={1}
                >
                  {song.title}
                </Text>
                <Text
                  className="text-sm text-muted-foreground"
                  numberOfLines={1}
                >
                  {song.artist}
                </Text>
                {song.album ? (
                  <Text
                    className="text-sm text-muted-foreground"
                    numberOfLines={1}
                  >
                    {song.album}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="mt-2">
              {actions.map(({ label, icon: Icon }) => (
                <Pressable
                  key={label}
                  className="flex-row items-center gap-4 px-4 py-3"
                  onPress={() => {
                    console.log(label, song.title);
                    onClose();
                  }}
                >
                  <Icon size={20} color={colors.foreground} />
                  <Text className="text-base text-foreground">{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          </SafeAreaView>
        </Animated.View>
      ) : null}
    </View>
  );
}
