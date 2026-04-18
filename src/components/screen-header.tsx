import { Pressable, Text, View } from "react-native";
import { MoreVertical } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

export function ScreenHeader({ title }: { title: string }) {
  const { colors } = useThemeColors();

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <Text className="text-3xl font-bold text-foreground">{title}</Text>
      <Pressable className="p-2" onPress={() => console.log("menu", title)}>
        <MoreVertical color={colors.foreground} size={22} />
      </Pressable>
    </View>
  );
}
