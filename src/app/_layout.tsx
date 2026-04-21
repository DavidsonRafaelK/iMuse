import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useThemeColors } from '@/hooks/use-theme-colors';
import '@/global.css';

export default function RootLayout() {
  const { scheme, colors } = useThemeColors();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  return (
    <GluestackUIProvider mode="system">
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="album/[id]" options={{ animation: "fade" }} />
        <Stack.Screen
          name="now-playing"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
