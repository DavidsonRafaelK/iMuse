import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { themeColors } from '@/constants/theme-colors';
import '@/global.css';

export default function RootLayout() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(themeColors[scheme].background);
  }, [scheme]);

  return (
    <GluestackUIProvider mode="system">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </GluestackUIProvider>
  );
}
