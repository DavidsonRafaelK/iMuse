import { useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { BlurTargetView } from "expo-blur";

import { AlbumDetailHeader } from "@/components/album/album-detail-header";
import { AlbumHero } from "@/components/album/album-hero";
import { AlbumMetaFooter } from "@/components/album/album-meta-footer";
import { AlbumTracklist } from "@/components/album/album-tracklist";
import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { listenNowItems } from "@/data/listen-now";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function AlbumDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useThemeColors();
  const [selectedSong, setSelectedSong] = useState<SongOptionsSong | null>(
    null,
  );
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
          <AlbumDetailHeader />

          <ScrollView contentContainerClassName="pb-8">
            <AlbumHero album={album} />
            <AlbumTracklist
              tracks={album.tracks}
              album={album}
              onSelectTrack={setSelectedSong}
            />
            <AlbumMetaFooter
              releaseDate={album.releaseDate}
              duration={album.duration}
              copyright={album.copyright}
            />
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
