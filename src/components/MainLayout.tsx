import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { WritingMetrics } from '../types';
import { KinematicMetrics } from './KinematicMetrics';
import { KineticMetrics } from './KineticMetrics';
import { MelodySelector } from './MelodySelector';

interface MainLayoutProps {
  readonly metrics: WritingMetrics;
}

export function MainLayout({ metrics }: MainLayoutProps) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const zone1Height = width * 0.5; // Zone 1 = 50% de la largeur de l'écran

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone 1 : Zone de texte / écriture */}
        <View style={styles.fullWidth}>
          <View style={[styles.zoneCard, { height: zone1Height }]}>
            <Text style={styles.zoneTitle}>Zone 1 — Zone de texte</Text>
            <Text style={styles.zoneText}>
              Ici, nous mettrons plus tard la zone d&apos;écriture.
            </Text>
          </View>
        </View>

        {/* Zone 2 : Sélection des mélodies */}
        <View style={styles.fullWidth}>
          <View style={styles.zoneCard}>
            <MelodySelector />
          </View>
        </View>

        {/* Zones 3 & 4 : métriques cinétiques et cinématiques */}
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
  // Fond global des zones
  root: {
    flex: 1,
    backgroundColor: '#f5ddcfff',
  },
  container: {
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  // Largeur max pour que ça reste propre sur tablette
  fullWidth: {
    width: '100%',
    maxWidth: 1000,
  },
  // Style commun de Zone 1 & Zone 2
  zoneCard: {
    padding: 12, 
    borderRadius: 8,
    backgroundColor: '#f3e6e6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#111827',
    textAlign: 'center',
  },
  zoneText: {
    fontSize: 13,
    color: '#4b5563',
    textAlign: 'center',
  },
  // Conteneur pour les zones 3 & 4
  metricsRow: {
    flexDirection: 'column', // téléphone : l'une sous l'autre
    gap: 12,
    alignItems: 'stretch',
  },
  metricsRowTablet: {
    flexDirection: 'row', // tablette : côte à côte
  },
  metricsColumn: {
    flex: 1,
  },
  // Cartes métriques (3 & 4) avec même hauteur
  metricsCard: {
    flex: 1, // occupe toute la hauteur dispo dans la colonne
    padding: 14, // un peu plus de padding que les autres zones
    borderRadius: 8,
    backgroundColor: '#f3e6e6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
  },
});
