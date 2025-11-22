import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useWritingController } from "../src/controllers/useWritingController";
import { melodyAudioPort } from "../src/models/melodyPlayer";
import { AppHeader } from "../src/views/AppHeader";
import { MainLayout } from "../src/views/MainLayout";
import { SummaryTable } from "../src/views/SummaryTable";

export default function HomeScreen() {
  const {
    state: { metrics, isRecording, selectedMelodyId },
    actions: { startRecording, stopRecording, changeMelody, updateMetrics },
  } = useWritingController();

  return (
    <SafeAreaProvider>
      <ScrollView
        contentContainerStyle={styles.root}
        scrollEnabled={!isRecording}
      >
        <AppHeader
          isRecording={isRecording}
          onStartPress={startRecording}
          onStopPress={stopRecording}
        />

        <MainLayout
          metrics={metrics}
          isRecording={isRecording}
          selectedMelodyId={selectedMelodyId}
          onChangeSelectedMelody={changeMelody}
          onMetricsChange={updateMetrics}
          audio={melodyAudioPort}
        />

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
