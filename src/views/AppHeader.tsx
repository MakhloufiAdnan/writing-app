import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { EraserWidth, StrokeWidth, WritingMode } from "../models/types";
import { COLORS } from "../theme";

interface AppHeaderProps {
  readonly isRecording: boolean;
  readonly onStartPress: () => void;
  readonly onStopPress: () => void;

  readonly writingMode: WritingMode;
  readonly onChangeWritingMode: (mode: WritingMode) => void;

  readonly strokeWidth: StrokeWidth;
  readonly onChangeStrokeWidth: (width: StrokeWidth) => void;

  readonly eraserWidth: EraserWidth;
  readonly onChangeEraserWidth: (width: EraserWidth) => void;

  readonly isEraserActive: boolean;
  readonly onChangeEraserActive: (active: boolean) => void;

  /** Notifie le parent (HomeScreen) qu'un menu outils est ouvert/fermé → pour bloquer le scroll. */
  readonly onToolsMenuOpenChange?: (isOpen: boolean) => void;
}

/** Options d'épaisseur de trait (Crayon) */
const STROKE_OPTIONS: { label: string; value: StrokeWidth }[] = [
  { label: "Extrafin", value: 1 },
  { label: "Fin", value: 2 },
  { label: "Moyen", value: 3 },
  { label: "Gros", value: 4 },
];

/** Options de taille de gomme */
const ERASER_OPTIONS: { label: string; value: EraserWidth }[] = [
  { label: "Petite", value: 2 },
  { label: "Moyenne", value: 4 },
  { label: "Grosse", value: 8 },
];

