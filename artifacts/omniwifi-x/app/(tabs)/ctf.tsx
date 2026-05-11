import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlowCard } from "@/components/GlowCard";
import { CTFChallenge, useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const DIFF_COLORS: Record<string, string> = {
  easy: "#00FF88",
  medium: "#F0A500",
  hard: "#FF4444",
};

function ChallengeModal({
  challenge,
  onClose,
  onSolve,
}: {
  challenge: CTFChallenge;
  onClose: () => void;
  onSolve: (id: string, flag: string) => boolean;
}) {
  const colors = useColors();
  const [input, setInput] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";

  function handleSubmit() {
    if (!input.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const correct = onSolve(challenge.id, input);
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(onClose, 1200);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setResult(null), 1500);
    }
  }

  const diffColor = DIFF_COLORS[challenge.difficulty] ?? colors.primary;

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.card,
              paddingBottom: isWeb ? 34 + 16 : insets.bottom + 16,
            },
          ]}
        >
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <View style={styles.modalHeader}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + "22", borderColor: diffColor + "44" }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {challenge.difficulty.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.modalPoints, { color: colors.primary }]}>
              {challenge.points} pts
            </Text>
          </View>

          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            {challenge.title}
          </Text>
          <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>
            {challenge.description}
          </Text>

          {showHint && (
            <View style={[styles.hintBox, { backgroundColor: colors.warning + "11", borderColor: colors.warning + "33" }]}>
              <Feather name="info" size={14} color={colors.warning} />
              <Text style={[styles.hintText, { color: colors.warning }]}>
                {challenge.hint}
              </Text>
            </View>
          )}

          {!challenge.solved && (
            <>
              <View
                style={[
                  styles.flagInput,
                  {
                    backgroundColor: colors.muted,
                    borderColor:
                      result === "correct"
                        ? colors.accent
                        : result === "wrong"
                        ? colors.destructive
                        : colors.border,
                  },
                ]}
              >
                <Feather name="flag" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Enter flag..."
                  placeholderTextColor={colors.mutedForeground}
                  value={input}
                  onChangeText={setInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleSubmit}
                />
              </View>

              {result === "correct" && (
                <Text style={[styles.resultText, { color: colors.accent }]}>
                  Correct! Flag captured!
                </Text>
              )}
              {result === "wrong" && (
                <Text style={[styles.resultText, { color: colors.destructive }]}>
                  Wrong flag. Try again.
                </Text>
              )}

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowHint(true);
                  }}
                  style={[styles.hintBtn, { borderColor: colors.border }]}
                >
                  <Feather name="help-circle" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.hintBtnText, { color: colors.mutedForeground }]}>
                    Hint
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleSubmit}
                  style={({ pressed }) => [
                    styles.submitBtn,
                    {
                      backgroundColor: colors.primary,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}
                >
                  <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
                    Submit Flag
                  </Text>
                </Pressable>
              </View>
            </>
          )}

          {challenge.solved && (
            <View style={[styles.solvedBanner, { backgroundColor: colors.accent + "22", borderColor: colors.accent + "44" }]}>
              <Feather name="check-circle" size={20} color={colors.accent} />
              <Text style={[styles.solvedText, { color: colors.accent }]}>
                Challenge Solved!
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function ChallengeCard({
  item,
  index,
  onPress,
}: {
  item: CTFChallenge;
  index: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const diffColor = DIFF_COLORS[item.difficulty] ?? colors.primary;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
      >
        <GlowCard glowColor={item.solved ? colors.accent : diffColor} style={styles.challengeCard}>
          <View style={styles.challengeTop}>
            <View style={[styles.diffBadge, { backgroundColor: diffColor + "22", borderColor: diffColor + "44" }]}>
              <Text style={[styles.diffText, { color: diffColor }]}>
                {item.difficulty.toUpperCase()}
              </Text>
            </View>
            <View style={styles.challengeRight}>
              <Text style={[styles.points, { color: colors.primary }]}>
                {item.points}
              </Text>
              <Text style={[styles.ptslabel, { color: colors.mutedForeground }]}>
                pts
              </Text>
            </View>
          </View>

          <Text style={[styles.challengeTitle, { color: colors.foreground }]}>
            {item.title}
          </Text>
          <Text style={[styles.challengeDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>

          {item.solved && (
            <View style={[styles.solvedTag, { backgroundColor: colors.accent + "22" }]}>
              <Feather name="check" size={12} color={colors.accent} />
              <Text style={[styles.solvedTagText, { color: colors.accent }]}>
                SOLVED
              </Text>
            </View>
          )}
        </GlowCard>
      </Pressable>
    </Animated.View>
  );
}

export default function CTFScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { challenges, ctfScore, solveChallenge } = useApp();
  const [selected, setSelected] = useState<CTFChallenge | null>(null);
  const isWeb = Platform.OS === "web";

  const solved = challenges.filter((c) => c.solved).length;
  const maxScore = challenges.reduce((s, c) => s + c.points, 0);

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
            CAPTURE THE FLAG
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Challenges
          </Text>
        </View>
        <GlowCard style={styles.scoreCard} glowColor={colors.primary}>
          <Text style={[styles.scoreValue, { color: colors.primary }]}>
            {ctfScore}
          </Text>
          <Text style={[styles.scoreMax, { color: colors.mutedForeground }]}>
            / {maxScore}
          </Text>
        </GlowCard>
      </View>

      <View style={[styles.progress, { borderBottomColor: colors.border }]}>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {solved}/{challenges.length} flags captured
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: colors.primary,
                width: `${(solved / challenges.length) * 100}%` as any,
              },
            ]}
          />
        </View>
      </View>

      <FlatList
        data={challenges}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ChallengeCard
            item={item}
            index={index}
            onPress={() => setSelected(item)}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: isWeb ? 34 + 80 : insets.bottom + 80 },
        ]}
        scrollEnabled={!!challenges.length}
        showsVerticalScrollIndicator={false}
      />

      {selected && (
        <ChallengeModal
          challenge={selected}
          onClose={() => setSelected(null)}
          onSolve={(id, flag) => {
            const ok = solveChallenge(id, flag);
            if (ok) setSelected(challenges.find((c) => c.id === id) ?? selected);
            return ok;
          }}
        />
      )}
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
  scoreCard: { alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", gap: 2 },
  scoreValue: { fontSize: 22, fontFamily: "Inter_700Bold" },
  scoreMax: { fontSize: 13, fontFamily: "Inter_500Medium", alignSelf: "flex-end", marginBottom: 2 },
  progress: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  progressTrack: { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  list: { padding: 16, gap: 12 },
  challengeCard: { gap: 8 },
  challengeTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  diffBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  diffText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  challengeRight: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  points: { fontSize: 20, fontFamily: "Inter_700Bold" },
  ptslabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  challengeTitle: { fontSize: 16, fontFamily: "Inter_700Bold" },
  challengeDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  solvedTag: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  solvedTagText: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { flex: 1 },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalPoints: { fontSize: 18, fontFamily: "Inter_700Bold" },
  modalTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  modalDesc: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  hintBox: { flexDirection: "row", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: "flex-start" },
  hintText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  flagInput: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  resultText: { fontSize: 14, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  modalActions: { flexDirection: "row", gap: 10 },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  hintBtnText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  submitBtn: { flex: 1, alignItems: "center", paddingVertical: 14, borderRadius: 12 },
  submitText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  solvedBanner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  solvedText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
