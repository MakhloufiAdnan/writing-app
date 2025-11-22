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
import { MELODIES, type Melody } from "../models/melodies";
import { melodyPlayer } from "../models/melodyPlayer";

interface MelodySelectorProps {
  readonly selectedId?: string;
  readonly onChangeSelected?: (id: string) => void;
}

/**
 * Zone 2 : sélection des 6 mélodies.
 * - Affiche des carreaux (2x3 en phone, grille en tablette)
 * - Permet de tester un son en appuyant sur un carreau
 * - Le carreau sélectionné a un contour vert
 */
export function MelodySelector({
  selectedId: externalSelectedId,
  onChangeSelected,
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

  const handlePress = async (melodyId: string) => {
    const melody = MELODIES.find((m: Melody) => m.id === melodyId);
    if (!melody) return;

    // Mise à jour de la sélection
    const newSelectedId = melody.id;
    setInternalSelectedId(newSelectedId);
    onChangeSelected?.(newSelectedId);

    // Si on reclique sur la même → on arrête le son
    if (playingId === melody.id) {
      await melodyPlayer.stop();
      setPlayingId(null);
      return;
    }

    // Sinon on lance un aperçu (non bouclé)
    try {
      await melodyPlayer.play(melody.id, { loop: false, volume: 1 });
      setPlayingId(melody.id);
    } catch {
      setPlayingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choisis ta mélodie</Text>
      <Text style={styles.sectionSubtitle}>
        Appuie sur un carreau pour écouter et choisir le son de l&apos;écriture.
      </Text>

      <View style={styles.grid}>
        {MELODIES.map((melody: Melody) => {
          const isSelected = internalSelectedId === melody.id;
          const isPlaying = playingId === melody.id;

          return (
            <Pressable
              key={melody.id}
              onPress={() => void handlePress(melody.id)}
              style={({ pressed }) => [
                styles.tile,
                {
                  width: tileSize,
                  height: tileSize,
                },
                isSelected && styles.tileSelected,
                pressed && styles.tilePressed,
              ]}
            >
              <Image source={melody.image} style={styles.tileImage} />

              <View style={styles.tileOverlay}>
                <Text style={styles.tileLabel}>{melody.label}</Text>
                <Text style={styles.tileDescription}>{melody.description}</Text>

                <View style={styles.tileFooter}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={16}
                    color="#ffffff"
                    style={styles.tileIcon}
                  />
                  <Text style={styles.tileFooterText}>
                    {isPlaying ? "En lecture" : "Tester"}
                  </Text>
                </View>
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
    color: "#111827",
    textAlign: "center",
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#4b5563",
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
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
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
    color: "#ffffff",
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
    color: "#ffffff",
  },
  selectedText: {
    marginTop: 4,
    fontSize: 12,
    color: "#4b5563",
    textAlign: "center",
  },
  selectedStrong: {
    fontWeight: "600",
    color: "#111827",
  },
});
