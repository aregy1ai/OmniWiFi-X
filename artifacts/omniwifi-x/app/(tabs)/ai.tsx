import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedBar } from "@/components/AnimatedBar";
import { GlowCard } from "@/components/GlowCard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { AnomalyResult, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

function AnomalyCard({ item, index }: { item: AnomalyResult; index: number }) {
  const colors = useColors();
  const severityColors: Record<string, string> = {
    low: colors.mutedForeground,
    medium: colors.warning,
    high: colors.destructive,
    critical: colors.destructive,
  };
  const glowColor = severityColors[item.severity] ?? colors.primary;
  const elapsed = Math.round((Date.now() - item.timestamp) / 1000);
  const timeStr = elapsed < 60 ? `${elapsed}s ago` : `${Math.round(elapsed / 60)}m ago`;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <GlowCard style={styles.anomalyCard} glowColor={glowColor}>
        <View style={styles.anomalyTop}>
          <SeverityBadge severity={item.severity} />
          <Text style={[styles.timeAgo, { color: colors.mutedForeground }]}>
            {timeStr}
          </Text>
        </View>
        <Text style={[styles.anomalyType, { color: colors.foreground }]}>
          {item.type}
        </Text>
        <Text style={[styles.anomalyDesc, { color: colors.mutedForeground }]}>
          {item.description}
        </Text>
        <View style={styles.scoreRow}>
          <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
            Confidence
          </Text>
          <Text style={[styles.scoreValue, { color: glowColor }]}>
            {(item.score * 100).toFixed(1)}%
          </Text>
        </View>
        <AnimatedBar value={item.score} color={glowColor} height={5} />
      </GlowCard>
    </Animated.View>
  );
}

export default function AIScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { anomalies, isRunningAI, startAI, networks } = useApp();
  const isWeb = Platform.OS === "web";

  const threatCounts = anomalies.reduce(
    (acc, a) => {
      acc[a.severity] = (acc[a.severity] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: isWeb ? 67 + 16 : insets.top + 16,
            borderBottomColor: colors.border,
            backgroundColor: colors.background,
          },
        ]}
      >
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            AI ANALYSIS ENGINE
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Threat Intel
          </Text>
        </View>
        <Pressable
          onPress={() => {
            if (!isRunningAI) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              startAI();
            }
          }}
          style={({ pressed }) => [
            styles.analyzeBtn,
            {
              backgroundColor: isRunningAI
                ? colors.muted
                : colors.primary + "22",
              borderColor: isRunningAI ? colors.border : colors.primary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          {isRunningAI ? (
            <ActivityIndicator size={16} color={colors.primary} />
          ) : (
            <Feather name="cpu" size={16} color={colors.primary} />
          )}
          <Text style={[styles.analyzeBtnText, { color: colors.primary }]}>
            {isRunningAI ? "Analyzing" : "Run AI"}
          </Text>
        </Pressable>
      </View>

      {anomalies.length > 0 && (
        <View style={[styles.summary, { borderBottomColor: colors.border }]}>
          {(["critical", "high", "medium", "low"] as const).map((s) =>
            threatCounts[s] ? (
              <View key={s} style={styles.summaryItem}>
                <Text style={[styles.summaryCount, { color: s === "critical" || s === "high" ? colors.destructive : s === "medium" ? colors.warning : colors.mutedForeground }]}>
                  {threatCounts[s]}
                </Text>
                <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
                  {s.toUpperCase()}
                </Text>
              </View>
            ) : null
          )}
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryCount, { color: colors.primary }]}>
              {networks.length}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>
              DEVICES
            </Text>
          </View>
        </View>
      )}

      <FlatList
        data={anomalies}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <AnomalyCard item={item} index={index} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80 },
        ]}
        scrollEnabled={!!anomalies.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shield" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No Analysis Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Run a scan first, then tap "Run AI" to detect anomalies
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 2 },
  analyzeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  analyzeBtnText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  summary: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryItem: { alignItems: "center" },
  summaryCount: { fontSize: 20, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  list: { padding: 16, gap: 12 },
  anomalyCard: { gap: 8 },
  anomalyTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timeAgo: { fontSize: 11, fontFamily: "Inter_400Regular" },
  anomalyType: { fontSize: 16, fontFamily: "Inter_700Bold" },
  anomalyDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  scoreRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  scoreLabel: { fontSize: 12, fontFamily: "Inter_500Medium" },
  scoreValue: { fontSize: 12, fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
