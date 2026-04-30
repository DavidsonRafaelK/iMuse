import type { LayoutChangeEvent } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// Drives the cover player overlay: 0 = fully covering the screen,
// -contentHeight = swiped fully away (lyrics revealed underneath).
//
// The drag runs entirely on the UI thread. Both the offset and the measured
// height are shared values rather than refs, so the gesture never has to hop
// back to JS mid-swipe and nothing here is read or mutated during render.
export function useCoverDragGesture(onCollapse: () => void) {
  const translateY = useSharedValue(0);
  const contentHeight = useSharedValue(0);
  const dragStart = useSharedValue(0);

  const onContentLayout = (event: LayoutChangeEvent) => {
    contentHeight.value = event.nativeEvent.layout.height;
  };

  // Jump the cover off-screen before it mounts, so the caller can animate
  // it sliding back into place right after.
  const prepareOpen = () => {
    // Before the first layout there's no real height to work with; any
    // non-zero value is enough to park the cover out of sight.
    if (contentHeight.value === 0) contentHeight.value = 1;
    translateY.value = -contentHeight.value;
  };
  const animateOpen = () => {
    translateY.value = withTiming(0, { duration: 260 });
  };

  const gesture = Gesture.Pan()
    // Vertical drags only — a mostly-sideways swipe should reach whatever is
    // underneath instead of dragging the cover.
    .activeOffsetY([-8, 8])
    .failOffsetX([-8, 8])
    .onStart(() => {
      dragStart.value = translateY.value;
    })
    .onUpdate((event) => {
      const height = contentHeight.value || 1;
      translateY.value = Math.min(
        0,
        Math.max(dragStart.value + event.translationY, -height),
      );
    })
    .onEnd(() => {
      const height = contentHeight.value || 1;
      if (translateY.value < -height / 3) {
        translateY.value = withTiming(-height, { duration: 220 });
        runOnJS(onCollapse)();
      } else {
        translateY.value = withTiming(0, { duration: 220 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    gesture,
    onContentLayout,
    animatedStyle,
    prepareOpen,
    animateOpen,
  };
}
