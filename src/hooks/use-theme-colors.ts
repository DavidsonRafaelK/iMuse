import { useColorScheme } from "react-native";

import { themeColors } from "@/constants/theme-colors";

export function useThemeColors() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  return { scheme, colors: themeColors[scheme] };
}
