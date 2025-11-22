import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Audio, type AVPlaybackSource } from 'expo-av';
import type { ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Melody {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly audio: AVPlaybackSource;
  readonly image: ImageSourcePropType;
}

const MELODIES: readonly Melody[] = [
  {
    id: 'melody1',
    label: 'Piano doux',
    description: 'Calme et rassurant',
    audio: require('../../assets/audios/cozy-warm-relaxing-piano-275983.mp3'),
    image: require('../../assets/images/ai-generated-9226588_640.jpg'),
  },
  {
    id: 'melody2',
    label: 'Xylophone',
    description: 'Léger et joyeux',
    audio: require('../../assets/audios/emotional-soft-piano-inspiring-438654.mp3'),
    image: require('../../assets/images/easter-bunnies-6082603_640.jpg'),
  },
  {
    id: 'melody3',
    label: 'Flûte',
    description: 'Aérien et fluide',
    audio: require('../../assets/audios/funny-holidays-281237.mp3'),
    image: require('../../assets/images/music-1429318_640.jpg'),
  },
  {
    id: 'melody4',
    label: 'Clochettes',
    description: 'Magique et scintillant',
    audio: require('../../assets/audios/game-gaming-minecraft-background-music-377647.mp3'),
    image: require('../../assets/images/music-6772526_640.png'),
  },
  {
    id: 'melody5',
    label: 'Synthé',
    description: 'Moderne et rythmique',
    audio: require('../../assets/audios/cozy-warm-relaxing-piano-275983.mp3'),
    image: require('../../assets/images/musician-4207759_640.png'),
  },
  {
    id: 'melody6',
    label: 'Étoiles',
    description: 'Onirique et doux',
    audio: require('../../assets/audios/funny-holidays-281237.mp3'),
    image: require('../../assets/images/musicians-7133408_640.png'),
  },
];

interface MelodySelectorProps {
  readonly selectedId?: string;
  readonly onChangeSelected?: (id: string) => void;
}

export function MelodySelector({
  selectedId: externalSelectedId,
  onChangeSelected,
}: MelodySelectorProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  // On limite à la même largeur que nos zones (max 1000)
  const effectiveWidth = Math.min(width, 1000) - 24; // marge approximative
  // Sur téléphone : 3 colonnes, taille calculée
  // Sur tablette : taille fixe ~130
  const tileSize = isTablet
    ? 130
    : Math.max(90, Math.floor(effectiveWidth / 3) - 8);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(
    externalSelectedId ?? null,
  );
  const [playingId, setPlayingId] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Si le parent fournit un selectedId, on le suit
  useEffect(() => {
    if (externalSelectedId !== undefined) {
      setInternalSelectedId(externalSelectedId);
    }
  }, [externalSelectedId]);

  // Nettoyage audio à la destruction
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const handlePress = async (melody: Melody) => {
    const newSelectedId = melody.id;
    setInternalSelectedId(newSelectedId);
    onChangeSelected?.(newSelectedId);

    // Si on reclique sur celle qui joue déjà → on arrête la lecture
    if (playingId === melody.id) {
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch {
          // ignore
        }
        soundRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    // Sinon on arrête l’éventuel son précédent
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // ignore
      }
      soundRef.current = null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(melody.audio, {
        shouldPlay: true,
      });
      soundRef.current = sound;
      setPlayingId(melody.id);
      await sound.playAsync();
    } catch (error) {
      console.warn('Erreur lecture son', error);
      setPlayingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choisis ta mélodie</Text>
      <Text style={styles.sectionSubtitle}>
        Appuie sur une image pour écouter et choisir ta mélodie.
      </Text>

      <View style={styles.grid}>
        {MELODIES.map((melody) => {
          const isSelected = internalSelectedId === melody.id;
          const isPlaying = playingId === melody.id;

          return (
            <Pressable
              key={melody.id}
              onPress={() => void handlePress(melody)}
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
                    name={isPlaying ? 'pause' : 'play'}
                    size={16}
                    color="#ffffff"
                    style={styles.tileIcon}
                  />
                  <Text style={styles.tileFooterText}>
                    {isPlaying ? 'En lecture' : 'Tester'}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {internalSelectedId && (
        <Text style={styles.selectedText}>
          Mélodie choisie :{' '}
          <Text style={styles.selectedStrong}>
            {MELODIES.find((m) => m.id === internalSelectedId)?.label ??
              '—'}
          </Text>
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tile: {
    margin: 6,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  tileSelected: {
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  tileImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  tileOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.55)', // overlay sombre
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
  },
  tileDescription: {
    fontSize: 11,
    color: '#e5e7eb',
  },
  tileFooter: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tileIcon: {
    marginRight: 4,
  },
  tileFooterText: {
    fontSize: 11,
    color: '#ffffff',
  },
  selectedText: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
    textAlign: 'center',
  },
  selectedStrong: {
    fontWeight: '600',
    color: '#111827',
  },
});
