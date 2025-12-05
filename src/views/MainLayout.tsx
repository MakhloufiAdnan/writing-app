// src/views/MainLayout.tsx
// Layout principal : zone d'écriture + sélection des mélodies + métriques.

import React from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import type { WritingAudioPort } from "../models/audio";
import type { WritingMetrics } from "../models/types";
import { COLORS } from "../theme";
import { KinematicMetrics } from "./KinematicMetrics";
import { KineticMetrics } from "./KineticMetrics";
import { MelodySelector } from "./MelodySelector";
import { WritingArea } from "./WritingArea";

interface MainLayoutProps {
  readonly metrics: WritingMetrics;
  readonly isRecording: boolean;
  readonly selectedMelodyId: string;
  readonly onChangeSelectedMelody: (id: string) => void;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly audio: WritingAudioPort;
}

/**
 * Disposition des 4 zones dans le main :
 * 1. Zone d'écriture (pleine largeur, hauteur responsive)
 * 2. Zone de sélection des mélodies
 * 3. Zone métriques cinétiques
 * 4. Zone métriques cinématiques
 */
export function MainLayout({
  metrics,
  isRecording,
  selectedMelodyId,
  onChangeSelectedMelody,
  onMetricsChange,
  audio,
}: MainLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isPortrait = height >= width;

  // Hauteur de la zone d'écriture en fonction du device/orientation
  let zone1Height: number;

  if (isTablet) {
    zone1Height = width * 0.6;
  } else if (isPortrait) {
    zone1Height = width * 2;
  } else {
    zone1Height = width * 1.2;
  }

  return (
    <View style={styles.root}>
      <View style={styles.container}>
        {/* Zone 1 : Zone d'écriture */}
        <View style={styles.fullWidth}>
          <View
            style={[
              styles.zoneCard,
              styles.zoneWriting,
              { height: zone1Height },
            ]}
          >
            <WritingArea
              isRecording={isRecording}
              onMetricsChange={onMetricsChange}
              selectedMelodyId={selectedMelodyId}
              audio={audio}
            />
          </View>
        </View>

        {/* Zone 2 : Sélection des mélodies */}
        <View style={styles.fullWidth}>
          <View style={styles.zoneCard}>
            <MelodySelector
              selectedId={selectedMelodyId}
              onChangeSelected={onChangeSelectedMelody}
              audio={audio}
              isRecording={isRecording} // 🔒 verrouille la sélection pendant l'écriture
            />
          </View>
        </View>

        {/* Zones 3 & 4 : métriques cinétiques / cinématiques */}
        <View style={styles.fullWidth}>
          <View
            style={[styles.metricsRow, isTablet && styles.metricsRowTablet]}
          >
            <View style={styles.metricsColumn}>
              <View style={styles.metricsCard}>
                <KineticMetrics metrics={metrics} />
              </View>
            </View>
            <View style={styles.metricsColumn}>
              <View style={styles.metricsCard}>
                <KinematicMetrics metrics={metrics} />
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  container: {
    padding: 12,
    alignItems: "center",
    gap: 12,
  },
  fullWidth: {
    width: "100%",
    maxWidth: 1000,
  },
  zoneCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneWriting: {
    alignItems: "stretch",
    justifyContent: "flex-start",
  },
  metricsRow: {
    flexDirection: "column",
    gap: 12,
    alignItems: "stretch",
  },
  metricsRowTablet: {
    flexDirection: "row",
  },
  metricsColumn: {
    flex: 1,
  },
  metricsCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
