import React, { useEffect, useRef, useState } from 'react';
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { melodyPlayer } from '../melodyPlayer';
import { computeMetrics, type Point, type Stroke } from '../metrics';
import type { WritingMetrics } from '../types';

interface WritingAreaProps {
  readonly isRecording: boolean;
  readonly metrics: WritingMetrics;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
  readonly selectedMelodyId: string;
}

/** Fonctions async hors du composant (Sonar + lisibilité) */
async function stopAndUnloadSound() {
  await melodyPlayer.stop();
}

async function pauseSound() {
  await melodyPlayer.pause();
}

async function updatePlaybackRate(speedPxPerSec: number) {
  await melodyPlayer.updateRateForSpeed(speedPxPerSec);
}

export function WritingArea({
  isRecording,
  metrics: _metrics,
  onMetricsChange,
  selectedMelodyId,
}: WritingAreaProps) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [canvasSize, setCanvasSize] = useState({
    width: 0,
    height: 0,
  });

  const strokesRef = useRef<Stroke[]>([]);
  const lastPointRef = useRef<Point | null>(null);

  // Pour savoir si on vient d'entrer en mode enregistrement
  const prevSelectedIdRef = useRef<string | null>(selectedMelodyId);
  const prevIsRecordingRef = useRef<boolean>(isRecording);

  // Nettoyage du son à la destruction
  useEffect(() => {
    return () => {
      void stopAndUnloadSound();
    };
  }, []);

  // Réinitialise les tracés au démarrage / met en pause au stop
  useEffect(() => {
    if (isRecording) {
      setStrokes([]);
      strokesRef.current = [];
      lastPointRef.current = null;
    } else {
      void pauseSound();
    }
  }, [isRecording]);

  /**
   * Gère :
   * - l'arrêt de toute musique quand on passe en mode enregistrement (pour couper la pré-écoute)
   * - le changement de mélodie pendant l'écriture (switch en douceur)
   */
  useEffect(() => {
    const prevSelectedId = prevSelectedIdRef.current;
    const prevIsRecording = prevIsRecordingRef.current;

    // 1) On vient de cliquer sur 'Démarrer' → couper toute musique en cours (pré-écoute)
    if (!prevIsRecording && isRecording) {
      void stopAndUnloadSound();
    }

    // 2) On est déjà en train d'écrire et on change de mélodie → lancer la nouvelle
    if (
      isRecording &&
      selectedMelodyId &&
      prevSelectedId &&
      selectedMelodyId !== prevSelectedId
    ) {
      void melodyPlayer.play(selectedMelodyId, {
        loop: true,
        volume: 0.8,
      });
    }

    prevSelectedIdRef.current = selectedMelodyId;
    prevIsRecordingRef.current = isRecording;
  }, [selectedMelodyId, isRecording]);

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
      force: typeof force === 'number' ? force : 0.5,
    };

    const newStroke: Stroke = [point];
    const newStrokes = [...strokesRef.current, newStroke];
    strokesRef.current = newStrokes;
    setStrokes(newStrokes);
    lastPointRef.current = point;

    // La musique ne démarre qu'au premier trait, pas au clic sur 'Démarrer'
    if (selectedMelodyId) {
      void melodyPlayer.play(selectedMelodyId, {
        loop: true,
        volume: 0.8,
      });
    }

    const newMetrics = computeMetrics(newStrokes);
    onMetricsChange(newMetrics);
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
      force: typeof force === 'number' ? force : 0.5,
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

  /** Doigt levé */
  const handleEnd = () => {
    if (!isRecording) {
      return;
    }

    lastPointRef.current = null;
    void pauseSound();

    const newMetrics = computeMetrics(strokesRef.current);
    onMetricsChange(newMetrics);
  };

  const renderPath = (stroke: Stroke) => {
    if (stroke.length === 0) return '';
    return stroke
      .map((p, index) => `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
      .join(' ');
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
          <Svg width='100%' height='100%'>
            {strokes.map((stroke) => {
              const firstPoint = stroke[0];
              const key = firstPoint
                ? `stroke-${firstPoint.t}`
                : `stroke-${Math.random()}`;
              return (
                <Path
                  key={key}
                  d={renderPath(stroke)}
                  stroke='#4f46e5'
                  strokeWidth={4}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  fill='none'
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
    alignSelf: 'stretch',
    gap: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    padding: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  canvas: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    margin: 16,
  },
  helperText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
