import { useRef, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import { BlurTargetView } from "expo-blur";
import { ChevronRight, MoreVertical } from "lucide-react-native";

import { ScreenHeader } from "@/components/screen-header";
import { SongOptionsSheet, type SongOptionsSong } from "@/components/song-options-sheet";
import { themeColors } from "@/constants/theme-colors";
import { listenNowItems } from "@/data/listen-now";


const favouriteItems = [
  {
    id: "1",
    title: "Blinding Lights",
    artist: "The Weeknd",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "2",
    title: "Levitating",
    artist: "Dua Lipa",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "3",
    title: "As It Was",
    artist: "Harry Styles",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "4",
    title: "Flowers",
    artist: "Miley Cyrus",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "5",
    title: "Anti-Hero",
    artist: "Taylor Swift",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "6",
    title: "Peaches",
    artist: "Justin Bieber",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "7",
    title: "Cruel Summer",
    artist: "Taylor Swift",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "8",
    title: "Watermelon Sugar",
    artist: "Harry Styles",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "9",
    title: "Stay",
    artist: "The Kid LAROI, Justin Bieber",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "10",
    title: "Good 4 U",
    artist: "Olivia Rodrigo",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "11",
    title: "Vampire",
    artist: "Olivia Rodrigo",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "12",
    title: "Espresso",
    artist: "Sabrina Carpenter",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "13",
    title: "Lovin On Me",
    artist: "Jack Harlow",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "14",
    title: "Paint The Town Red",
    artist: "Doja Cat",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "15",
    title: "Cruel Summer (Live)",
    artist: "Taylor Swift",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "16",
    title: "Snooze",
    artist: "SZA",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "17",
    title: "Greedy",
    artist: "Tate McRae",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "18",
    title: "Houdini",
    artist: "Dua Lipa",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "19",
    title: "Beautiful Things",
    artist: "Benson Boone",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "20",
    title: "Lose Control",
    artist: "Teddy Swims",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "21",
    title: "Yes, And?",
    artist: "Ariana Grande",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=200&q=60",
  },
  {
    id: "22",
    title: "Please Please Please",
    artist: "Sabrina Carpenter",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=200&q=60",
  },
];

const favouritePages = Array.from(
  { length: Math.ceil(favouriteItems.length / 4) },
  (_, i) => favouriteItems.slice(i * 4, i * 4 + 4),
);

const newThisWeekItems = [
  {
    id: "1",
    title: "The User's Guide to Being Human",
    artist: "The Script",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "2",
    title: "Mercury Comet",
    artist: "Smash Mouth",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "3",
    title: "Pony EP",
    artist: "GLU",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "4",
    title: "Afterglow",
    artist: "Nova Rae",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "5",
    title: "Static Bloom",
    artist: "Wren Halley",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "6",
    title: "Fever Dream",
    artist: "The Night Owls",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "7",
    title: "Paper Planes EP",
    artist: "Corner Store",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "8",
    title: "Velvet Hour",
    artist: "Lune Marchetti",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "9",
    title: "低音のうた",
    artist: "Riko Amano",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "10",
    title: "Backroads",
    artist: "Callum Fisk",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "11",
    title: "Glow EP",
    artist: "Marina Cole",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "12",
    title: "Tape Deck",
    artist: "The Analog Kids",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "13",
    title: "Roots & Static",
    artist: "Delta Fold",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "14",
    title: "Citrus",
    artist: "Faye Odell",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "15",
    title: "Long Way Home EP",
    artist: "Harbor Line",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "16",
    title: "Nightshift",
    artist: "Onyx Parade",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "17",
    title: "Quiet Static",
    artist: "Elin Vance",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "18",
    title: "Sunroom",
    artist: "Later Days",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
];

const recentReleasesItems = [
  {
    id: "1",
    title: "Kana Nishino Summer Song Sel...",
    artist: "Kana Nishino",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "2",
    title: "petal",
    artist: "Ariana Grande",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "3",
    title: "One Mic",
    artist: "Above & Beyond",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "4",
    title: "Daylight",
    artist: "Marlo Reyes",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "5",
    title: "Slow Burn",
    artist: "Iris Calloway",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "6",
    title: "Coastline",
    artist: "Reef & Company",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "7",
    title: "Midnight Radio",
    artist: "DJ Wavelength",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "8",
    title: "Glasshouse",
    artist: "Priya Sen",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "9",
    title: "Halfway There",
    artist: "Gemma Ross",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "10",
    title: "Low Tide",
    artist: "Bram & the Coast",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "11",
    title: "Constellations",
    artist: "Yuna Park",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "12",
    title: "Wildflower",
    artist: "Cass Novak",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "13",
    title: "Second Wind",
    artist: "Ambrose Lee",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "14",
    title: "City Lights EP",
    artist: "Nadia Frost",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "15",
    title: "Echo Chamber",
    artist: "The Signal",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "16",
    title: "Golden Hour Reprise",
    artist: "Soren Vale",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "17",
    title: "Rooftop Sessions",
    artist: "Mabel & June",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=300&q=60",
  },
  {
    id: "18",
    title: "Neon Blue",
    artist: "Kito Ren",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=60",
  },
];

const exploreLinks = [
  "Concerts",
  "Browse by Genre",
  "Decades",
  "Moods and Activities",
  "Worldwide",
  "Charts",
  "Spatial Audio",
];

export default function Home() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = themeColors[scheme];
  const { width: windowWidth } = useWindowDimensions();
  // Leave a peek of the next page visible so it reads as swipeable.
  // Cap page width on wide/desktop viewports so rows don't stretch edge to edge.
  const favouritePageWidth = Math.min(windowWidth - 32, 420);

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
          <View className="px-4 pt-4">
            <Text className="text-xl font-semibold uppercase tracking-wide text-muted-foreground">
              New
            </Text>
            <Text className="mt-1 text-5xl font-bold text-foreground">
              Listen Now
            </Text>
            <Text className="mt-1 text-md text-muted-foreground">
              Fresh tracks handpicked for your mood today.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-4"
            contentContainerClassName="gap-4 px-4"
          >
            {listenNowItems.map((item) => (
              <Link key={item.id} href={`/album/${item.id}`} asChild>
                <Pressable className="w-64">
                  <View className="relative">
                    <Image
                      source={{ uri: item.image }}
                      className="h-64 w-64 rounded-2xl border border-slate-50 dark:border-gray-800"
                    />
                    <Text
                      className="absolute bottom-3 left-3 right-3 text-sm text-white"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                  <Text
                    className="mt-2 font-medium text-foreground text-xl"
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                </Pressable>
              </Link>
            ))}
          </ScrollView>

          <View className="mt-8 px-4">
            <Text className="text-4xl font-bold text-foreground">
              Favourite
            </Text>
            <Text className="mt-1 text-md text-muted-foreground">
              Songs you keep coming back to.
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={favouritePageWidth}
            decelerationRate="fast"
            disableIntervalMomentum
            className="mt-3"
          >
            {favouritePages.map((page, pageIndex) => (
              <View key={pageIndex} style={{ width: favouritePageWidth }}>
                <View className="gap-3 pl-4 pr-6">
                  {page.map((item) => (
                    <View key={item.id} className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: item.image }}
                        className="h-14 w-14 rounded-2xl border border-slate-50 dark:border-gray-800"
                      />
                      <View className="flex-1">
                        <Text
                          className="font-medium text-foreground"
                          numberOfLines={1}
                        >
                          {item.title}
                        </Text>
                        <Text
                          className="text-sm text-muted-foreground"
                          numberOfLines={1}
                        >
                          {item.artist}
                        </Text>
                      </View>
                      <Pressable
                        className="p-2"
                        onPress={() =>
                          setSelectedSong({
                            title: item.title,
                            artist: item.artist,
                            image: item.image,
                          })
                        }
                      >
                        <MoreVertical size={20} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable className="mt-8 flex-row items-center gap-1 px-4">
            <Text className="text-2xl font-bold text-foreground">
              New This Week
            </Text>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerClassName="gap-4 px-4"
          >
            {newThisWeekItems.map((item) => (
              <View key={item.id} className="w-36">
                <Image
                  source={{ uri: item.image }}
                  className="h-36 w-36 rounded-2xl border border-slate-50 dark:border-gray-800"
                />
                <Text
                  className="mt-2 font-medium text-foreground"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-sm text-muted-foreground"
                  numberOfLines={1}
                >
                  {item.artist}
                </Text>
              </View>
            ))}
          </ScrollView>

          <Pressable className="mt-8 flex-row items-center gap-1 px-4">
            <Text className="text-2xl font-bold text-foreground">
              Recent Releases
            </Text>
            <ChevronRight size={20} color={colors.mutedForeground} />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerClassName="gap-4 px-4"
          >
            {recentReleasesItems.map((item) => (
              <View key={item.id} className="w-36">
                <Image
                  source={{ uri: item.image }}
                  className="h-36 w-36 rounded-2xl border border-slate-50 dark:border-gray-800"
                />
                <Text
                  className="mt-2 font-medium text-foreground"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <Text
                  className="text-sm text-muted-foreground"
                  numberOfLines={1}
                >
                  {item.artist}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View className="mt-8 px-4">
            <Text className="text-4xl font-bold text-foreground">
              More to Explore
            </Text>
          </View>

          <View className="mt-3 px-4">
            {exploreLinks.map((label, i) => (
              <Pressable
                key={label}
                className={`py-4 ${
                  i !== exploreLinks.length - 1 ? "border-b border-border" : ""
                }`}
                onPress={() => console.log("explore", label)}
              >
                <Text className="text-lg font-medium text-foreground">
                  {label}
                </Text>
              </Pressable>
            ))}
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
