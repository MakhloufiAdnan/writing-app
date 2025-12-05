// src/views/MelodySelector.tsx
// Sélecteur de mélodies : grille de 6 tuiles avec pré-écoute.
// IMPORTANT : la sélection est VERROUILLÉE pendant l'écriture (isRecording).

import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import type { WritingAudioPort } from "../models/audio";
import { MELODIES, type Melody } from "../models/melodies";
import { COLORS } from "../theme";

interface MelodySelectorProps {
  readonly selectedId?: string;
  readonly onChangeSelected?: (id: string) => void;
  readonly audio: WritingAudioPort;
  /** Si true, la sélection est verrouillée (pas de clic ni de pré-écoute) */
  readonly isRecording: boolean;
}

/**
 * Zone 2 : sélection des 6 mélodies.
 * - Quand isRecording === false : pré-écoute + changement de sélection autorisés.
 * - Quand isRecording === true : la grille est verrouillée pour ne pas fausser les métriques.
 */
export function MelodySelector({
  selectedId: externalSelectedId,
  onChangeSelected,
  audio,
  isRecording,
}: MelodySelectorProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // Calcul d'une taille de carreau responsive
  const effectiveWidth = Math.min(width, 1000) - 24;
  const tileSize = isTablet
    ? 130
    : Math.max(90, Math.floor(effectiveWidth / 3) - 8);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    externalSelectedId ?? null
  );
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Sync avec l'extérieur si le parent contrôle la sélection
  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setInternalSelectedId(externalSelectedId);
    }
  }, [externalSelectedId]);

  // Si on démarre l'enregistrement, on nettoie l'état de pré-écoute
  useEffect(() => {
    if (isRecording && playingId !== null) {
      setPlayingId(null);
    }
  }, [isRecording, playingId]);

  const handlePress = async (melodyId: string) => {
    // 🔒 Si on est en train d'enregistrer, on ignore tout clic
    if (isRecording) {
      return;
    }

    const melody = MELODIES.find((m: Melody) => m.id === melodyId);
    if (!melody) return;

    // Mise à jour de la sélection
    const newSelectedId = melody.id;
    setInternalSelectedId(newSelectedId);
    onChangeSelected?.(newSelectedId);

    // Gestion pré-écoute (uniquement hors enregistrement)

    // Si on reclique sur la même → on arrête le son
    if (playingId === melody.id) {
      await audio.stop();
      setPlayingId(null);
      return;
    }

    // Sinon on lance un aperçu (non bouclé)
    try {
      await audio.playPreview(melody.id);
      setPlayingId(melody.id);
    } catch {
      setPlayingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choisis ta mélodie</Text>
      <Text style={styles.sectionSubtitle}>
        Avant de démarrer l&apos;écriture, écoute et sélectionne le son qui te
        convient.
      </Text>

      <View style={styles.grid}>
        {MELODIES.map((melody: Melody) => {
          const isSelected = internalSelectedId === melody.id;
          const isPlaying = playingId === melody.id;

          return (
            <Pressable
              key={melody.id}
              onPress={() => void handlePress(melody.id)}
              disabled={isRecording}
              style={({ pressed }) => [
                styles.tile,
                {
                  width: tileSize,
                  height: tileSize,
                },
                isSelected && styles.tileSelected,
                pressed && !isRecording && styles.tilePressed,
                isRecording && styles.tileDisabled,
              ]}
            >
              <Image source={melody.image} style={styles.tileImage} />

              <View style={styles.tileOverlay}>
                <Text style={styles.tileLabel}>{melody.label}</Text>
                <Text style={styles.tileDescription}>{melody.description}</Text>

                {!isRecording && (
                  <View style={styles.tileFooter}>
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={16}
                      color={COLORS.white}
                      style={styles.tileIcon}
                    />
                    <Text style={styles.tileFooterText}>
                      {isPlaying ? "En lecture" : "Tester"}
                    </Text>
                  </View>
                )}
                {isRecording && (
                  <Text style={styles.tileFooterText}>Mélodie verrouillée</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      {internalSelectedId && (
        <Text style={styles.selectedText}>
          Mélodie choisie :{" "}
          <Text style={styles.selectedStrong}>
            {MELODIES.find((m: Melody) => m.id === internalSelectedId)?.label ??
              "—"}
          </Text>
        </Text>
      )}

      {isRecording && (
        <Text style={styles.lockedText}>
          La sélection des mélodies est désactivée pendant l&apos;écriture.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tile: {
    margin: 6,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: COLORS.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: COLORS.accentGreen,
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  tileDisabled: {
    opacity: 0.5,
  },
  tileImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  tileOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.white,
  },
  tileDescription: {
    fontSize: 11,
    color: "#e5e7eb",
  },
  tileFooter: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  tileIcon: {
    marginRight: 4,
  },
  tileFooterText: {
    fontSize: 11,
    color: COLORS.white,
  },
  selectedText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  selectedStrong: {
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  lockedText: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
