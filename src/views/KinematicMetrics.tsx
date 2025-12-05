import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { WritingMetrics } from "../models/types";
import { COLORS } from "../theme";

interface KinematicMetricsProps {
  readonly metrics: WritingMetrics;
}

interface MetricRowProps {
  readonly label: string;
  readonly value: string;
}

/**
 * Zone 4 : affichage des métriques cinématiques
 * (vitesse, direction, trajectoire, corrections, etc.)
 */
export function KinematicMetrics({ metrics }: KinematicMetricsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métriques cinématiques</Text>
      <Text style={styles.subtitle}>Vitesse, direction et forme du tracé.</Text>

      <View style={styles.list}>
        <MetricRow
          label="Vitesse moyenne"
          value={`${metrics.averageSpeed} px/s`}
        />
        <MetricRow
          label="Direction principale"
          value={`${metrics.direction}°`}
        />
        <MetricRow
          label="Trajectoire du mouvement"
          value={`${metrics.pathLength} mm`}
        />
        <MetricRow
          label="Corrections d'erreurs"
          value={`${metrics.corrections}`}
        />
        <MetricRow
          label="Amplitude du mouvement"
          value={`${metrics.amplitude} mm`}
        />
        <MetricRow
          label="Longueur du mot écrit"
          value={`${metrics.wordLength} mm`}
        />
      </View>
    </View>
  );
}

function MetricRow({ label, value }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  list: {
    marginTop: 4,
    gap: 4,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  metricValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
});
