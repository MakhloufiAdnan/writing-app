import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme";

interface AppHeaderProps {
  readonly isRecording: boolean;
  readonly onStartPress: () => void;
  readonly onStopPress: () => void;
}

/**
 * En-tête de l'application :
 * - Titre H1
 * - Phrase d'accroche
 * - Bandeau de navigation avec les boutons Démarrer / Terminé
 */
export function AppHeader({
  isRecording,
  onStartPress,
  onStopPress,
}: AppHeaderProps) {
  const handleStart = () => {
    if (!isRecording) {
      onStartPress();
    }
  };

  const handleStop = () => {
    if (isRecording) {
      onStopPress();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Titre + phrase d'accroche */}
        <View style={styles.textBlock}>
          <Text style={styles.title}>
            Tableau de Bord d&apos;Analyse de l&apos;Écriture
          </Text>
          <Text style={styles.subtitle}>
            Écris le mot dans la zone et observe les paramètres en temps réel.
          </Text>
        </View>

        {/* Bandeau de navigation */}
        <View style={styles.navBar}>
          {/* Démarrer */}
          <Pressable
            onPress={handleStart}
            disabled={isRecording}
            style={({ pressed }) => [
              styles.controlButton,
              styles.startButton,
              isRecording && styles.controlButtonDisabled,
              pressed && !isRecording && styles.controlButtonPressed,
            ]}
          >
            <Ionicons name="play" size={18} color="#ffffff" />
            <Text style={styles.controlText}>Démarrer</Text>
          </Pressable>

          {/* Terminé */}
          <Pressable
            onPress={handleStop}
            disabled={!isRecording}
            style={({ pressed }) => [
              styles.controlButton,
              styles.stopButton,
              !isRecording && styles.controlButtonDisabled, 
              pressed && isRecording && styles.controlButtonPressed,
            ]}
          >
            <Ionicons name="stop" size={18} color="#ffffff" />
            <Text style={styles.controlText}>Terminé</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  textBlock: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  navBar: {
    flexDirection: "row",
    marginTop: 16,
    gap: 12,
    width: "100%",
    maxWidth: 800,
    padding:16,
    borderRadius:8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: "center", 
    backgroundColor: COLORS.border,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  startButton: {
    backgroundColor: COLORS.accentGreen,
  },
  stopButton: {
    backgroundColor: COLORS.accentRed,
  },
  controlText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  controlButtonDisabled: {
    opacity: 0.4, // bouton désactivé → plus transparent
  },
  controlButtonPressed: {
    opacity: 0.7, // effet léger au clic
  },
});
