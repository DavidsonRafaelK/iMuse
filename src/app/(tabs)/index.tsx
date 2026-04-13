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
import { MoreVertical } from "lucide-react-native";

import { themeColors } from "@/constants/theme-colors";

const listenNowItems = [
  {
    id: "1",
    title: "Midnight Drive",
    genre: "Lo-fi",
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "2",
    title: "Golden Hour",
    genre: "Pop",
    image:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "3",
    title: "Keys & Strings",
    genre: "Jazz",
    image:
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=400&q=60",
  },
  {
    id: "4",
    title: "Stage Lights",
    genre: "Rock",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=400&q=60",
  },
];

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
];

const favouritePages = Array.from(
  { length: Math.ceil(favouriteItems.length / 4) },
  (_, i) => favouriteItems.slice(i * 4, i * 4 + 4),
);

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
  const favouritePageWidth = windowWidth - 32;

  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View className="flex-1 bg-background">
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
              <View key={item.id} className="w-64">
                <View className="relative">
                  <Image
                    source={{ uri: item.image }}
                    className="h-64 w-64 rounded-2xl border border-slate-50 dark:border-gray-800"
                  />
                  <Text className="absolute bottom-3 left-3 text-5xl font-semibold text-white">
                    {item.genre}
                  </Text>
                </View>
                <Text
                  className="mt-2 font-medium text-foreground text-xl"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </View>
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
            className="mt-3"
          >
            {favouritePages.map((page, pageIndex) => (
              <View key={pageIndex} style={{ width: favouritePageWidth }}>
                <View className="gap-3 pl-4 pr-6">
                  {page.map((item) => (
                    <View key={item.id} className="flex-row items-center gap-3">
                      <Image
                        source={{ uri: item.image }}
                        className="h-14 w-14 rounded-xl border border-slate-50 dark:border-gray-800"
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
                        onPress={() => console.log("options", item.id)}
                      >
                        <MoreVertical size={20} color={colors.mutedForeground} />
                      </Pressable>
                    </View>
                  ))}
                </View>
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
    </SafeAreaView>
  );
}
