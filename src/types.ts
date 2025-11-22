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

export const emptyMetrics: WritingMetrics = {
  appliedForce: 0,
  pauseTime: 0,
  pauseCount: 0,
  speedChanges: 0,
  fluidity: 100,

  averageSpeed: 0,
  direction: 0,
  pathLength: 0,
  corrections: 0,
  amplitude: 0,
  wordLength: 0,
};
