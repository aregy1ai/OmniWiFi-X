import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlowCard } from "@/components/GlowCard";
import { StatusDot } from "@/components/StatusDot";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const MODULE_LABELS: Record<string, string> = {
  service: "Core Service",
  maintenance: "Maintenance",
  training: "Security Training",
  ai: "AI Analysis",
  frequency: "Freq Scanner",
  ctf: "CTF Platform",
};

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    status,
    networks,
    anomalies,
    ctfScore,
    challenges,
    modules,
    toggleService,
    runMaintenance,
    maintenanceRunning,
  } = useApp();

  const completedModules = modules.filter((m) => m.completed).length;
  const solvedChallenges = challenges.filter((c) => c.solved).length;
  const activeModules = Object.values(status).filter(Boolean).length;
  const topAnomaly = anomalies[0];
  const isWeb = Platform.OS === "web";

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
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
            SYSTEM STATUS
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            OmniWiFi X
          </Text>
        </View>
        <View style={[styles.activeBadge, { backgroundColor: colors.accent + "22", borderColor: colors.accent + "44" }]}>
          <StatusDot active={status.service} />
          <Text style={[styles.activeText, { color: colors.accent }]}>
            {status.service ? "ONLINE" : "OFFLINE"}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <GlowCard style={styles.statCard} glowColor={colors.primary}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {activeModules}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Active
          </Text>
        </GlowCard>
        <GlowCard style={styles.statCard} glowColor={colors.accent}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {networks.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Networks
          </Text>
        </GlowCard>
        <GlowCard style={styles.statCard} glowColor={colors.warning}>
          <Text style={[styles.statValue, { color: colors.warning }]}>
            {anomalies.length}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            Threats
          </Text>
        </GlowCard>
        <GlowCard style={styles.statCard} glowColor={colors.primary}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {ctfScore}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            CTF Pts
          </Text>
        </GlowCard>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Module Status
      </Text>
      <GlowCard style={styles.modulesCard}>
        {Object.entries(status).map(([key, active]) => (
          <View key={key} style={styles.moduleRow}>
            <View style={styles.moduleLeft}>
              <StatusDot active={active} size={8} />
              <Text style={[styles.moduleName, { color: colors.foreground }]}>
                {MODULE_LABELS[key] ?? key}
              </Text>
            </View>
            <Text
              style={[
                styles.moduleState,
                { color: active ? colors.accent : colors.mutedForeground },
              ]}
            >
              {active ? "RUNNING" : "IDLE"}
            </Text>
          </View>
        ))}
      </GlowCard>

      {topAnomaly && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Latest Threat
          </Text>
          <GlowCard glowColor={colors.destructive} intensity={2}>
            <View style={styles.threatHeader}>
              <Feather name="alert-triangle" size={16} color={colors.destructive} />
              <Text style={[styles.threatType, { color: colors.destructive }]}>
                {topAnomaly.type}
              </Text>
              <Text style={[styles.threatScore, { color: colors.mutedForeground }]}>
                {(topAnomaly.score * 100).toFixed(0)}%
              </Text>
            </View>
            <Text style={[styles.threatDesc, { color: colors.mutedForeground }]}>
              {topAnomaly.description}
            </Text>
          </GlowCard>
        </>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
        Progress
      </Text>
      <GlowCard>
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Feather name="book-open" size={20} color={colors.primary} />
            <Text style={[styles.progressValue, { color: colors.foreground }]}>
              {completedModules}/{modules.length}
            </Text>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              Modules
            </Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.progressItem}>
            <Feather name="flag" size={20} color={colors.accent} />
            <Text style={[styles.progressValue, { color: colors.foreground }]}>
              {solvedChallenges}/{challenges.length}
            </Text>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
              CTF Flags
            </Text>
          </View>
        </View>
      </GlowCard>

      <View style={styles.actions}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            toggleService();
          }}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: status.service
                ? colors.destructive + "22"
                : colors.accent + "22",
              borderColor: status.service ? colors.destructive : colors.accent,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Feather
            name={status.service ? "power" : "play"}
            size={18}
            color={status.service ? colors.destructive : colors.accent}
          />
          <Text
            style={[
              styles.actionText,
              { color: status.service ? colors.destructive : colors.accent },
            ]}
          >
            {status.service ? "Stop Service" : "Start Service"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => {
            if (!maintenanceRunning) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              runMaintenance();
            }
          }}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: colors.secondary,
              borderColor: colors.border,
              opacity: pressed || maintenanceRunning ? 0.6 : 1,
            },
          ]}
        >
          {maintenanceRunning ? (
            <ActivityIndicator size={18} color={colors.primary} />
          ) : (
            <Feather name="tool" size={18} color={colors.primary} />
          )}
          <Text style={[styles.actionText, { color: colors.primary }]}>
            {maintenanceRunning ? "Running..." : "Maintenance"}
          </Text>
        </Pressable>
      </View>
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
  greeting: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.5 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", marginTop: 2 },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14, paddingHorizontal: 0 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1,
    marginTop: 4,
  },
  modulesCard: { gap: 10 },
  moduleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  moduleLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  moduleName: { fontSize: 14, fontFamily: "Inter_500Medium" },
  moduleState: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8 },
  threatHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  threatType: { fontSize: 15, fontFamily: "Inter_700Bold", flex: 1 },
  threatScore: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  threatDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  progressRow: { flexDirection: "row", alignItems: "center" },
  progressItem: { flex: 1, alignItems: "center", gap: 6 },
  progressValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  divider: { width: 1, height: 50 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
