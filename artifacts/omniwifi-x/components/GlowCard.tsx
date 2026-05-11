import React from "react";
import { Platform, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface GlowCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  glowColor?: string;
  intensity?: number;
}

export function GlowCard({ children, style, glowColor, intensity = 1 }: GlowCardProps) {
  const colors = useColors();
  const glow = glowColor ?? colors.primary;

  const isWeb = Platform.OS === "web";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: glow + "33",
          ...(isWeb
            ? { boxShadow: `0 0 12px ${glow}${Math.round(40 * intensity).toString(16).padStart(2, "0")}` } as any
            : {
                shadowColor: glow,
                shadowOpacity: 0.25 * intensity,
                shadowOffset: { width: 0, height: 0 },
                shadowRadius: 12,
                elevation: 4,
              }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
});
