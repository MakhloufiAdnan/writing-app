import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { WritingMetrics } from "../models/types";

interface KineticMetricsProps {
  readonly metrics: WritingMetrics;
}

interface MetricRowProps {
  readonly label: string;
  readonly value: string;
}

/**
 * Zone 3 : affichage des métriques cinétiques
 * (force, pauses, changements de vitesse, fluidité)
 */
export function KineticMetrics({ metrics }: KineticMetricsProps) {
  const pauseSeconds = (metrics.pauseTime / 1000).toFixed(1);

  let fluidityLabel = "Écriture modérée";
  let fluidityColor = styles.badgeMedium;

  if (metrics.fluidity >= 70) {
    fluidityLabel = "Écriture fluide";
    fluidityColor = styles.badgeGood;
  } else if (metrics.fluidity < 40) {
    fluidityLabel = "Écriture saccadée";
    fluidityColor = styles.badgeBad;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Métriques cinétiques</Text>
      <Text style={styles.subtitle}>
        Force, pauses et fluidité de l&apos;écriture.
      </Text>

      <View style={styles.list}>
        <MetricRow
          label="Force appliquée"
          value={`${metrics.appliedForce} %`}
        />
        <MetricRow label="Temps de pauses" value={`${pauseSeconds} s`} />
        <MetricRow label="Nombre de pauses" value={`${metrics.pauseCount}`} />
        <MetricRow
          label="Changements brusques de vitesse"
          value={`${metrics.speedChanges}`}
        />
      </View>

      <View style={styles.fluidityBlock}>
        <Text style={styles.fluidityLabel}>Fluidité de l&apos;écriture</Text>
        <View style={styles.fluidityRow}>
          <View style={[styles.badgeBase, fluidityColor]}>
            <Text style={styles.badgeText}>{fluidityLabel}</Text>
          </View>
          <Text style={styles.fluidityValue}>{metrics.fluidity} %</Text>
        </View>
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
    color: "#111827",
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
    color: "#4b5563",
  },
  metricValue: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  fluidityBlock: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    gap: 4,
  },
  fluidityLabel: {
    fontSize: 13,
    color: "#4b5563",
  },
  fluidityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fluidityValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#111827",
  },
  badgeGood: {
    backgroundColor: "#bbf7d0",
  },
  badgeMedium: {
    backgroundColor: "#fee2b3",
  },
  badgeBad: {
    backgroundColor: "#fecaca",
  },
});
