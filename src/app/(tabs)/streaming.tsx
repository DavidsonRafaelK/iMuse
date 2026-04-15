import { Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { themeColors } from "@/constants/theme-colors";

export default function Streaming() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = themeColors[scheme];

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 bg-background">
        <ScreenHeader title="Streaming" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">Streaming</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