export function AppHeader({
  isRecording,
  onStartPress,
  onStopPress,
  writingMode,
  onChangeWritingMode,
  strokeWidth,
  onChangeStrokeWidth,
  eraserWidth,
  onChangeEraserWidth,
  isEraserActive,
  onChangeEraserActive,
  onToolsMenuOpenChange,
}: AppHeaderProps) {
  const [strokeMenuOpen, setStrokeMenuOpen] = useState(false);
  const [eraserMenuOpen, setEraserMenuOpen] = useState(false);

  /** Met à jour l'état des menus + notifie le parent pour bloquer/débloquer le scroll. */
  const setMenusOpen = (strokeOpen: boolean, eraserOpen: boolean) => {
    setStrokeMenuOpen(strokeOpen);
    setEraserMenuOpen(eraserOpen);
    const anyOpen = strokeOpen || eraserOpen;
    onToolsMenuOpenChange?.(anyOpen);
  };

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

  /** Sélection du mode de fond (blanc / Seyès) */
  const handleSelectMode = (mode: WritingMode) => {
    // On ne veut pas changer le fond pendant l'enregistrement
    if (isRecording) return;
    if (mode === writingMode) return;
    onChangeWritingMode(mode);
  };

  const isBlankSelected = writingMode === "blank";
  const isSeyesSelected = writingMode === "seyes";

  /** Clic sur Crayon : on active le crayon et on ouvre la liste d'épaisseurs. */
  const handlePressPen = () => {
    onChangeEraserActive(false);
    const nextOpen = !strokeMenuOpen;
    setMenusOpen(nextOpen, false);
  };

  /** Clic sur Gomme : on active la gomme et on ouvre la liste de tailles. */
  const handlePressEraser = () => {
    onChangeEraserActive(true);
    const nextOpen = !eraserMenuOpen;
    setMenusOpen(false, nextOpen);
  };

  const selectStrokeWidth = (value: StrokeWidth) => {
    onChangeStrokeWidth(value);
    setMenusOpen(false, false);
  };

  const selectEraserWidth = (value: EraserWidth) => {
    onChangeEraserWidth(value);
    setMenusOpen(false, false);
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

        {/* Barre de contrôle : mode + outils + start/stop */}
        <View style={styles.controlBar}>
          {/* Groupe gauche : container "outils de la zone de texte" avec shadow */}
          <View style={styles.leftControls}>
            <View style={styles.toolsCard}>
              {/* Mode Blanc / Seyès */}
              <View style={styles.modeGroup}>
                <Pressable
                  onPress={() => handleSelectMode("blank")}
                  disabled={isRecording}
                  style={({ pressed }) => [
                    styles.modeButton,
                    isBlankSelected
                      ? styles.modeButtonSelected
                      : styles.modeButtonUnselected,
                    isRecording && styles.modeButtonLocked,
                    pressed && !isRecording && styles.modeButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      isBlankSelected && styles.modeButtonTextSelected,
                    ]}
                  >
                    Blanc
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleSelectMode("seyes")}
                  disabled={isRecording}
                  style={({ pressed }) => [
                    styles.modeButton,
                    isSeyesSelected
                      ? styles.modeButtonSelected
                      : styles.modeButtonUnselected,
                    isRecording && styles.modeButtonLocked,
                    pressed && !isRecording && styles.modeButtonPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.modeButtonText,
                      isSeyesSelected && styles.modeButtonTextSelected,
                    ]}
                  >
                    Seyès
                  </Text>
                </Pressable>
              </View>

              {/* Ligne d'outils : Crayon + Gomme */}
              <View style={styles.toolsRow}>
                {/* Crayon */}
                <View style={styles.toolWrapper}>
                  <Pressable
                    onPress={handlePressPen}
                    style={({ pressed }) => [
                      styles.toolButton,
                      !isEraserActive && styles.toolButtonActive,
                      pressed && styles.toolButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name="pencil"
                      size={16}
                      color={
                        !isEraserActive
                          ? COLORS.textPrimary
                          : COLORS.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.toolButtonText,
                        !isEraserActive && styles.toolButtonTextActive,
                      ]}
                    >
                      Crayon
                    </Text>
                    <Ionicons
                      name={strokeMenuOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>

                  {strokeMenuOpen && (
                    <View style={styles.dropdownMenu}>
                      {STROKE_OPTIONS.map((opt) => (
                        <Pressable
                          key={opt.value}
                          onPress={() => selectStrokeWidth(opt.value)}
                          style={styles.dropdownItem}
                        >
                          <Text style={styles.dropdownItemText}>
                            {opt.label}
                            {opt.value === strokeWidth ? " ✓" : ""}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Gomme */}
                <View style={styles.toolWrapper}>
                  <Pressable
                    onPress={handlePressEraser}
                    style={({ pressed }) => [
                      styles.toolButton,
                      isEraserActive && styles.toolButtonActive,
                      pressed && styles.toolButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={16}
                      color={
                        isEraserActive
                          ? COLORS.textPrimary
                          : COLORS.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.toolButtonText,
                        isEraserActive && styles.toolButtonTextActive,
                      ]}
                    >
                      Gomme
                    </Text>
                    <Ionicons
                      name={eraserMenuOpen ? "chevron-up" : "chevron-down"}
                      size={14}
                      color={COLORS.textSecondary}
                    />
                  </Pressable>

                  {eraserMenuOpen && (
                    <View style={styles.dropdownMenu}>
                      {ERASER_OPTIONS.map((opt) => (
                        <Pressable
                          key={opt.value}
                          onPress={() => selectEraserWidth(opt.value)}
                          style={styles.dropdownItem}
                        >
                          <Text style={styles.dropdownItemText}>
                            {opt.label}
                            {opt.value === eraserWidth ? " ✓" : ""}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Groupe droite : Démarrer / Terminé (mutuellement exclusifs) */}
          <View style={styles.rightControls}>
            {!isRecording && (
              <Pressable
                onPress={handleStart}
                style={({ pressed }) => [
                  styles.controlButton,
                  styles.startButton,
                  pressed && styles.controlButtonPressed,
                ]}
              >
                <Ionicons name="play" size={18} color={COLORS.white} />
                <Text style={styles.controlText}>Démarrer</Text>
              </Pressable>
            )}

            {isRecording && (
              <Pressable
                onPress={handleStop}
                style={({ pressed }) => [
                  styles.controlButton,
                  styles.stopButton,
                  pressed && styles.controlButtonPressed,
                ]}
              >
                <Ionicons name="stop" size={18} color={COLORS.white} />
                <Text style={styles.controlText}>Terminé</Text>
              </Pressable>
            )}
          </View>
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
    fontSize: 32,
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

  controlBar: {
    marginTop: 16,
    flexDirection: "row",
    width: "100%",
    maxWidth: 1000,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  leftControls: {
    flex: 1,
    alignItems: "flex-start",
  },

  rightControls: {
    flexDirection: "row",
    alignItems: "center",
  },

  // 🧊 Container outils (mode + Crayon / Gomme) avec shadow
  toolsCard: {
    flexDirection: "row",
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    gap: 8,
  },

  // Boutons de mode (Blanc / Seyès)
  modeGroup: {
    flexDirection: "row",
    borderRadius: 999,
    padding: 2,
    gap: 4,
    backgroundColor: "#f3f4f6",
  },
  modeButton: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modeButtonSelected: {
    borderColor: COLORS.accentGreen,
    backgroundColor: "#dcfce7",
  },
  modeButtonUnselected: {
    backgroundColor: "#f3f4f6",
  },
  modeButtonLocked: {
    opacity: 0.5,
  },
  modeButtonPressed: {
    opacity: 0.8,
  },
  modeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  modeButtonTextSelected: {
    color: COLORS.textPrimary,
  },

  // Rangée Crayon / Gomme
  toolsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  toolWrapper: {
    position: "relative",
    minWidth: 120,
  },
  toolButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  toolButtonActive: {
    borderColor: COLORS.accentGreen,
    backgroundColor: "#dcfce7",
  },
  toolButtonPressed: {
    opacity: 0.85,
  },
  toolButtonText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginHorizontal: 6,
  },
  toolButtonTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "600",
  },

  // Menus déroulants (ouvrent vers le haut)
  dropdownMenu: {
    position: "absolute",
    bottom: "100%", 
    left: 0,
    right: 0,
    marginBottom: 4,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 50,
  },
  dropdownItem: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownItemText: {
    fontSize: 11,
    color: COLORS.textPrimary,
  },

  // Start / Stop
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
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  controlButtonPressed: {
    opacity: 0.8,
  },
});
