import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppHeader } from "../src/components/AppHeader";
import { MainLayout } from "../src/components/MainLayout";
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
      <View style={styles.root}>
        <AppHeader
          isRecording={isRecording}
          onStartPress={handleStart}
          onStopPress={handleStop}
        />

        <MainLayout
          metrics={metrics}
          isRecording={isRecording}
          selectedMelodyId={selectedMelodyId}
          onChangeSelectedMelody={setSelectedMelodyId}
          onMetricsChange={setMetrics}
        />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5ddcfff", 
  },
});
