import recognitionService from "./recognition.service";
import synthesisService, {
  type SpeechSynthesisCallbacks,
} from "./synthesis.service";

import type {
  SpeechRecognitionOptions,
  SpeechRecognitionResult,
  SpeechSynthesisOptions,
} from "./voice.type";

export interface VoiceRecognitionCallbacks {
  onStart?: () => void;
  onResult?: (result: SpeechRecognitionResult) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export interface VoiceSynthesisCallbacks extends SpeechSynthesisCallbacks {}

class VoiceEngine {
  /*
   * ============================================================
   * Speech Recognition
   * ============================================================
   */

  startListening(
    options: SpeechRecognitionOptions = {},
    callbacks: VoiceRecognitionCallbacks = {},
  ): void {
    if (!recognitionService.isSupported()) {
      callbacks.onError?.(
        "Speech recognition is not supported in this browser.",
      );

      return;
    }

    // Avoid SIA speaking while the microphone is listening.
    if (synthesisService.isActive()) {
      synthesisService.stop();
    }

    recognitionService.start(options, {
      onStart: () => {
        callbacks.onStart?.();
      },

      onResult: (result) => {
        callbacks.onResult?.(result);
      },

      onError: (error) => {
        callbacks.onError?.(error);
      },

      onEnd: () => {
        callbacks.onEnd?.();
      },
    });
  }

  stopListening(): void {
    recognitionService.stop();
  }

  abortListening(): void {
    recognitionService.abort();
  }

  isListening(): boolean {
    return recognitionService.isActive();
  }

  isRecognitionSupported(): boolean {
    return recognitionService.isSupported();
  }

  /*
   * ============================================================
   * Speech Synthesis
   * ============================================================
   */

  async speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    callbacks: VoiceSynthesisCallbacks = {},
  ): Promise<void> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      callbacks.onError?.("Voice output text cannot be empty.");
      return;
    }

    // Avoid microphone feedback while SIA is speaking.
    if (recognitionService.isActive()) {
      recognitionService.abort();
    }

    await synthesisService.speak(normalizedText, options, {
      onStart: () => {
        callbacks.onStart?.();
      },

      onEnd: () => {
        callbacks.onEnd?.();
      },

      onError: (error) => {
        callbacks.onError?.(error);
      },
    });
  }

  stopSpeaking(): void {
    synthesisService.stop();
  }

  pauseSpeaking(): void {
    synthesisService.pause();
  }

  async resumeSpeaking(): Promise<void> {
    await synthesisService.resume();
  }

  isSpeaking(): boolean {
    return synthesisService.isActive();
  }

  /*
   * ============================================================
   * Global Voice Controls
   * ============================================================
   */

  stop(): void {
    recognitionService.abort();
    synthesisService.stop();
  }

  getState() {
    return {
      listening: recognitionService.isActive(),
      speaking: synthesisService.isActive(),
      synthesisProvider: synthesisService.getActiveProvider(),
    };
  }
}

export default new VoiceEngine();
