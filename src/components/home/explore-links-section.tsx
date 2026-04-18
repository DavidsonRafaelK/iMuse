import { Pressable, Text, View } from "react-native";

import { exploreLinks } from "@/data/explore-links";

export function ExploreLinksSection() {
  return (
    <>
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
    </>
  );
}
