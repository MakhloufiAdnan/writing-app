import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { WritingMetrics } from "../types";

interface SummaryTableProps {
  readonly metrics: WritingMetrics;
}

export function SummaryTable({ metrics }: SummaryTableProps) {
  const pauseSeconds = metrics.pauseTime / 1000;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tableau Récapitulatif des Métriques</Text>

      <View style={styles.tableContainer}>
        <View style={styles.table}>
          {/* Row for Kinetic Metrics */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Force appliquée</Text>
            <Text style={styles.tableCell}>{`${metrics.appliedForce} %`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Temps de pause</Text>
            <Text style={styles.tableCell}>{`${pauseSeconds.toFixed(1)} s`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Nombre de pauses</Text>
            <Text style={styles.tableCell}>{metrics.pauseCount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Fluidité</Text>
            <Text style={styles.tableCell}>{`${metrics.fluidity} %`}</Text>
          </View>

          {/* Row for Kinematic Metrics */}
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Vitesse moyenne</Text>
            <Text style={styles.tableCell}>{`${metrics.averageSpeed} px/s`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Direction</Text>
            <Text style={styles.tableCell}>{`${metrics.direction} °`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Longueur du tracé</Text>
            <Text style={styles.tableCell}>{`${metrics.pathLength} mm`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Corrections</Text>
            <Text style={styles.tableCell}>{metrics.corrections}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Amplitude</Text>
            <Text style={styles.tableCell}>{`${metrics.amplitude} mm`}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Longueur du mot</Text>
            <Text style={styles.tableCell}>{`${metrics.wordLength} mm`}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5ddcfff",
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  tableContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3e6e6ff",
  },
  table: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    justifyContent: "space-between",
  },
  tableCell: {
    fontSize: 14,
    color: "#111827",
  },
});
