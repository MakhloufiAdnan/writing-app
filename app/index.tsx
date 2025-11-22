import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppHeader } from "../src/components/AppHeader";
import { MainLayout } from "../src/components/MainLayout";
import { SummaryTable } from "../src/components/SummaryTable";
import { emptyMetrics, type WritingMetrics } from "../src/types";

/**
 * Écran principal de l'application.
 * Gère l'état global :
 * - isRecording : est-ce que l'on enregistre actuellement ?
 * - metrics : les métriques d'écriture calculées
 * - selectedMelodyId : la mélodie choisie par l'utilisateur
 */
export default function HomeScreen() {
  const [metrics, setMetrics] = useState<WritingMetrics>(emptyMetrics);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMelodyId, setSelectedMelodyId] = useState<string>("melody1");

  /** L'utilisateur appuie sur "Démarrer" */
  const handleStart = () => {
    setIsRecording(true);
  };

  /** L'utilisateur appuie sur "Terminé" */
  const handleStop = () => {
    setIsRecording(false);
  };

  return (
    <SafeAreaProvider>
      <ScrollView contentContainerStyle={styles.root}>
        {/* Header avec les boutons de démarrage et de terminaison */}
        <AppHeader
          isRecording={isRecording}
          onStartPress={handleStart}
          onStopPress={handleStop}
        />

        {/* Main Layout avec métriques */}
        <MainLayout
          metrics={metrics}
          isRecording={isRecording}
          selectedMelodyId={selectedMelodyId}
          onChangeSelectedMelody={setSelectedMelodyId}
          onMetricsChange={setMetrics}
        />

        {/* Zone 5 - Tableau récapitulatif */}
        <View style={styles.summaryTableContainer}>
          <SummaryTable metrics={metrics} />
        </View>
      </ScrollView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: "#f5ddcfff",
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  summaryTableContainer: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center", 
    paddingVertical: 20,
  },
});
