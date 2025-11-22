import { useCallback, useState } from "react";
import { emptyMetrics, type WritingMetrics } from "../models/types";

interface WritingControllerState {
  metrics: WritingMetrics;
  isRecording: boolean;
  selectedMelodyId: string;
}

interface WritingControllerActions {
  startRecording: () => void;
  stopRecording: () => void;
  changeMelody: (id: string) => void;
  updateMetrics: (metrics: WritingMetrics) => void;
}

interface UseWritingControllerResult {
  state: WritingControllerState;
  actions: WritingControllerActions;
}

export function useWritingController(
  initialMelodyId = "melody1"
): UseWritingControllerResult {
  const [metrics, setMetrics] = useState<WritingMetrics>(emptyMetrics);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMelodyId, setSelectedMelodyId] =
    useState<string>(initialMelodyId);

  const startRecording = useCallback(() => {
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

  return {
    state: {
      metrics,
      isRecording,
      selectedMelodyId,
    },
    actions: {
      startRecording,
      stopRecording,
      changeMelody,
      updateMetrics,
    },
  };
}
