import { Pressable, View } from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, MoreVertical, Share2 } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export function AlbumDetailHeader() {
  const { colors } = useThemeColors();
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <Pressable className="p-2" onPress={() => router.back()}>
        <ArrowLeft color={colors.foreground} size={22} />
      </Pressable>
      <View className="flex-row items-center gap-2">
        <Pressable className="p-2" onPress={() => console.log("share")}>
          <Share2 color={colors.foreground} size={20} />
        </Pressable>
        <Pressable className="p-2" onPress={() => console.log("more")}>
          <MoreVertical color={colors.foreground} size={22} />
        </Pressable>
      </View>
    </View>
  );
}
