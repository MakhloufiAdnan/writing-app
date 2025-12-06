import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { useWritingController } from "../src/controllers/useWritingController";
import { melodyAudioPort } from "../src/models/melodyPlayer";
import { COLORS } from "../src/theme";
import { AppHeader } from "../src/views/AppHeader";
import { MainLayout } from "../src/views/MainLayout";
import { SummaryTable } from "../src/views/SummaryTable";

export default function HomeScreen() {
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);

  const {
    state: {
      metrics,
      isRecording,
      selectedMelodyId,
      writingMode,
      strokeWidth,
      eraserWidth,
      isEraserActive,
    },
    actions: {
      startRecording,
      stopRecording,
      changeMelody,
      updateMetrics,
      changeWritingMode,
      changeStrokeWidth,
      changeEraserWidth,
      setEraserActive,
    },
  } = useWritingController();

  return (
    <ScrollView
      contentContainerStyle={styles.root}
      // Bloque le scroll pendant l'enregistrement OU quand un menu outils est ouvert
      scrollEnabled={!isRecording && !isToolsMenuOpen}
    >
      <AppHeader
        isRecording={isRecording}
        onStartPress={startRecording}
        onStopPress={stopRecording}
        writingMode={writingMode}
        onChangeWritingMode={changeWritingMode}
        strokeWidth={strokeWidth}
        onChangeStrokeWidth={changeStrokeWidth}
        eraserWidth={eraserWidth}
        onChangeEraserWidth={changeEraserWidth}
        isEraserActive={isEraserActive}
        onChangeEraserActive={setEraserActive}
        onToolsMenuOpenChange={setIsToolsMenuOpen}
      />

      <MainLayout
        metrics={metrics}
        isRecording={isRecording}
        selectedMelodyId={selectedMelodyId}
        writingMode={writingMode}
        strokeWidth={strokeWidth}
        eraserWidth={eraserWidth}
        isEraserActive={isEraserActive}
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
