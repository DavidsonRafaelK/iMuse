import { Text, View, StyleSheet } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text>Edit src/app/index.tsx to edit this screen.</Text>
      <Button onPress={() => console.log("pressed")}>
        <ButtonText>gluestack button</ButtonText>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
