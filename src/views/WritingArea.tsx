import type { ReactElement } from "react";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Line, Path } from "react-native-svg";

import type { WritingAudioPort } from "../models/audio";
import { computeMetrics, type Point, type Stroke } from "../models/metrics";
import type {
  EraserWidth,
  StrokeWidth,
  WritingMetrics,
  WritingMode,
} from "../models/types";
import { COLORS } from "../theme";

/** Intervalle minimal entre deux recalculs de métriques pendant le mouvement (en ms) */
const METRICS_UPDATE_INTERVAL_MS = 50;

/** Stroke + style pour l'affichage (couleur + largeur) */
interface DrawableStroke {
  id: string;
  points: Stroke;
  color: string;
  width: number;
}

interface WritingAreaProps {
  readonly isRecording: boolean;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly selectedMelodyId: string;
  readonly writingMode: WritingMode;
  readonly strokeWidth: StrokeWidth;
  readonly eraserWidth: EraserWidth;
  readonly isEraserActive: boolean;
  readonly audio: WritingAudioPort;
}

/**
 * Génère les lignes du quadrillage Seyès :
 * - Lignes horizontales bleues tous les 1/4 d'interligne.
 * - Une ligne plus marquée toutes les 4 (interligne principal).
 * - Une marge verticale rouge à gauche.
 *
 * NB : On adapte l'espacement à la hauteur de la zone pour rester lisible
 * sur téléphone / tablette, sans chercher à respecter une échelle physique parfaite en mm.
 */
function renderSeyesGrid(width: number, height: number): ReactElement[] {
  const elements: ReactElement[] = [];

  // On choisit ~10 grandes lignes dans la hauteur
  const mainSpacing = height / 10;
  const smallSpacing = mainSpacing / 4;

  const mainLineColor = "#60a5fa"; // bleu (ligne principale)
  const subLineColor = "#bfdbfe"; // bleu plus clair (lignes secondaires)

  let index = 0;
  for (let y = 0; y <= height; y += smallSpacing) {
    const isMain = index % 4 === 0;

    elements.push(
      <Line
        key={`h-${index}`}
        x1={0}
        y1={y}
        x2={width}
        y2={y}
        stroke={isMain ? mainLineColor : subLineColor}
        strokeWidth={isMain ? 1 : 0.5}
      />
    );

    index += 1;
  }

  // Marge rouge verticale (à environ 15% de la largeur, max 64 px)
  const marginX = Math.min(width * 0.15, 64);

  elements.push(
    <Line
      key="margin"
      x1={marginX}
      y1={0}
      x2={marginX}
      y2={height}
      stroke="#f97373"
      strokeWidth={1}
    />
  );

  return elements;
}

/**
 * Zone d'écriture :
 * - dessine les traits de l'utilisateur
 * - calcule les métriques en temps quasi réel
 * - pilote l'audio en fonction des mouvements
 * - affiche un fond blanc ou Seyès selon writingMode
 * - affiche toujours une ligne rouge au milieu de la hauteur
 * - prend en compte l'épaisseur du trait et la gomme
 */
