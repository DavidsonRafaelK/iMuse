import { Pressable, Text, useColorScheme, View } from "react-native";
import { MoreVertical } from "lucide-react-native";

import { themeColors } from "@/constants/theme-colors";

export function ScreenHeader({ title }: { title: string }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = themeColors[scheme];

  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <Text className="text-3xl font-bold text-foreground">{title}</Text>
      <Pressable className="p-2" onPress={() => console.log("menu", title)}>
        <MoreVertical color={colors.foreground} size={22} />
      </Pressable>
    </View>
  );
}
