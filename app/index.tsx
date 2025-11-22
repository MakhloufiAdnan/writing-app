import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppHeader } from "../src/components/AppHeader";
import { MainLayout } from "../src/components/MainLayout";

export default function HomeScreen() {
  const handleStart = () => {
    console.log("Démarrer cliqué");
    // plus tard : setIsRecording(true), reset des métriques, etc.
  };

  const handleStop = () => {
    console.log("Terminé cliqué");
    // plus tard : setIsRecording(false), calcul final, etc.
  };

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <AppHeader onStartPress={handleStart} onStopPress={handleStop} />

        {/* MAIN : les 4 zones */}
        <MainLayout />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    // on pourrait laisser transparent ici,
    // le MainLayout gère déjà le fond #f5ddcfff
    backgroundColor: "#f5ddcfff",
  },
});