export function WritingArea({
  isRecording,
  onMetricsChange,
  selectedMelodyId,
  writingMode,
  strokeWidth,
  eraserWidth,
  isEraserActive,
  audio,
}: WritingAreaProps) {
  const [drawableStrokes, setDrawableStrokes] = useState<DrawableStroke[]>([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  // Références mutables pour éviter les rerenders inutiles dans les handlers
  const drawableStrokesRef = useRef<DrawableStroke[]>([]);
  const metricsStrokesRef = useRef<Stroke[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const lastMetricsUpdateRef = useRef<number>(0);

  // Pour détecter les changements de mélodie / d'état d'enregistrement
  const prevSelectedIdRef = useRef<string | null>(selectedMelodyId);
  const prevIsRecordingRef = useRef<boolean>(isRecording);

  // Sync ref <-> state
  useEffect(() => {
    drawableStrokesRef.current = drawableStrokes;
  }, [drawableStrokes]);

  // Nettoyage du son à la destruction du composant
  useEffect(() => {
    return () => {
      void audio.stop();
    };
  }, [audio]);

  // Réinitialise les tracés au démarrage / met en pause au stop
  useEffect(() => {
    if (isRecording) {
      setDrawableStrokes([]);
      drawableStrokesRef.current = [];
      metricsStrokesRef.current = [];
      lastPointRef.current = null;
      lastMetricsUpdateRef.current = 0;
    } else {
      void audio.pause();
    }
  }, [isRecording, audio]);

  /**
   * Gère :
   * - l'arrêt de toute musique quand on passe en mode enregistrement (pour couper la pré-écoute)
   * - le changement de mélodie pendant l'écriture (header la verrouille, mais on garde le comportement au cas où)
   */
  useEffect(() => {
    const prevSelectedId = prevSelectedIdRef.current;
    const prevIsRecording = prevIsRecordingRef.current;

    // On vient de cliquer sur "Démarrer" → couper toute musique en cours (pré-écoute)
    if (!prevIsRecording && isRecording) {
      void audio.stop();
    }

    // Si un jour on autorise le changement de mélodie pendant l'écriture,
    // ce bloc permettra de basculer en douceur.
    if (
      isRecording &&
      selectedMelodyId &&
      prevSelectedId &&
      selectedMelodyId !== prevSelectedId
    ) {
      void audio.playLoop(selectedMelodyId);
    }

    prevSelectedIdRef.current = selectedMelodyId;
    prevIsRecordingRef.current = isRecording;
  }, [selectedMelodyId, isRecording, audio]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  /** Doigt posé → début de trait */
  const handleStart = (e: GestureResponderEvent) => {
    if (!isRecording) {
      return;
    }

    const { locationX, locationY, force } = e.nativeEvent;
    const now = Date.now();
    const point: Point = {
      x: locationX,
      y: locationY,
      t: now,
      // Certains devices ne fournissent pas de force → valeur par défaut 0.5
      force: typeof force === "number" ? force : 0.5,
    };

    // --- Pour les métriques ---
    const newMetricsStroke: Stroke = [point];
    const newMetricsStrokes = [...metricsStrokesRef.current, newMetricsStroke];
    metricsStrokesRef.current = newMetricsStrokes;

    // --- Pour l'affichage ---
    const color = isEraserActive ? COLORS.white : COLORS.accentBlue;
    const widthPx = isEraserActive ? eraserWidth : strokeWidth;
    const newDrawableStroke: DrawableStroke = {
      id: `stroke-${now}`,
      points: [point],
      color,
      width: widthPx,
    };
    const newDrawableStrokes = [
      ...drawableStrokesRef.current,
      newDrawableStroke,
    ];
    drawableStrokesRef.current = newDrawableStrokes;
    setDrawableStrokes(newDrawableStrokes);

    lastPointRef.current = point;

    // La musique ne démarre qu'au premier trait, pas au clic sur "Démarrer"
    if (selectedMelodyId) {
      void audio.playLoop(selectedMelodyId);
    }

    const newMetrics = computeMetrics(newMetricsStrokes);
    onMetricsChange(newMetrics);
    lastMetricsUpdateRef.current = now;
  };

  /** Doigt qui bouge */
  const handleMove = (e: GestureResponderEvent) => {
    if (!isRecording || metricsStrokesRef.current.length === 0) {
      return;
    }

    const { locationX, locationY, force } = e.nativeEvent;
    const now = Date.now();

    const point: Point = {
      x: locationX,
      y: locationY,
      t: now,
      force: typeof force === "number" ? force : 0.5,
    };

    // --- Mise à jour métriques ---
    const metricsStrokeIndex = metricsStrokesRef.current.length - 1;
    const lastMetricsStroke = metricsStrokesRef.current[metricsStrokeIndex];
    const updatedMetricsStroke: Stroke = [...lastMetricsStroke, point];
    const updatedMetricsStrokes = [...metricsStrokesRef.current];
    updatedMetricsStrokes[metricsStrokeIndex] = updatedMetricsStroke;
    metricsStrokesRef.current = updatedMetricsStrokes;

    // --- Mise à jour affichage ---
    const drawableIndex = drawableStrokesRef.current.length - 1;
    const lastDrawableStroke = drawableStrokesRef.current[drawableIndex];
    const updatedDrawableStroke: DrawableStroke = {
      ...lastDrawableStroke,
      points: [...lastDrawableStroke.points, point],
    };
    const updatedDrawableStrokes = [...drawableStrokesRef.current];
    updatedDrawableStrokes[drawableIndex] = updatedDrawableStroke;
    drawableStrokesRef.current = updatedDrawableStrokes;
    setDrawableStrokes(updatedDrawableStrokes);

    // Vitesse instantanée → ajuste la vitesse de lecture de l'audio
    const last = lastPointRef.current;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const dtMs = point.t - last.t;

      if (dtMs > 0) {
        const dist = Math.hypot(dx, dy);
        const speedPxPerSec = (dist / dtMs) * 1000;
        void audio.updateRate(speedPxPerSec);
      }
    }
    lastPointRef.current = point;

    // Throttle des métriques pour éviter les recalculs excessifs
    const lastUpdate = lastMetricsUpdateRef.current;
    if (!lastUpdate || now - lastUpdate >= METRICS_UPDATE_INTERVAL_MS) {
      const newMetrics = computeMetrics(metricsStrokesRef.current);
      onMetricsChange(newMetrics);
      lastMetricsUpdateRef.current = now;
    }
  };

  /** Doigt levé */
  const handleEnd = () => {
    if (!isRecording) {
      return;
    }

    lastPointRef.current = null;
    void audio.pause();

    const newMetrics = computeMetrics(metricsStrokesRef.current);
    onMetricsChange(newMetrics);
    lastMetricsUpdateRef.current = 0;
  };

  const renderPath = (stroke: Stroke) => {
    if (stroke.length === 0) return "";
    return stroke
      .map((p, index) => `${index === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zone d&apos;écriture</Text>
      <Text style={styles.subtitle}>
        Appuie sur &quot;Démarrer&quot; puis écris ici. La musique suit tes
        mouvements.
      </Text>

      <View
        style={styles.canvas}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleStart}
        onResponderMove={handleMove}
        onResponderRelease={handleEnd}
        onResponderTerminate={handleEnd}
      >
        {canvasSize.width > 0 && (
          <Svg width="100%" height="100%">
            {/* Quadrillage Seyès si demandé */}
            {writingMode === "seyes" &&
              renderSeyesGrid(canvasSize.width, canvasSize.height)}

            {/* Ligne rouge horizontale au milieu de la hauteur */}
            <Line
              x1={0}
              y1={canvasSize.height / 2}
              x2={canvasSize.width}
              y2={canvasSize.height / 2}
              stroke={COLORS.accentRed}
              strokeWidth={1}
            />

            {/* Tracés de l'utilisateur */}
            {drawableStrokes.map((stroke) => (
              <Path
                key={stroke.id}
                d={renderPath(stroke.points)}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ))}
          </Svg>
        )}

        {!isRecording && drawableStrokes.length === 0 && (
          <Text style={styles.helperText}>
            L&apos;écriture est arrêtée. Appuie sur &quot;Démarrer&quot; pour
            commencer.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: COLORS.textPrimary,
    padding: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  canvas: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: COLORS.white,
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    margin: 16,
  },
  helperText: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
