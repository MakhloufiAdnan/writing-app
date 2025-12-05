import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useWritingController } from "../src/controllers/useWritingController";
import { melodyAudioPort } from "../src/models/melodyPlayer";
import { COLORS } from "../src/theme";
import { AppHeader } from "../src/views/AppHeader";
import { MainLayout } from "../src/views/MainLayout";
import { SummaryTable } from "../src/views/SummaryTable";

export default function HomeScreen() {
  const {
    state: { metrics, isRecording, selectedMelodyId },
    actions: { startRecording, stopRecording, changeMelody, updateMetrics },
  } = useWritingController();

  return (
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
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingTop: 40,
    alignItems: "center",
  },
  summaryTableContainer: {
    width: "100%",
    maxWidth: 1000,
    alignSelf: "center",
    paddingVertical: 20,
  },
});
