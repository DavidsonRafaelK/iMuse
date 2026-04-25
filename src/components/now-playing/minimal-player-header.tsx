import { Pressable, View } from "react-native";
import { ChevronDown, MoreVertical } from "lucide-react-native";

import { useThemeColors } from "@/hooks/use-theme-colors";

// Just back + options — used for the cover-only screen (no lyrics to toggle
// to) and for the main screen while the cover is swiped open.
export function MinimalPlayerHeader({
  onBack,
  onOpenOptions,
}: {
  onBack: () => void;
  onOpenOptions: () => void;
}) {
  const { colors } = useThemeColors();

  return (
    <View className="w-full max-w-2xl flex-row items-center justify-between px-4 py-2">
      <Pressable className="p-2" onPress={onBack}>
        <ChevronDown color={colors.foreground} size={22} />
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
