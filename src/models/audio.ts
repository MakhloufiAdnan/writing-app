export interface WritingAudioPort {
  /** Lecture en boucle pendant l'écriture */
  playLoop(melodyId: string): Promise<void>;

  /** Lecture courte pour tester une mélodie */
  playPreview(melodyId: string): Promise<void>;

  /** Ajuste la vitesse de lecture en fonction de la vitesse d'écriture */
  updateRate(speedPxPerSec: number): Promise<void>;

  /**
   * Ajuste le volume de lecture en fonction de la hauteur d'écriture.
   * @param volume Volume normalisé entre 0 et 1.
   */
  updateVolume(volume: number): Promise<void>;

  /** Met en pause la lecture en cours */
  pause(): Promise<void>;

  /** Arrête complètement la lecture et libère les ressources */
  stop(): Promise<void>;
}
