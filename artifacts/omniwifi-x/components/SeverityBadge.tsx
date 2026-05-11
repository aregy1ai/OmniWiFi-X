import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

type Severity = "low" | "medium" | "high" | "critical";

interface SeverityBadgeProps {
  severity: Severity;
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const colors = useColors();

  const config: Record<Severity, { bg: string; text: string; label: string }> = {
    low: { bg: colors.muted, text: colors.mutedForeground, label: "LOW" },
    medium: { bg: colors.warning + "22", text: colors.warning, label: "MED" },
    high: { bg: colors.destructive + "22", text: colors.destructive, label: "HIGH" },
    critical: { bg: colors.destructive + "44", text: colors.destructive, label: "CRIT" },
  };

  const { bg, text, label } = config[severity];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
});
