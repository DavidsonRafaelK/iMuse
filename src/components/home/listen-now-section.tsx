import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { Link } from "expo-router";

import { listenNowItems } from "@/data/listen-now";

export function ListenNowSection() {
  return (
    <>
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
                className="mt-2 text-xl font-medium text-foreground"
                numberOfLines={1}
              >
                {item.title}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </>
  );
}
