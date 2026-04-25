import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export function LyricsList({
  lines,
  activeIndex,
  onSeekToLine,
}: {
  lines: string[];
  activeIndex: number;
  onSeekToLine: (index: number) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const lineLayouts = useRef<{ y: number; height: number }[]>([]);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const layout = lineLayouts.current[activeIndex];
    if (!layout || !viewportHeight) return;
    const centeredY = layout.y + layout.height / 2 - viewportHeight / 2;
    scrollRef.current?.scrollTo({ y: Math.max(centeredY, 0), animated: true });
  }, [activeIndex, viewportHeight]);

  return (
    <ScrollView
      ref={scrollRef}
      className="w-full max-w-2xl"
      contentContainerClassName="gap-6 px-6 py-8"
      onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
    >
      {/* Padding so even the first/last lines have room to scroll to center. */}
      <View style={{ height: viewportHeight / 2 }} />
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
            onPress={() => onSeekToLine(i)}
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
      <View style={{ height: viewportHeight / 2 }} />
    </ScrollView>
  );
}
