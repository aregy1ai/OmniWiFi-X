import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlowCard } from "@/components/GlowCard";
import { StatusDot } from "@/components/StatusDot";
import { NetworkEntry, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const CHANNELS = [1, 6, 11];

const SECURITY_COLORS: Record<string, string> = {
  WPA3: "#00FF88",
  WPA2: "#00D4FF",
  WEP: "#F0A500",
  Open: "#FF4444",
};

function RSSIBar({ rssi }: { rssi: number }) {
  const colors = useColors();
  const pct = Math.max(0, Math.min(100, ((rssi + 90) / 50) * 100));
  const barColor =
    rssi > -60 ? colors.accent : rssi > -75 ? colors.warning : colors.destructive;
  return (
    <View style={rssiStyles.wrapper}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            rssiStyles.bar,
            {
              height: 6 + i * 4,
              backgroundColor:
                pct > i * 25 ? barColor : colors.muted,
            },
          ]}
        />
      ))}
    </View>
  );
}

const rssiStyles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  bar: { width: 5, borderRadius: 2 },
});

function NetworkCard({ item, index }: { item: NetworkEntry; index: number }) {
  const colors = useColors();
  const secColor = SECURITY_COLORS[item.security] ?? colors.mutedForeground;
  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <GlowCard style={styles.netCard} glowColor={secColor}>
        <View style={styles.netTop}>
          <View style={styles.netLeft}>
            <Feather name="wifi" size={16} color={secColor} />
            <Text style={[styles.ssid, { color: colors.foreground }]} numberOfLines={1}>
              {item.ssid}
            </Text>
          </View>
          <RSSIBar rssi={item.rssi} />
        </View>
        <View style={styles.netBottom}>
          <View style={[styles.secBadge, { backgroundColor: secColor + "22", borderColor: secColor + "55" }]}>
            <Text style={[styles.secText, { color: secColor }]}>{item.security}</Text>
          </View>
          <Text style={[styles.netMeta, { color: colors.mutedForeground }]}>
            Ch {item.channel}
          </Text>
          <Text style={[styles.netMeta, { color: colors.mutedForeground }]}>
            {item.rssi} dBm
          </Text>
        </View>
      </GlowCard>
    </Animated.View>
  );
}

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { networks, isScanning, startScan, stopScan } = useApp();
  const [activeChannel, setActiveChannel] = useState<number | null>(null);
  const isWeb = Platform.OS === "web";

  const filtered =
    activeChannel !== null
      ? networks.filter((n) => n.channel === activeChannel)
      : networks;

  const channelCounts = CHANNELS.reduce(
    (acc, ch) => {
      acc[ch] = networks.filter((n) => n.channel === ch).length;
      return acc;
    },
    {} as Record<number, number>
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
            FREQUENCY SCANNER
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Networks
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            isScanning ? stopScan() : startScan();
          }}
          style={({ pressed }) => [
            styles.scanBtn,
            {
              backgroundColor: isScanning
                ? colors.destructive + "22"
                : colors.primary + "22",
              borderColor: isScanning ? colors.destructive : colors.primary,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <StatusDot active={isScanning} size={8} />
          <Text
            style={[
              styles.scanBtnText,
              { color: isScanning ? colors.destructive : colors.primary },
            ]}
          >
            {isScanning ? "STOP" : "SCAN"}
          </Text>
        </Pressable>
      </View>

      <View style={[styles.channels, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => setActiveChannel(null)}
          style={[
            styles.chBtn,
            {
              backgroundColor:
                activeChannel === null ? colors.primary + "22" : "transparent",
              borderColor:
                activeChannel === null ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.chText,
              {
                color:
                  activeChannel === null ? colors.primary : colors.mutedForeground,
              },
            ]}
          >
            All ({networks.length})
          </Text>
        </Pressable>
        {CHANNELS.map((ch) => (
          <Pressable
            key={ch}
            onPress={() => setActiveChannel(activeChannel === ch ? null : ch)}
            style={[
              styles.chBtn,
              {
                backgroundColor:
                  activeChannel === ch ? colors.accent + "22" : "transparent",
                borderColor:
                  activeChannel === ch ? colors.accent : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chText,
                {
                  color:
                    activeChannel === ch ? colors.accent : colors.mutedForeground,
                },
              ]}
            >
              Ch {ch} ({channelCounts[ch] ?? 0})
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <NetworkCard item={item} index={index} />
        )}
        contentContainerStyle={[
          styles.list,
          {
            paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80,
          },
        ]}
        scrollEnabled={!!filtered.length}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {isScanning ? "Scanning channels..." : "Tap SCAN to start"}
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
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  scanBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  channels: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  chText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  list: { padding: 16, gap: 10 },
  netCard: { marginBottom: 0 },
  netTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  netLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  ssid: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  netBottom: { flexDirection: "row", alignItems: "center", gap: 8 },
  secBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  secText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  netMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
