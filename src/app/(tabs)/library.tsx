import { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Music } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import {
  chooseMusicFolder,
  listMusicFiles,
  useMusicFolder,
  type MusicFile,
} from "@/data/music-folder";

import { FALLBACK_IMAGE } from "@/data/real-song";
import { usePlaySong } from "@/hooks/use-play-song";
import { useThemeColors } from "@/hooks/use-theme-colors";

// Stable identity so an unreadable folder doesn't hand a fresh array down
// on every render.
const EMPTY_FILES: MusicFile[] = [];

export default function Library() {
  const { colors } = useThemeColors();
  const folder = useMusicFolder();
  const playSong = usePlaySong();
  const supported = Platform.OS !== "web";

  const [pickError, setPickError] = useState<string | null>(null);

  const listing = useMemo(
    () => (folder ? listMusicFiles(folder.uri) : null),
    [folder],
  );
  const files = listing?.ok ? listing.files : EMPTY_FILES;

  // No id: these songs aren't in the app's catalogue, and each file's
  // content:// URI travels via the queue's localUri rather than route params.
  const queueSongs = useMemo(
    () =>
      files.map((file) => ({
        title: file.name,
        artist: "",
        image: FALLBACK_IMAGE,
        localUri: file.uri,
      })),
    [files],
  );

  const error =
    pickError ??
    (listing && !listing.ok
      ? "Couldn't open this folder. Choose it again to restore access."
      : null);

  const handleChooseFolder = async () => {
    setPickError(null);
    try {
      // Resolves to null when the user backs out, which needs no message.
      await chooseMusicFolder();
    } catch (caught) {
      console.warn("Couldn't pick a music folder:", caught);
      setPickError("Couldn't open the folder picker. Try again.");
    }
  };

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 bg-background">
        <ScreenHeader title="Library" />

        {folder ? (
          <View className="flex-1">
            <View className="px-4 pt-2">
              <Text
                className="text-sm text-muted-foreground"
                numberOfLines={1}
              >
                {folder.name}
              </Text>
            </View>

            {files.length === 0 ? (
              <View className="flex-1 items-center justify-center px-8">
                <Text className="text-center text-muted-foreground">
                  {error ?? "No songs found in this folder."}
                </Text>
              </View>
            ) : (
              <ScrollView contentContainerClassName="mt-3 px-4 pb-8">
                {files.map((file, index) => (
                  <Pressable
                    key={file.uri}
                    className="flex-row items-center gap-3 py-3"
                    onPress={() =>
                      playSong(queueSongs[index], { queue: queueSongs, index })
                    }
                  >
                    <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                      <Music size={20} color={colors.mutedForeground} />
                    </View>
                    <Text
                      className="flex-1 font-medium text-foreground"
                      numberOfLines={1}
                    >
                      {file.name}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <View className="flex-1 items-center justify-center px-8">
            <Text className="text-center text-3xl font-bold text-foreground">
              Your music everywhere.
            </Text>
            <Text className="mt-3 text-center text-base text-muted-foreground">
              Pick a folder on this device to store the songs you add to
              iMuse. Everything you save will live right there.
            </Text>

            <Pressable
              className={
                supported
                  ? "mt-6 items-center rounded-full bg-foreground px-8 py-4"
                  : "mt-6 items-center rounded-full bg-secondary px-8 py-4"
              }
              disabled={!supported}
              onPress={handleChooseFolder}
            >
              <Text
                className={
                  supported
                    ? "text-base font-semibold text-background"
                    : "text-base font-semibold text-muted-foreground"
                }
              >
                {supported ? "Choose Folder" : "Not available on web"}
              </Text>
            </Pressable>

            {error ? (
              <Text className="mt-4 text-center text-sm text-muted-foreground">
                {error}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
