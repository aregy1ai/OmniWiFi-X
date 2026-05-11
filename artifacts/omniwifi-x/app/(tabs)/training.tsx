import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedBar } from "@/components/AnimatedBar";
import { GlowCard } from "@/components/GlowCard";
import { TrainingModule, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MODULE_ICONS: Record<string, string> = {
  m1: "layers",
  m2: "users",
  m3: "activity",
  m4: "lock",
  m5: "zap",
  m6: "radio",
};

function ModuleCard({
  mod,
  index,
  onStart,
}: {
  mod: TrainingModule;
  index: number;
  onStart: (id: string) => void;
}) {
  const colors = useColors();
  const [running, setRunning] = useState(false);
  const [localProgress, setLocalProgress] = useState(mod.completed ? 100 : 0);

  const icon = MODULE_ICONS[mod.id] ?? "book";
  const glowColor = mod.completed ? colors.accent : colors.primary;

  async function handleStart() {
    if (mod.completed || running) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRunning(true);

    const steps = 20;
    for (let i = 1; i <= steps; i++) {
      await new Promise((r) => setTimeout(r, (mod.duration * 60) / 1000 / steps));
      setLocalProgress((i / steps) * 100);
    }
    setRunning(false);
    onStart(mod.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <GlowCard glowColor={glowColor} style={styles.modCard}>
        <View style={styles.modTop}>
          <View
            style={[
              styles.iconWrap,
              {
                backgroundColor: glowColor + "22",
                borderColor: glowColor + "44",
              },
            ]}
          >
            <Feather name={icon as any} size={20} color={glowColor} />
          </View>
          <View style={styles.modInfo}>
            <Text style={[styles.modTitle, { color: colors.foreground }]}>
              {mod.title}
            </Text>
            <Text style={[styles.modDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {mod.description}
            </Text>
          </View>
          {mod.completed && (
            <View
              style={[
                styles.checkBadge,
                { backgroundColor: colors.accent + "22" },
              ]}
            >
              <Feather name="check" size={16} color={colors.accent} />
            </View>
          )}
        </View>

        <View style={styles.modMeta}>
          <View style={styles.durationRow}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.duration, { color: colors.mutedForeground }]}>
              {mod.duration} min
            </Text>
          </View>
          {running && (
            <Text style={[styles.progressText, { color: colors.primary }]}>
              {localProgress.toFixed(0)}%
            </Text>
          )}
        </View>

        {(running || mod.completed) && (
          <AnimatedBar
            value={running ? localProgress : 100}
            maxValue={100}
            color={mod.completed ? colors.accent : colors.primary}
          />
        )}

        {!mod.completed && (
          <Pressable
            onPress={handleStart}
            disabled={running}
            style={({ pressed }) => [
              styles.startBtn,
              {
                backgroundColor: running ? colors.muted : colors.primary + "22",
                borderColor: running ? colors.border : colors.primary,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text
              style={[
                styles.startText,
                { color: running ? colors.mutedForeground : colors.primary },
              ]}
            >
              {running ? "In Progress..." : "Start Module"}
            </Text>
          </Pressable>
        )}
      </GlowCard>
    </Animated.View>
  );
}

export default function TrainingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { modules, completeModule } = useApp();
  const isWeb = Platform.OS === "web";

  const completed = modules.filter((m) => m.completed).length;
  const total = modules.length;
  const overallProgress = (completed / total) * 100;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: isWeb ? 67 + 16 : insets.top + 16,
          paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            SECURITY TRAINING
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Modules
          </Text>
        </View>
        <View style={[styles.progressBadge, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.progressCount, { color: colors.foreground }]}>
            {completed}/{total}
          </Text>
        </View>
      </View>

      <GlowCard style={styles.overallCard} glowColor={colors.primary}>
        <View style={styles.overallTop}>
          <Text style={[styles.overallLabel, { color: colors.mutedForeground }]}>
            Overall Progress
          </Text>
          <Text style={[styles.overallPct, { color: colors.primary }]}>
            {overallProgress.toFixed(0)}%
          </Text>
        </View>
        <AnimatedBar value={overallProgress} maxValue={100} color={colors.primary} height={8} />
        <Text style={[styles.overallSub, { color: colors.mutedForeground }]}>
          {total - completed} modules remaining
        </Text>
      </GlowCard>

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>
        All Modules
      </Text>

      {modules.map((mod, i) => (
        <ModuleCard
          key={mod.id}
          mod={mod}
          index={i}
          onStart={completeModule}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginTop: 2 },
  progressBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  progressCount: { fontSize: 15, fontFamily: "Inter_700Bold" },
  overallCard: { gap: 10 },
  overallTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  overallLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  overallPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  overallSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 13, fontFamily: "Inter_700Bold", letterSpacing: 0.5, marginTop: 4 },
  modCard: { gap: 10 },
  modTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  modInfo: { flex: 1 },
  modTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 2 },
  modDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  durationRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  duration: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  startBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  startText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
