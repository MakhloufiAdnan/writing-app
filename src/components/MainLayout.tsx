import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';

export function MainLayout() {
  // Hook moderne pour récupérer les dimensions de l’écran
  const { width } = useWindowDimensions();

  // Hauteur de la zone 1 = 50% de la largeur de l’écran
  const zone1Height = width * 0.5;

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Zone 1 : Zone de texte */}
        <View style={[styles.zone, { height: zone1Height }]}>
          <Text style={styles.zoneTitle}>Zone 1 — Zone de texte</Text>
          <Text style={styles.zoneText}>
            Ici, nous mettrons plus tard la zone d&apos;écriture / texte.
          </Text>
        </View>

        {/* Zone 2 */}
        <View style={styles.zone}>
          <Text style={styles.zoneTitle}>Zone 2</Text>
          <Text style={styles.zoneText}>
            Contenu à définir (par exemple : métriques cinétiques).
          </Text>
        </View>

        {/* Zone 3 */}
        <View style={styles.zone}>
          <Text style={styles.zoneTitle}>Zone 3</Text>
          <Text style={styles.zoneText}>
            Contenu à définir (par exemple : métriques cinématiques).
          </Text>
        </View>

        {/* Zone 4 */}
        <View style={styles.zone}>
          <Text style={styles.zoneTitle}>Zone 4</Text>
          <Text style={styles.zoneText}>
            Contenu à définir (par exemple : musique, résumé, etc.).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Fond qui englobe toutes les zones
  root: {
    flex: 1,
    backgroundColor: '#f5ddcfff',
  },
  // Conteneur centré et responsive
  container: {
    padding: 12,
    alignItems: 'center',
    gap: 12,
  },
  // Style commun à toutes les zones
  zone: {
    width: '100%',
    maxWidth: 1000, 
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3e6e6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // ombre Android
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
});
