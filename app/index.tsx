import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppHeader } from "../src/components/AppHeader";
import { MainLayout } from "../src/components/MainLayout";
import { initialMetrics, type WritingMetrics } from "../src/types";

export default function HomeScreen() {
  // Pour l'instant, j'ai juste des valeurs d'exemple
  const [metrics] = useState<WritingMetrics>(initialMetrics);

  const handleStart = () => {
    console.log("Démarrer cliqué");
    // Plus tard : je réinitialise les métriques et je démarre la capture
  };

  const handleStop = () => {
    console.log("Terminé cliqué");
    // Plus tard : j'arrête la capture et je fige les métriques
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppHeader onStartPress={handleStart} onStopPress={handleStop} />
        <MainLayout metrics={metrics} />
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
