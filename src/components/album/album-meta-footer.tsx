import { Text, View } from "react-native";

export function AlbumMetaFooter({
  releaseDate,
  duration,
  copyright,
}: {
  releaseDate: string;
  duration: string;
  copyright: string;
}) {
  return (
    <View className="mt-4 px-4">
      <Text className="text-sm text-muted-foreground">{releaseDate}</Text>
      <Text className="text-sm text-muted-foreground">{duration}</Text>
      <Text className="text-sm text-muted-foreground">{copyright}</Text>
    </View>
  );
}
