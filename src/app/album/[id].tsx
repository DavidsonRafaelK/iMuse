import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BlurTargetView } from "expo-blur";
import {
  ArrowLeft,
  Check,
  MoreVertical,
  Play,
  Plus,
  Share2,
  Shuffle,
} from "lucide-react-native";

import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { themeColors } from "@/constants/theme-colors";
import { listenNowItems } from "@/data/listen-now";

export default function AlbumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = themeColors[scheme];
  const [selectedSong, setSelectedSong] = useState<SongOptionsSong | null>(
    null,
  );
  const [shuffleOn, setShuffleOn] = useState(false);
  const [added, setAdded] = useState(false);
  const blurTargetRef = useRef<View>(null);

  const album = listenNowItems.find((item) => item.id === id);

  if (!album) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View className="flex-1 items-center justify-center bg-background">
          <Text className="text-foreground">Album not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
      <View className="flex-1 bg-background">
        <View className="flex-row items-center justify-between px-4 py-2">
          <Pressable className="p-2" onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={22} />
          </Pressable>
          <View className="flex-row items-center gap-2">
            <Pressable className="p-2" onPress={() => console.log("share")}>
              <Share2 color={colors.foreground} size={20} />
            </Pressable>
            <Pressable className="p-2" onPress={() => console.log("more")}>
              <MoreVertical color={colors.foreground} size={22} />
            </Pressable>
          </View>
        </View>

        <ScrollView contentContainerClassName="pb-8">
          <View className="items-center px-4 pt-2">
            <Image
              source={{ uri: album.image }}
              className="h-72 w-72 rounded-2xl border border-slate-50 dark:border-gray-800"
            />
            <Text className="mt-4 text-center text-2xl font-bold text-foreground">
              {album.title}
            </Text>
            <Text className="mt-1 text-center text-lg text-muted-foreground">
              {album.artist}
            </Text>
            <Text className="mt-1 text-center text-sm text-muted-foreground">
              {album.genre} {album.year}
            </Text>

            <View className="mt-6 flex-row items-center gap-4">
              <Pressable
                className={
                  shuffleOn
                    ? "h-12 w-12 items-center justify-center rounded-full bg-foreground"
                    : "h-12 w-12 items-center justify-center rounded-full bg-secondary"
                }
                onPress={() => setShuffleOn((value) => !value)}
              >
                <Shuffle
                  color={shuffleOn ? colors.background : colors.foreground}
                  size={20}
                />
              </Pressable>
              <Pressable
                className="flex-row items-center gap-2 rounded-full bg-foreground px-8 py-3"
                onPress={() => console.log("play")}
              >
                <Play color={colors.background} size={18} fill={colors.background} />
                <Text className="font-semibold text-background">Play</Text>
              </Pressable>
              <Pressable
                className={
                  added
                    ? "h-12 w-12 items-center justify-center rounded-full bg-foreground"
                    : "h-12 w-12 items-center justify-center rounded-full bg-secondary"
                }
                onPress={() => setAdded((value) => !value)}
              >
                {added ? (
                  <Check color={colors.background} size={20} />
                ) : (
                  <Plus color={colors.foreground} size={20} />
                )}
              </Pressable>
            </View>
          </View>

          <View className="mt-6 px-4">
            {album.tracks.map((track, i) => (
              <View
                key={track.title}
                className="flex-row items-center gap-3 py-3"
              >
                <Text className="w-5 text-muted-foreground">{i + 1}</Text>
                <Text className="flex-1 text-foreground" numberOfLines={1}>
                  {track.title}
                </Text>
                <Pressable
                  className="p-2"
                  onPress={() =>
                    setSelectedSong({
                      title: track.title,
                      artist: album.artist,
                      album: album.title,
                      image: album.image,
                    })
                  }
                >
                  <MoreVertical size={18} color={colors.mutedForeground} />
                </Pressable>
              </View>
            ))}
          </View>

          <View className="mt-4 px-4">
            <Text className="text-sm text-muted-foreground">
              {album.releaseDate}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {album.duration}
            </Text>
            <Text className="text-sm text-muted-foreground">
              {album.copyright}
            </Text>
          </View>
        </ScrollView>
      </View>
      </BlurTargetView>
      <SongOptionsSheet
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        blurTarget={blurTargetRef}
      />
    </SafeAreaView>
  );
}
