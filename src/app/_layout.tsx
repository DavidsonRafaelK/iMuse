import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { setAudioModeAsync } from "expo-audio";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { useThemeColors } from '@/hooks/use-theme-colors';
import '@/global.css';

export default function RootLayout() {
  const { scheme, colors } = useThemeColors();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  // expo-audio stops playback the moment the app is backgrounded, and the
  // media-playback foreground service is already declared, so ask for the
  // behaviour it exists for.
  //
  // playsInSilentMode has to be passed explicitly even though true is its
  // default: setAudioModeAsync overwrites the native field with whatever
  // this object holds, so leaving it out sets it to undefined and playback
  // gets suppressed whenever the ringer is on silent.
  //
  // interruptionMode must be 'doNotMix' for setActiveForLockScreen (used in
  // useNowPlayingSong) to work — otherwise the OS won't associate lock
  // screen controls with our player and background playback still caps out
  // around 3 minutes.
  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    }).catch((error) => {
      // Not fatal — playback still works, it just keeps the stricter defaults.
      console.warn("Couldn't configure the audio session:", error);
    });
  }, []);

  return (
    // Gesture handlers are inert on Android without this at the root, so it
    // has to wrap everything the app renders.
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
