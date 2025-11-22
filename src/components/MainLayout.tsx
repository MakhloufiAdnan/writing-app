import React from 'react';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import type { WritingMetrics } from '../types';
import { KinematicMetrics } from './KinematicMetrics';
import { KineticMetrics } from './KineticMetrics';
import { MelodySelector } from './MelodySelector';
import { WritingArea } from './WritingArea';

interface MainLayoutProps {
  readonly metrics: WritingMetrics;
  readonly isRecording: boolean;
  readonly selectedMelodyId: string;
  readonly onChangeSelectedMelody: (id: string) => void;
  readonly onMetricsChange: (metrics: WritingMetrics) => void;
}

/**
 * Disposition des 4 zones dans le main :
 * 1. Zone d'écriture (pleine largeur, hauteur = 50% de la largeur écran)
 * 2. Zone de sélection des mélodies
 * 3. Zone métriques cinétiques (gauche en tablette)
 * 4. Zone métriques cinématiques (droite en tablette)
 */
export function MainLayout({
  metrics,
  isRecording,
  selectedMelodyId,
  onChangeSelectedMelody,
  onMetricsChange,
}: MainLayoutProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const zone1Height = width * 0.4;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone 1 : Zone d'écriture */}
        <View style={styles.fullWidth}>
          <View
            style={[
              styles.zoneCard,
              styles.zoneWriting,
              { height: zone1Height },
            ]}
          >
            <WritingArea
              isRecording={isRecording}
              metrics={metrics}
              onMetricsChange={onMetricsChange}
              selectedMelodyId={selectedMelodyId}
            />
          </View>
        </View>

        {/* Zone 2 : Sélection des mélodies */}
        <View style={styles.fullWidth}>
          <View style={styles.zoneCard}>
            <MelodySelector
              selectedId={selectedMelodyId}
              onChangeSelected={onChangeSelectedMelody}
            />
          </View>
        </View>

        {/* Zones 3 & 4 : métriques cinétiques / cinématiques */}
        <View style={styles.fullWidth}>
          <View
            style={[styles.metricsRow, isTablet && styles.metricsRowTablet]}
          >
            <View style={styles.metricsColumn}>
              <View style={styles.metricsCard}>
                <KineticMetrics metrics={metrics} />
              </View>
            </View>
            <View style={styles.metricsColumn}>
              <View style={styles.metricsCard}>
                <KinematicMetrics metrics={metrics} />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5ddcfff',
  },
  container: {
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  fullWidth: {
    width: '100%',
    maxWidth: 1000,
  },
  zoneCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f3e6e6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  zoneWriting: {
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  metricsRow: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'stretch',
  },
  metricsRowTablet: {
    flexDirection: 'row',
  },
  metricsColumn: {
    flex: 1,
  },
  metricsCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#f3e6e6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
