import { useRef, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurTargetView } from "expo-blur";

import { ScreenHeader } from "@/components/screen-header";
import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { AlbumRowSection } from "@/components/home/album-row-section";
import { ExploreLinksSection } from "@/components/home/explore-links-section";
import { FavouriteSection } from "@/components/home/favourite-section";
import { ListenNowSection } from "@/components/home/listen-now-section";
import { newThisWeekItems, recentReleasesItems } from "@/data/album-collections";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function Home() {
  const { colors } = useThemeColors();
  const [selectedSong, setSelectedSong] = useState<SongOptionsSong | null>(
    null,
  );
  const blurTargetRef = useRef<View>(null);

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
        <View className="flex-1 bg-background">
          <ScreenHeader title="Home" />
          <ScrollView contentContainerClassName="pb-8">
            <ListenNowSection />
            <FavouriteSection onSelectSong={setSelectedSong} />
            <AlbumRowSection title="New This Week" items={newThisWeekItems} />
            <AlbumRowSection
              title="Recent Releases"
              items={recentReleasesItems}
            />
            <ExploreLinksSection />
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
