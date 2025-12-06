// src/views/MainLayout.tsx
// Disposition des 4 zones :
// 1. Zone d'écriture
// 2. Sélecteur de mélodie
// 3. Métriques cinétiques
// 4. Métriques cinématiques

import React from "react";
import { Platform, StyleSheet, useWindowDimensions, View } from "react-native";

import type { WritingAudioPort } from "../models/audio";
import type {
  EraserWidth,
  StrokeWidth,
  WritingMetrics,
  WritingMode,
} from "../models/types";
import { COLORS } from "../theme";
import { KinematicMetrics } from "./KinematicMetrics";
import { KineticMetrics } from "./KineticMetrics";
import { MelodySelector } from "./MelodySelector";
import { WritingArea } from "./WritingArea";

interface MainLayoutProps {
  readonly metrics: WritingMetrics;
  readonly isRecording: boolean;
  readonly selectedMelodyId: string;
  readonly writingMode: WritingMode;
  readonly strokeWidth: StrokeWidth;
  readonly eraserWidth: EraserWidth;
  readonly isEraserActive: boolean;
  readonly onChangeSelectedMelody: (id: string) => void;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly audio: WritingAudioPort;
}

export function MainLayout({
  metrics,
  isRecording,
  selectedMelodyId,
  writingMode,
  strokeWidth,
  eraserWidth,
  isEraserActive,
  onChangeSelectedMelody,
  onMetricsChange,
  audio,
}: MainLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isPortrait = height >= width;

  // On ne veut jamais dépasser la largeur max de notre layout (1000)
  const effectiveWidth = Math.min(width, 1000);

  let zone1Height: number;

  if (Platform.OS === "web") {
    // 💻 Mode web : hauteur = 60% de la largeur du contenu
    zone1Height = effectiveWidth * 0.6;
  } else if (isTablet) {
    // Tablette native : hauteur plus généreuse
    zone1Height = effectiveWidth * 0.6;
  } else if (isPortrait) {
    // Téléphone portrait : zone haute plus grande pour faciliter l'écriture
    zone1Height = effectiveWidth * 2;
  } else {
    // Téléphone paysage
    zone1Height = effectiveWidth * 1.2;
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
              writingMode={writingMode}
              strokeWidth={strokeWidth}
              eraserWidth={eraserWidth}
              isEraserActive={isEraserActive}
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
              isRecording={isRecording}
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
