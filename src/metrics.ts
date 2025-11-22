import { emptyMetrics, type WritingMetrics } from "./types";

export type Point = { x: number; y: number; t: number; force?: number };
export type Stroke = Point[];

// Conversion px → mm (approx 96 dpi)
const PX_PER_MM = 3.78;
// Seuil changement brusque de vitesse
const SPEED_CHANGE_THRESHOLD = 600; // px/s
// Seuil de pause entre traits
const PAUSE_THRESHOLD_MS = 150; // ms

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

export function computeMetrics(strokes: Stroke[]): WritingMetrics {
  const allPoints = strokes.flat();
  if (allPoints.length < 2) {
    return { ...emptyMetrics };
  }

  const { totalPauseMs, pauseCount } = computePauseStats(strokes);
  const { totalDistance, speeds, suddenChanges } = computeSpeedStats(strokes);

  const firstPoint = allPoints[0];
  const lastPoint = allPoints.at(-1);

  if (!lastPoint) {
    return { ...emptyMetrics };
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
