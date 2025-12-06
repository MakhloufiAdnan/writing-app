import { Audio } from "expo-av";
import type { WritingAudioPort } from "./audio";
import { getMelodyById } from "./melodies";

type SoundInstance = Audio.Sound;

class MelodyPlayer {
  private sound: SoundInstance | null = null;
  private currentMelodyId: string | null = null;

  async play(melodyId: string, options?: { loop?: boolean; volume?: number }) {
    const melody = getMelodyById(melodyId);
    if (!melody) return;

    const { loop = false, volume = 0.8 } = options ?? {};

    try {
      // Même son déjà chargé → on ajuste juste le statut
      if (this.sound && this.currentMelodyId === melodyId) {
        await this.sound.setStatusAsync({
          isLooping: loop,
          shouldPlay: true,
          volume,
        });
      } else {
        // Nouveau son → on décharge l'ancien
        if (this.sound) {
          try {
            await this.sound.stopAsync();
          } catch {}
          try {
            await this.sound.unloadAsync();
          } catch {}
        }

        const { sound } = await Audio.Sound.createAsync(melody.audio, {
          isLooping: loop,
          shouldPlay: true,
          volume,
        });

        this.sound = sound;
        this.currentMelodyId = melodyId;
      }
    } catch (error) {
      console.warn("Erreur lecture son", error);
    }
  }

  async pause() {
    if (!this.sound) return;
    try {
      await this.sound.pauseAsync();
    } catch (error) {
      console.warn("Erreur pause son", error);
    }
  }

  async stop() {
    if (!this.sound) return;
    try {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
    } catch (error) {
      console.warn("Erreur arrêt son", error);
    } finally {
      this.sound = null;
      this.currentMelodyId = null;
    }
  }

  async updateRateForSpeed(speedPxPerSec: number) {
    if (!this.sound) return;

    // Vitesse de lecture entre 0.8x et 1.6x selon la vitesse d'écriture.
    const minRate = 0.8;
    const maxRate = 1.6;
    const clamped = Math.max(0, Math.min(1500, speedPxPerSec));
    const ratio = clamped / 1500;
    const rate = minRate + (maxRate - minRate) * ratio;

    try {
      await this.sound.setStatusAsync({
        rate,
        shouldCorrectPitch: true,
      });
    } catch (error) {
      console.warn("Erreur ajustement vitesse son", error);
    }
  }

  /**
   * Ajuste le volume de lecture (0–1).
   */
  async updateVolume(volume: number) {
    if (!this.sound) return;

    const clamped = Math.max(0, Math.min(1, volume));

    try {
      await this.sound.setStatusAsync({
        volume: clamped,
      });
    } catch (error) {
      console.warn("Erreur ajustement volume son", error);
    }
  }

  getCurrentMelodyId() {
    return this.currentMelodyId;
  }
}

export const melodyPlayer = new MelodyPlayer();

/**
 * Adaptateur concret qui implémente l’interface WritingAudioPort
 * et repose sur MelodyPlayer.
 */
export const melodyAudioPort: WritingAudioPort = {
  async playLoop(melodyId: string) {
    await melodyPlayer.play(melodyId, { loop: true, volume: 0.8 });
  },

  async playPreview(melodyId: string) {
    await melodyPlayer.play(melodyId, { loop: false, volume: 1 });
  },

  async updateRate(speedPxPerSec: number) {
    await melodyPlayer.updateRateForSpeed(speedPxPerSec);
  },

  async updateVolume(volume: number) {
    await melodyPlayer.updateVolume(volume);
  },

  async pause() {
    await melodyPlayer.pause();
  },

  async stop() {
    await melodyPlayer.stop();
  },
};
