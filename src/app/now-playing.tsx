import { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { GestureDetector } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

import { FullPlayerHeader } from "@/components/now-playing/full-player-header";
import { LyricsList } from "@/components/now-playing/lyrics-list";
import { MinimalPlayerHeader } from "@/components/now-playing/minimal-player-header";
import { PlayerCoverView } from "@/components/now-playing/player-cover-view";
import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { dummyLyrics, DUMMY_CURRENT_LINE_INDEX } from "@/data/dummy-lyrics";
import { getActiveLyricIndex } from "@/data/real-song";
import { useCoverDragGesture } from "@/hooks/use-cover-drag-gesture";
import { useNowPlayingSong } from "@/hooks/use-now-playing-song";
import { useThemeColors } from "@/hooks/use-theme-colors";

export default function NowPlaying() {
  const {
    id,
    title: paramTitle,
    artist: paramArtist,
    image: paramImage,
  } = useLocalSearchParams<{
    id: string;
    title: string;
    artist: string;
    image: string;
  }>();
  const router = useRouter();
  const { colors } = useThemeColors();
  const [favourited, setFavourited] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [optionsSong, setOptionsSong] = useState<SongOptionsSong | null>(
    null,
  );

  const {
    title,
    canPlay,
    showCoverOnly,
    player,
    status,
    lyrics,
    displayArtist,
    displayImage,
    album,
    togglePlayback,
    hasNext,
    hasPrevious,
    goToNext,
    goToPrevious,
  } = useNowPlayingSong({
    id,
    title: paramTitle,
    artist: paramArtist,
    image: paramImage,
  });

  const lines = canPlay ? lyrics.map((line) => line.text) : dummyLyrics;
  const activeIndex = canPlay
    ? getActiveLyricIndex(lyrics, status.currentTime)
    : DUMMY_CURRENT_LINE_INDEX;

  const coverDrag = useCoverDragGesture(() => setExpanded(false));

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const openCover = () => {
    coverDrag.prepareOpen();
    setExpanded(true);
    coverDrag.animateOpen();
  };

  const openOptionsSheet = () =>
    setOptionsSong({ title, artist: displayArtist, image: displayImage, album });

  const coverView = (
    <PlayerCoverView
      image={displayImage}
      title={title}
      artist={displayArtist}
      canPlay={canPlay}
      playing={status.playing}
      currentTime={status.currentTime}
      duration={status.duration}
      onTogglePlayback={togglePlayback}
      onSeek={(seconds) => {
        if (canPlay) player.seekTo(seconds);
      }}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      onPrevious={goToPrevious}
      onNext={goToNext}
    />
  );

  if (showCoverOnly) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View className="flex-1 items-center bg-background">
          <MinimalPlayerHeader onBack={goBack} onOpenOptions={openOptionsSheet} />
          {coverView}
        </View>
        <SongOptionsSheet
          song={optionsSong}
          onClose={() => setOptionsSong(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 items-center bg-background">
        {expanded ? (
          <MinimalPlayerHeader onBack={goBack} onOpenOptions={openOptionsSheet} />
        ) : (
          <FullPlayerHeader
            image={displayImage}
            title={title}
            artist={displayArtist}
            canPlay={canPlay}
            playing={status.playing}
            favourited={favourited}
            onBack={goBack}
            onTitlePress={openCover}
            onTogglePlayback={togglePlayback}
            onToggleFavourite={() => setFavourited((value) => !value)}
            onOpenOptions={openOptionsSheet}
          />
        )}

        <View
          className="w-full flex-1 items-center"
          onLayout={coverDrag.onContentLayout}
        >
          <LyricsList
            lines={lines}
            activeIndex={activeIndex}
            onSeekToLine={(i) => {
              if (canPlay) player.seekTo(lyrics[i].time);
            }}
          />

          {expanded ? (
            <Animated.View
              style={[
                { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
                coverDrag.animatedStyle,
              ]}
            >
              <GestureDetector gesture={coverDrag.gesture}>
                <View className="w-full flex-1 items-center bg-background">
                  {coverView}
                </View>
              </GestureDetector>
            </Animated.View>
          ) : null}
        </View>
      </View>

      <SongOptionsSheet
        song={optionsSong}
        onClose={() => setOptionsSong(null)}
      />
    </SafeAreaView>
  );
}
