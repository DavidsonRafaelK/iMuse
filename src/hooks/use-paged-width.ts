import { useWindowDimensions } from "react-native";

// Leave a peek of the next page visible so it reads as swipeable.
// Cap page width on wide/desktop viewports so rows don't stretch edge to edge.
export function usePagedWidth(maxWidth = 420) {
  const { width: windowWidth } = useWindowDimensions();
  return Math.min(windowWidth - 32, maxWidth);
}
