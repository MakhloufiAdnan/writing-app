export interface WritingMetrics {
  // Cinétiques
  appliedForce: number;   // 0–100 (%)
  pauseTime: number;      // ms
  pauseCount: number;
  speedChanges: number;
  fluidity: number;       // 0–100

  // Cinématiques
  averageSpeed: number;   // px/s
  direction: number;      // degrés
  pathLength: number;     // mm
  corrections: number;
  amplitude: number;      // mm
  wordLength: number;     // mm
}

// Valeurs d'exemple pour voir le rendu (je branche les vraies plus tard)
export const initialMetrics: WritingMetrics = {
  appliedForce: 62,
  pauseTime: 3200,
  pauseCount: 4,
  speedChanges: 3,
  fluidity: 78,

  averageSpeed: 115,
  direction: 8,
  pathLength: 96,
  corrections: 2,
  amplitude: 18,
  wordLength: 54,
};
