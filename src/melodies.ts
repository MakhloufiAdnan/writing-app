import type { AVPlaybackSource } from "expo-av";
import type { ImageSourcePropType } from "react-native";

/** Description d'une mélodie disponible dans l'application */
export interface Melody {
  id: string;
  label: string;
  description: string;
  audio: AVPlaybackSource;
  image: ImageSourcePropType;
}

/**
 * Tableau des 6 mélodies, images et descriptions associées.
 */
export const MELODIES: readonly Melody[] = [
  {
    id: 'melody1',
    label: 'Piano doux',
    description: 'Calme et rassurant',
    audio: require('../assets/audios/cozy-warm-relaxing-piano-275983.mp3'),
    image: require('../assets/images/ai-generated-9226588_640.jpg'),
  },
  {
    id: 'melody2',
    label: 'Xylophone',
    description: 'Léger et joyeux',
    audio: require('../assets/audios/emotional-soft-piano-inspiring-438654.mp3'),
    image: require('../assets/images/easter-bunnies-6082603_640.jpg'),
  },
  {
    id: 'melody3',
    label: 'Flûte',
    description: 'Aérien et fluide',
    audio: require('../assets/audios/funny-holidays-281237.mp3'),
    image: require('../assets/images/music-1429318_640.jpg'),
  },
  {
    id: 'melody4',
    label: 'Clochettes',
    description: 'Magique et scintillant',
    audio: require('../assets/audios/game-gaming-minecraft-background-music-377647.mp3'),
    image: require('../assets/images/music-6772526_640.png'),
  },
  {
    id: 'melody5',
    label: 'Synthé',
    description: 'Moderne et rythmique',
    audio: require('../assets/audios/cozy-warm-relaxing-piano-275983.mp3'),
    image: require('../assets/images/musician-4207759_640.png'),
  },
  {
    id: 'melody6',
    label: 'Étoiles',
    description: 'Onirique et doux',
    audio: require('../assets/audios/funny-holidays-281237.mp3'),
    image: require('../assets/images/musicians-7133408_640.png'),
  },
];

/** Récupérer une mélodie par son id */
export function getMelodyById(id: string | null | undefined) {
  return MELODIES.find((m) => m.id === id);
}
