import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScreenHeader } from "@/components/screen-header";
import { useThemeColors } from "@/hooks/use-theme-colors";

export function PlaceholderScreen({ title }: { title: string }) {
  const { colors } = useThemeColors();

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 bg-background">
        <ScreenHeader title={title} />
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">{title}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
