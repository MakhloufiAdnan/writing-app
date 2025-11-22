import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { getMelodyById } from "../melodies";
import { emptyMetrics, type WritingMetrics } from "../types";

// Définition des types de données
type Point = { x: number; y: number; t: number; force?: number };
type Stroke = Point[];

// Définition des props pour la zone d'écriture
interface WritingAreaProps {
  readonly isRecording: boolean;
  readonly metrics: WritingMetrics;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly selectedMelodyId: string;
}

// Constantes de conversion
const PX_PER_MM = 3.78; // Conversion des pixels en millimètres (approximative pour 96 dpi)
const SPEED_CHANGE_THRESHOLD = 600; // Seuil pour détecter un changement brusque de vitesse (px/s)
const PAUSE_THRESHOLD_MS = 150; // Seuil pour considérer une pause entre les traits (ms)

export function WritingArea({
  isRecording,
  metrics: _metrics,
  onMetricsChange,
  selectedMelodyId,
}: WritingAreaProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]); // État des tracés
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const strokesRef = useRef<Stroke[]>([]); // Référence pour les tracés
  const lastPointRef = useRef<Point | null>(null); // Référence pour le dernier point touché
  const soundRef = useRef<Audio.Sound | null>(null); // Référence pour le son

  // Nettoyage du son lors de la destruction du composant
  useEffect(() => {
    return () => {
      void stopAndUnloadSound();
    };
  }, []);

  // Efface les tracés lorsque l'enregistrement commence
  useEffect(() => {
    if (isRecording) {
      setStrokes([]); // Réinitialise les tracés
      strokesRef.current = [];
      lastPointRef.current = null;
    } else {
      void pauseSound();
    }
  }, [isRecording]);

  // Arrête et décharge le son courant lorsque la mélodie change
  useEffect(() => {
    void stopAndUnloadSound();
  }, [selectedMelodyId]);

  /** Arrête et décharge complètement le son courant */
  async function stopAndUnloadSound() {
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync(); // Arrête le son
        await soundRef.current.unloadAsync(); // Décharge le son
      } catch {
        // Ignore les erreurs
      }
      soundRef.current = null;
    }
  }

  /** Met en pause le son (sans le décharger) */
  async function pauseSound() {
    if (soundRef.current) {
      try {
        await soundRef.current.pauseAsync();
      } catch {
        // Ignore les erreurs
      }
    }
  }

  /**
   * S'assure qu'un son est joué pour la mélodie sélectionnée.
   * - Si pas de son chargé : on le crée et on le lance en boucle
   * - Sinon : on relance simplement la lecture
   */
  async function ensureSoundPlayingForCurrentMelody() {
    const melody = getMelodyById(selectedMelodyId);

    if (!melody) {
      return; // Si la mélodie est invalide, on arrête ici
    }

    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(melody.audio, {
          isLooping: true,
          volume: 0.8,
          shouldPlay: true,
        });
        soundRef.current = sound;
      }
    } catch (error) {
      console.warn("Erreur lors de la lecture du son", error);
    }
  }

  /** Modifie la vitesse de lecture du son en fonction de la vitesse du trait */
  async function updatePlaybackRate(speedPxPerSec: number) {
    if (!soundRef.current) return;

    const minRate = 0.8;
    const maxRate = 1.6;
    const clamped = Math.max(0, Math.min(1500, speedPxPerSec));
    const ratio = clamped / 1500;
    const rate = minRate + (maxRate - minRate) * ratio;

    try {
      await soundRef.current.setStatusAsync({
        rate,
        shouldCorrectPitch: true,
      });
    } catch {
      // Ignore les erreurs
    }
  }

  /** Gestion du layout : récupère la taille réelle du canvas */
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setCanvasSize({ width, height });
  };

  /** L'utilisateur commence à écrire sur le canvas */
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
      force: typeof force === "number" ? force : 0.5,
    };

    const newStroke: Stroke = [point];
    const newStrokes = [...strokesRef.current, newStroke];
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    lastPointRef.current = point;

    void ensureSoundPlayingForCurrentMelody();

    const newMetrics = computeMetrics(newStrokes);
    onMetricsChange(newMetrics);
  };

  /** L'utilisateur déplace son doigt sur le canvas */
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

    const last = lastPointRef.current;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      const dtMs = point.t - last.t;

      if (dtMs > 0) {
        const dist = Math.hypot(dx, dy);
        const speedPxPerSec = (dist / dtMs) * 1000;
        void updatePlaybackRate(speedPxPerSec);
      }
    }
    lastPointRef.current = point;

    const newMetrics = computeMetrics(newStrokes);
    onMetricsChange(newMetrics);
  };

  /** L'utilisateur arrête d'écrire */
  const handleEnd = () => {
    if (!isRecording) {
      return;
    }

    lastPointRef.current = null;
    void pauseSound();

    const newMetrics = computeMetrics(strokesRef.current);
    onMetricsChange(newMetrics);
  };

  /** Génère un chemin SVG à partir d'un stroke */
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
                  stroke="#4f46e5"
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

/* ===========================================================
   Calculs des métriques
   =========================================================== */

// Fonction pour restreindre une valeur dans une plage donnée
function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// Calcule le temps total de pause et le nombre de pauses entre les traits
function computePauseStats(strokes: Stroke[]) {
  let totalPauseMs = 0;
  let pauseCount = 0;

  for (let i = 0; i < strokes.length - 1; i++) {
    const currentStroke = strokes[i];
    const nextStroke = strokes[i + 1];
    const lastPoint = currentStroke.at(-1);
    const firstNext = nextStroke[0];

    if (!lastPoint || !firstNext) continue;

    const pause = firstNext.t - lastPoint.t;
    if (pause > PAUSE_THRESHOLD_MS) {
      totalPauseMs += pause;
      pauseCount += 1;
    }
  }

  return { totalPauseMs, pauseCount };
}

