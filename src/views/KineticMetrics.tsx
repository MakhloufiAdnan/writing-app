import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import type { WritingMetrics } from "../models/types";
import { COLORS } from "../theme";

interface KineticMetricsProps {
  readonly metrics: WritingMetrics;
}

interface MetricRowProps {
  readonly label: string;
  readonly value: string;
}

/**
 * Ligne simple pour afficher une métrique (sans icône).
 */
function MetricRow({ label, value }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

/**
 * Zone 3 : affichage des métriques cinétiques
 * (force, pauses, changements de vitesse, fluidité)
 * + icône pour ouvrir un graphique détaillant chaque levée de stylo.
 */
export function KineticMetrics({ metrics }: KineticMetricsProps) {
  const pauseSeconds = (metrics.pauseTime / 1000).toFixed(1);
  const [showPenLiftChart, setShowPenLiftChart] = useState(false);

  let fluidityLabel = "Écriture modérée";
  let fluidityColor = styles.badgeMedium;

  if (metrics.fluidity >= 70) {
    fluidityLabel = "Écriture fluide";
    fluidityColor = styles.badgeGood;
  } else if (metrics.fluidity < 40) {
    fluidityLabel = "Écriture saccadée";
    fluidityColor = styles.badgeBad;
  }

  // Prépare les données du graphique (durée de chaque levée de stylo en secondes)
  const penLiftDurationsSec = useMemo(
    () => metrics.penLiftDurations.map((ms) => ms / 1000),
    [metrics.penLiftDurations]
  );

  const maxDurationSec = useMemo(
    () => (penLiftDurationsSec.length ? Math.max(...penLiftDurationsSec) : 0),
    [penLiftDurationsSec]
  );

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

        {/* Nombre de pauses + icône pour afficher le graphique des levées de stylo */}
        <View style={styles.metricRow}>
          <Text style={styles.metricLabel}>Nombre de pauses</Text>
          <View style={styles.metricValueWithIcon}>
            <Text style={styles.metricValue}>{metrics.pauseCount}</Text>

            {penLiftDurationsSec.length > 0 && (
              <Pressable
                onPress={() => setShowPenLiftChart(true)}
                style={styles.iconButton}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={16}
                  color={COLORS.accentBlue}
                />
              </Pressable>
            )}
          </View>
        </View>

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

      {/* Modal avec graphique de levée de stylo */}
      <Modal
        visible={showPenLiftChart}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPenLiftChart(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Levées de stylo</Text>
            <Text style={styles.modalSubtitle}>
              Durée de chaque levée (pauses) en secondes.
            </Text>

            {penLiftDurationsSec.length === 0 ? (
              <Text style={styles.modalEmptyText}>
                Pas encore de levée de stylo détectée.
              </Text>
            ) : (
              <View style={styles.chartArea}>
                {penLiftDurationsSec.map((value, index) => {
                  const ratio = maxDurationSec > 0 ? value / maxDurationSec : 0;
                  const barHeight = 12 + ratio * 80; // px

                  return (
                    <View
                      key={`lift-${index}-${value.toFixed(3)}`}
                      style={styles.chartBarContainer}
                    >
                      <View style={[styles.chartBar, { height: barHeight }]} />
                      <Text style={styles.chartBarLabel}>{index + 1}</Text>
                      <Text style={styles.chartBarValue}>
                        {value.toFixed(2)}s
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}

            <Pressable
              onPress={() => setShowPenLiftChart(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    color: COLORS.textSecondary,
  },
  list: {
    marginTop: 4,
    gap: 4,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  metricValueWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    padding: 2,
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
    color: COLORS.textSecondary,
  },
  fluidityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fluidityValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  badgeBase: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textPrimary,
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

  // Modal & graphique
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  modalSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalEmptyText: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chartArea: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  chartBarContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  chartBar: {
    width: 14,
    borderRadius: 6,
    backgroundColor: COLORS.accentBlue,
  },
  chartBarLabel: {
    marginTop: 4,
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  chartBarValue: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  modalCloseButton: {
    marginTop: 16,
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.accentBlue,
  },
  modalCloseText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.white,
  },
});
