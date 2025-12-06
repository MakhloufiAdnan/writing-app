/** Mode de la zone d'écriture */
export type WritingMode = "blank" | "seyes";

/** Épaisseur du trait (en pixels) */
export type StrokeWidth = 1 | 2 | 3 | 4;

/** Épaisseur de la gomme (en pixels) */
export type EraserWidth = 2 | 4 | 8;

/** Toutes les métriques affichées dans le tableau de bord */
export interface WritingMetrics {
  // Cinétiques
  appliedForce: number;   // Force moyenne appliquée (0–100)
  pauseTime: number;      // Temps total de pause en ms
  pauseCount: number;     // Nombre de pauses détectées
  speedChanges: number;   // Changements brusques de vitesse
  fluidity: number;       // Score de fluidité 0–100

  // Cinématiques
  averageSpeed: number;   // Vitesse moyenne (px/s)
  direction: number;      // Direction globale du tracé (en degrés)
  pathLength: number;     // Longueur du tracé (mm)
  corrections: number;    // Nombre de corrections (changements de direction brusques)
  amplitude: number;      // Amplitude verticale (mm)
  wordLength: number;     // Longueur du mot écrit (mm)
}

/** Métriques initiales (tout à zéro) */
export const emptyMetrics: WritingMetrics = {
  appliedForce: 0,
  pauseTime: 0,
  pauseCount: 0,
  speedChanges: 0,
  fluidity: 0,
  averageSpeed: 0,
  direction: 0,
  pathLength: 0,
  corrections: 0,
  amplitude: 0,
  wordLength: 0,
};
