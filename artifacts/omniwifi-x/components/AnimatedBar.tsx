import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AnimatedBarProps {
  value: number;
  maxValue?: number;
  color?: string;
  height?: number;
}

export function AnimatedBar({
  value,
  maxValue = 1,
  color,
  height = 6,
}: AnimatedBarProps) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;
  const barColor = color ?? colors.primary;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(value / maxValue, 1),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [value, maxValue, anim]);

  return (
    <View style={[styles.track, { height, backgroundColor: colors.muted, borderRadius: height / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
            backgroundColor: barColor,
            width: anim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    width: "100%",
  },
  fill: {},
});
