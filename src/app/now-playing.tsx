import { useEffect, useRef, useState } from "react";
import { Image, PanResponder, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronDown, MoreVertical, Pause, Play, Star } from "lucide-react-native";

import { PlayerCoverView } from "@/components/now-playing/player-cover-view";
import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { getActiveLyricIndex, realSong, useRealSongMetadata } from "@/data/real-song";

const dummyLyrics = [
  "Woke up to the sound of static",
  "Coffee's cold but I don't mind",
  "The sun goes down, and so does she",
  "Oh",
  "Count",
  "Count your blessings",
  "Come on",
  "Count your blessings, 'cause I'm counting every",
  "Second that you're gone",
  "Second that you're gone",
];

const DUMMY_CURRENT_LINE_INDEX = 2;

export default function NowPlaying() {
  const { id, title, artist, image } = useLocalSearchParams<{
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

  const isRealSong = id === realSong.id;
  const player = useAudioPlayer(isRealSong ? realSong.audioSource : null);
  const status = useAudioPlayerStatus(player);
  const realSongMetadata = useRealSongMetadata();
  const realLyrics = isRealSong ? realSongMetadata?.lyrics ?? [] : [];

  const lines = isRealSong ? realLyrics.map((line) => line.text) : dummyLyrics;
  const activeIndex = isRealSong
    ? getActiveLyricIndex(realLyrics, status.currentTime)
    : DUMMY_CURRENT_LINE_INDEX;

  const lyricsScrollRef = useRef<ScrollView>(null);
  const lineLayouts = useRef<{ y: number; height: number }[]>([]);
  const [lyricsViewportHeight, setLyricsViewportHeight] = useState(0);

  useEffect(() => {
    const layout = lineLayouts.current[activeIndex];
    if (!layout || !lyricsViewportHeight) return;
    const centeredY = layout.y + layout.height / 2 - lyricsViewportHeight / 2;
    lyricsScrollRef.current?.scrollTo({
      y: Math.max(centeredY, 0),
      animated: true,
    });
  }, [activeIndex, lyricsViewportHeight]);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const togglePlayback = () => {
    if (!isRealSong) return;
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  // 0 = cover fully covering the screen, -contentHeight = swiped fully away (lyrics revealed).
  const translateY = useSharedValue(0);
  const contentHeightRef = useRef(0);
  const dragStartRef = useRef(0);

  const openCover = () => {
    contentHeightRef.current ||= 1;
    translateY.value = -contentHeightRef.current;
    setExpanded(true);
    translateY.value = withTiming(0, { duration: 260 });
  };

  const coverPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dy) > 8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderGrant: () => {
        dragStartRef.current = translateY.value;
      },
      onPanResponderMove: (_, gesture) => {
        const height = contentHeightRef.current || 1;
        const next = dragStartRef.current + gesture.dy;
        translateY.value = Math.min(0, Math.max(next, -height));
      },
      onPanResponderRelease: () => {
        const height = contentHeightRef.current || 1;
        if (translateY.value < -height / 3) {
          translateY.value = withTiming(-height, { duration: 220 });
          setExpanded(false);
        } else {
          translateY.value = withTiming(0, { duration: 220 });
        }
      },
    }),
  ).current;

  const coverAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 items-center bg-background">
        <View className="w-full max-w-2xl flex-row items-center gap-3 px-4 py-2">
          <Pressable className="p-2" onPress={goBack}>
            <ChevronDown color={colors.foreground} size={22} />
          </Pressable>
          {expanded ? (
            <View className="flex-1" />
          ) : (
            <>
              <Image
                source={{ uri: image }}
                className="h-12 w-12 rounded-md"
              />
              <Pressable className="flex-1" onPress={openCover}>
                <Text
                  className="font-semibold text-foreground"
                  numberOfLines={1}
                >
                  {title}
                </Text>
                <Text
                  className="text-sm text-muted-foreground"
                  numberOfLines={1}
                >
                  {artist}
                </Text>
              </Pressable>
              <Pressable
                className={
                  isRealSong
                    ? "h-9 w-9 items-center justify-center rounded-full bg-foreground"
                    : "h-9 w-9 items-center justify-center rounded-full bg-secondary"
                }
                onPress={togglePlayback}
              >
                {status.playing ? (
                  <Pause
                    color={isRealSong ? colors.background : colors.foreground}
                    fill={isRealSong ? colors.background : "transparent"}
                    size={16}
                  />
                ) : (
                  <Play
                    color={isRealSong ? colors.background : colors.foreground}
                    fill={isRealSong ? colors.background : "transparent"}
                    size={16}
                  />
                )}
              </Pressable>
              <Pressable
                className={
                  favourited
                    ? "h-9 w-9 items-center justify-center rounded-full bg-foreground"
                    : "h-9 w-9 items-center justify-center rounded-full bg-secondary"
                }
                onPress={() => setFavourited((value) => !value)}
              >
                <Star
                  color={favourited ? colors.background : colors.foreground}
                  fill={favourited ? colors.background : "transparent"}
                  size={16}
                />
              </Pressable>
            </>
          )}
          <Pressable
            className="h-9 w-9 items-center justify-center rounded-full bg-secondary"
            onPress={() =>
              setOptionsSong({
                title,
                artist,
                image,
                album: isRealSong ? realSongMetadata?.album : undefined,
              })
            }
          >
            <MoreVertical color={colors.foreground} size={18} />
          </Pressable>
        </View>

        <View
          className="w-full flex-1 items-center"
          onLayout={(e) => {
            contentHeightRef.current = e.nativeEvent.layout.height;
          }}
        >
          <ScrollView
            ref={lyricsScrollRef}
            className="w-full max-w-2xl"
            contentContainerClassName="gap-6 px-6 py-8"
            onLayout={(e) => setLyricsViewportHeight(e.nativeEvent.layout.height)}
          >
            {/* Padding so even the first/last lines have room to scroll to center. */}
            <View style={{ height: lyricsViewportHeight / 2 }} />
            {lines.map((line, i) => {
              const distance = Math.abs(i - activeIndex);
              const isCurrent = i === activeIndex;
              return (
                <Pressable
                  key={`${line}-${i}`}
                  onLayout={(e) => {
                    lineLayouts.current[i] = {
                      y: e.nativeEvent.layout.y,
                      height: e.nativeEvent.layout.height,
                    };
                  }}
                  onPress={() => {
                    if (isRealSong) {
                      player.seekTo(realLyrics[i].time);
                    }
                  }}
                >
                  <Text
                    className={
                      isCurrent
                        ? "text-5xl font-bold text-foreground"
                        : "text-5xl font-bold text-muted-foreground"
                    }
                    style={{ opacity: isCurrent ? 1 : Math.max(0.15, 0.55 - distance * 0.12) }}
                  >
                    {line}
                  </Text>
                </Pressable>
              );
            })}
            <View style={{ height: lyricsViewportHeight / 2 }} />
          </ScrollView>

          {expanded ? (
            <Animated.View
              style={[
                {
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
                coverAnimatedStyle,
              ]}
            >
              <View
                className="w-full flex-1 items-center bg-background"
                {...coverPanResponder.panHandlers}
              >
                <PlayerCoverView
                  image={image}
                  title={title}
                  artist={artist}
                  isRealSong={isRealSong}
                  playing={status.playing}
                  currentTime={status.currentTime}
                  duration={status.duration}
                  onTogglePlayback={togglePlayback}
                  onSeek={(seconds) => {
                    if (isRealSong) player.seekTo(seconds);
                  }}
                />
              </View>
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
