import { useCallback, useState } from "react";
import {
  emptyMetrics,
  type EraserWidth,
  type StrokeWidth,
  type WritingMetrics,
  type WritingMode,
} from "../models/types";

interface WritingControllerState {
  metrics: WritingMetrics;
  isRecording: boolean;
  selectedMelodyId: string;
  writingMode: WritingMode;
  strokeWidth: StrokeWidth;
  eraserWidth: EraserWidth;
  isEraserActive: boolean;
}

interface WritingControllerActions {
  startRecording: () => void;
  stopRecording: () => void;
  changeMelody: (id: string) => void;
  updateMetrics: (metrics: WritingMetrics) => void;

  changeWritingMode: (mode: WritingMode) => void;
  changeStrokeWidth: (width: StrokeWidth) => void;
  changeEraserWidth: (width: EraserWidth) => void;
  setEraserActive: (active: boolean) => void;
}

interface UseWritingControllerResult {
  state: WritingControllerState;
  actions: WritingControllerActions;
}

/**
 * Hook de contrôle de la session d'écriture.
 */
export function useWritingController(
  initialMelodyId = "melody1"
): UseWritingControllerResult {
  const [metrics, setMetrics] = useState<WritingMetrics>(emptyMetrics);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMelodyId, setSelectedMelodyId] =
    useState<string>(initialMelodyId);

  const [writingMode, setWritingMode] = useState<WritingMode>("blank"); // zone blanche par défaut
  const [strokeWidth, setStrokeWidth] = useState<StrokeWidth>(3); // moyen
  const [eraserWidth, setEraserWidth] = useState<EraserWidth>(4); // moyenne
  const [isEraserActive, setIsEraserActive] = useState(false);

  const startRecording = useCallback(() => {

    // On reset les métriques à chaque démarrage de session
    setMetrics(emptyMetrics);
    setIsRecording(true);
    
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
  }, []);

  const changeMelody = useCallback((id: string) => {
    setSelectedMelodyId(id);
  }, []);

  const updateMetrics = useCallback((newMetrics: WritingMetrics) => {
    setMetrics(newMetrics);
  }, []);

  const changeWritingMode = useCallback((mode: WritingMode) => {
    setWritingMode(mode);
  }, []);

  const changeStrokeWidth = useCallback((width: StrokeWidth) => {
    setStrokeWidth(width);
  }, []);

  const changeEraserWidth = useCallback((width: EraserWidth) => {
    setEraserWidth(width);
  }, []);

  const setEraserActive = useCallback((active: boolean) => {
    setIsEraserActive(active);
  }, []);

  return {
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
  };
}
