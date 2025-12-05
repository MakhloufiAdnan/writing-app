// src/theme.ts
// Thème global de l'application : couleurs réutilisables partout.

export const COLORS = {
  /** Couleur de fond principale de l'application */
  background: "#f5ddcfff",

  /** Fond des cartes / panneaux */
  card: "#f3e6e6ff",

  /** Texte principal (titres, infos importantes) */
  textPrimary: "#111827",

  /** Texte secondaire (sous-titres, infos complémentaires) */
  textSecondary: "#4b5563",

  /** Bordures / séparateurs */
  border: "#e5e7eb",

  /** Accent positif (validation, success, démarrer, etc.) */
  accentGreen: "#22c55e",

  /** Accent négatif (erreur, stop, etc.) */
  accentRed: "#ef4444",

  /** Accent principal (tracé, éléments interactifs) */
  accentBlue: "#0f0a60ff",

  /** Texte / éléments désactivés ou moins importants */
  muted: "#9ca3af",

  /** Blanc standard */
  white: "#ffffff",
} as const;
