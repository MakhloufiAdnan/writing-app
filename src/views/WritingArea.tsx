// src/views/WritingArea.tsx
// Zone de dessin : capture les gestes, calcule les métriques et pilote l'audio.

import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import type { WritingAudioPort } from "../models/audio";
import { computeMetrics, type Point, type Stroke } from "../models/metrics";
import type { WritingMetrics } from "../models/types";
import { COLORS } from "../theme";

/** Intervalle minimal entre deux recalculs de métriques pendant le mouvement (en ms) */
const METRICS_UPDATE_INTERVAL_MS = 50;

interface WritingAreaProps {
  readonly isRecording: boolean;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly selectedMelodyId: string;
  readonly audio: WritingAudioPort;
}

/**
 * Zone d'écriture :
 * - dessine les traits de l'utilisateur
 * - calcule les métriques en temps quasi réel
 * - pilote l'audio en fonction des mouvements
 */
export function WritingArea({
  isRecording,
  onMetricsChange,
  selectedMelodyId,
  audio,
}: WritingAreaProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  // Références mutables pour éviter les rerenders inutiles dans les handlers
  const strokesRef = useRef<Stroke[]>([]);
  const lastPointRef = useRef<Point | null>(null);
  const lastMetricsUpdateRef = useRef<number>(0);

  // Pour détecter les changements de mélodie / d'état d'enregistrement
  const prevSelectedIdRef = useRef<string | null>(selectedMelodyId);
  const prevIsRecordingRef = useRef<boolean>(isRecording);

  // Nettoyage du son à la destruction du composant
  useEffect(() => {
    return () => {
      void audio.stop();
    };
  }, [audio]);

  // Réinitialise les tracés au démarrage / met en pause au stop
  useEffect(() => {
    if (isRecording) {
      setStrokes([]);
      strokesRef.current = [];
      lastPointRef.current = null;
      lastMetricsUpdateRef.current = 0;
    } else {
      void audio.pause();
    }
  }, [isRecording, audio]);

  /**
   * Gère :
   * - l'arrêt de toute musique quand on passe en mode enregistrement (pour couper la pré-écoute)
   * - le changement de mélodie pendant l'écriture (si jamais on l'autorisait plus tard)
   */
  useEffect(() => {
    const prevSelectedId = prevSelectedIdRef.current;
    const prevIsRecording = prevIsRecordingRef.current;

    // On vient de cliquer sur "Démarrer" → couper toute musique en cours (pré-écoute)
    if (!prevIsRecording && isRecording) {
      void audio.stop();
    }

    // (Actuellement, la mélodie est verrouillée pendant l'écriture,
    // donc ce bloc ne sera pas déclenché, mais il est prêt si on change la règle plus tard.)
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

    const newStroke: Stroke = [point];
    const newStrokes = [...strokesRef.current, newStroke];
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    lastPointRef.current = point;

    // La musique ne démarre qu'au premier trait, pas au clic sur "Démarrer"
    if (selectedMelodyId) {
      void audio.playLoop(selectedMelodyId);
    }

    const newMetrics = computeMetrics(newStrokes);
    onMetricsChange(newMetrics);
    lastMetricsUpdateRef.current = now;
  };

  /** Doigt qui bouge */
  const handleMove = (e: GestureResponderEvent) => {
    if (!isRecording || strokesRef.current.length === 0) {
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

    const strokeIndex = strokesRef.current.length - 1;
    const stroke = strokesRef.current[strokeIndex];
    const newStroke = [...stroke, point];
    const newStrokes = [...strokesRef.current];
    newStrokes[strokeIndex] = newStroke;

    strokesRef.current = newStrokes;
    setStrokes(newStrokes);

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
      const newMetrics = computeMetrics(newStrokes);
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

    const newMetrics = computeMetrics(strokesRef.current);
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
            {strokes.map((stroke) => {
              const firstPoint = stroke[0];
              const key = firstPoint
                ? `stroke-${firstPoint.t}`
                : `stroke-${Math.random()}`;
              return (
                <Path
                  key={key}
                  d={renderPath(stroke)}
                  stroke={COLORS.accentBlue}
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              );
            })}
          </Svg>
        )}

        {!isRecording && strokes.length === 0 && (
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
