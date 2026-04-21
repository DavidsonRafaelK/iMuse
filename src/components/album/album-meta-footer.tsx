import { Text, View } from "react-native";

import {
  getCopyrightLabel,
  getSongCountLabel,
  type ListenNowItem,
} from "@/data/listen-now";

export function AlbumMetaFooter({ album }: { album: ListenNowItem }) {
  return (
    <View className="mt-4 px-4">
      <Text className="text-sm text-muted-foreground">
        {album.releaseDate}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {getSongCountLabel(album)}
      </Text>
      <Text className="text-sm text-muted-foreground">
        {getCopyrightLabel(album)}
      </Text>
    </View>
  );
}