// Calcul des vitesses, de la distance totale et des changements brusques de vitesse
function computeSpeedStats(strokes: Stroke[]) {
  let totalDistance = 0;
  const speeds: number[] = [];
  let suddenChanges = 0;
  let lastSpeed: number | null = null;

  for (const stroke of strokes) {
    for (let i = 1; i < stroke.length; i++) {
      const p0 = stroke[i - 1];
      const p1 = stroke[i];
      const dtSec = (p1.t - p0.t) / 1000;

      if (dtSec <= 0) continue;

      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const dist = Math.hypot(dx, dy);
      const speed = dist / dtSec;

      totalDistance += dist;
      speeds.push(speed);

      if (
        lastSpeed !== null &&
        Math.abs(speed - lastSpeed) > SPEED_CHANGE_THRESHOLD
      ) {
        suddenChanges += 1;
      }

      lastSpeed = speed;
    }
  }

  return { totalDistance, speeds, suddenChanges };
}

// Calcule la boîte englobante des points pour l'amplitude et la longueur du mot
function computeBoundingBox(points: Point[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

// Calcule la force moyenne à partir de la pression
function computeAverageForce(points: Point[]): number {
  const forces = points
    .map((p) => p.force)
    .filter((f): f is number => typeof f === "number" && !Number.isNaN(f));

  if (forces.length === 0) {
    return 0;
  }

  const avgForce = forces.reduce((sum, f) => sum + f, 0) / forces.length;
  return Math.round(avgForce * 100);
}

// Calcule les corrections (changements brusques de direction)
function computeCorrections(strokes: Stroke[]) {
  let corrections = 0;

  for (const stroke of strokes) {
    for (let i = 2; i < stroke.length; i++) {
      const a = stroke[i - 2];
      const b = stroke[i - 1];
      const c = stroke[i];

      const angle1 = Math.atan2(b.y - a.y, b.x - a.x);
      const angle2 = Math.atan2(c.y - b.y, c.x - b.x);

      let diff = Math.abs(angle2 - angle1);
      if (diff > Math.PI) {
        diff = 2 * Math.PI - diff;
      }

      if (diff > Math.PI / 2) {
        corrections += 1;
      }
    }
  }

  return corrections;
}

// Calcule toutes les métriques (fluidité, vitesse, pauses, etc.)
function computeMetrics(strokes: Stroke[]): WritingMetrics {
  const allPoints = strokes.flat();
  if (allPoints.length < 2) {
    return { ...emptyMetrics }; // Retourne des métriques vides si pas assez de points
  }

  const { totalPauseMs, pauseCount } = computePauseStats(strokes);
  const { totalDistance, speeds, suddenChanges } = computeSpeedStats(strokes);

  const firstPoint = allPoints[0];
  const lastPoint = allPoints.at(-1); // Utilise `.at(-1)` pour obtenir le dernier point

  if (!lastPoint) {
    return { ...emptyMetrics }; // Retourne des métriques vides si le dernier point est manquant
  }

  const totalTimeMs = lastPoint.t - firstPoint.t;
  const effectiveDrawingMs = Math.max(0, totalTimeMs - totalPauseMs);
  const durationSec = Math.max(0.1, effectiveDrawingMs / 1000);

  const averageSpeed = totalDistance / durationSec;

  const pathLengthMm = totalDistance / PX_PER_MM;
  const { minX, maxX, minY, maxY } = computeBoundingBox(allPoints);
  const wordLengthMm = (maxX - minX) / PX_PER_MM;
  const amplitudeMm = (maxY - minY) / PX_PER_MM;

  const pauseRatio = totalTimeMs > 0 ? totalPauseMs / totalTimeMs : 0;
  const pauseTimeScore = 1 - clamp(pauseRatio / 0.5, 0, 1);
  const pauseCountScore = 1 - clamp(pauseCount / 6, 0, 1);
  const lengthScore = clamp(pathLengthMm / 20, 0, 1);
  let smoothnessScore = 1;

  if (speeds.length > 1) {
    const changeRate = suddenChanges / speeds.length;
    smoothnessScore = 1 - clamp(changeRate / 0.3, 0, 1);
  }

  const speedScore = clamp(averageSpeed / 800, 0, 1);

  const fluidityScore =
    0.35 * smoothnessScore +
    0.25 * pauseTimeScore +
    0.2 * pauseCountScore +
    0.1 * lengthScore +
    0.1 * speedScore;

  const fluidity = Math.round(fluidityScore * 100);

  const appliedForce = computeAverageForce(allPoints);

  const dxGlobal = lastPoint.x - firstPoint.x;
  const dyGlobal = lastPoint.y - firstPoint.y;
  const direction = (Math.atan2(dyGlobal, dxGlobal) * 180) / Math.PI;

  const corrections = computeCorrections(strokes);

  return {
    appliedForce,
    pauseTime: totalPauseMs,
    pauseCount,
    speedChanges: suddenChanges,
    fluidity,
    averageSpeed: Math.round(averageSpeed),
    direction: Math.round(direction),
    pathLength: Math.round(pathLengthMm),
    corrections,
    amplitude: Math.round(amplitudeMm),
    wordLength: Math.round(wordLengthMm),
  };
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
    color: "#111827",
    padding: 8,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  canvas: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    flex: 1,
    alignSelf: "stretch",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    margin: 16,
  },
  helperText: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
