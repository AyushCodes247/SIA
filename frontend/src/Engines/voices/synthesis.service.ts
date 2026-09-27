import type { SpeechSynthesisOptions } from "./voice.type";
import neuralTTSService, { type NeuralTTSCallbacks } from "./neuralTTS.service";
import browserTTSService from "./browserTTS.service";

export interface SpeechSynthesisCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

type ActiveProvider = "neural" | "browser" | null;

class SpeechSynthesisService {
  private activeProvider: ActiveProvider = null;

  async speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    callbacks: SpeechSynthesisCallbacks = {},
  ): Promise<void> {
    const normalizedText = this.normalizeForSpeech(text);

    if (!normalizedText) {
      callbacks.onError?.("Speech synthesis text cannot be empty.");
      return;
    }

    this.stop();

    await this.speakWithNeuralTTS(normalizedText, options, callbacks);
  }

  stop(): void {
    neuralTTSService.stop();
    browserTTSService.stop();

    this.activeProvider = null;
  }

  pause(): void {
    switch (this.activeProvider) {
      case "neural":
        neuralTTSService.pause();
        break;

      case "browser":
        browserTTSService.pause();
        break;
    }
  }

  async resume(): Promise<void> {
    switch (this.activeProvider) {
      case "neural":
        await neuralTTSService.resume();
        break;

      case "browser":
        browserTTSService.resume();
        break;
    }
  }

  isActive(): boolean {
    switch (this.activeProvider) {
      case "neural":
        return neuralTTSService.isActive();

      case "browser":
        return browserTTSService.isActive();

      default:
        return false;
    }
  }

  getActiveProvider(): ActiveProvider {
    return this.activeProvider;
  }

  private async speakWithNeuralTTS(
    text: string,
    options: SpeechSynthesisOptions,
    callbacks: SpeechSynthesisCallbacks,
  ): Promise<void> {
    let neuralStarted = false;

    const neuralCallbacks: NeuralTTSCallbacks = {
      onStart: () => {
        neuralStarted = true;
        this.activeProvider = "neural";

        callbacks.onStart?.();
      },

      onEnd: () => {
        this.activeProvider = null;

        callbacks.onEnd?.();
      },

      onError: (error) => {
        console.warn("Neural TTS failed. Falling back to browser TTS:", error);

        /*
         * If neural audio had already started playing and then failed,
         * do not restart the entire response using browser TTS.
         *
         * Otherwise the user could hear:
         *
         * "Hello, I am..."
         *
         * followed by:
         *
         * "Hello, I am Sia..."
         */
        if (neuralStarted) {
          this.activeProvider = null;

          callbacks.onError?.(error);

          return;
        }

        this.speakWithBrowserTTS(text, options, callbacks);
      },
    };

    await neuralTTSService.speak(text, options, neuralCallbacks);
  }

  private speakWithBrowserTTS(
    text: string,
    options: SpeechSynthesisOptions,
    callbacks: SpeechSynthesisCallbacks,
  ): void {
    if (!browserTTSService.isSupported()) {
      this.activeProvider = null;

      callbacks.onError?.(
        "Neural TTS failed and browser speech synthesis is unavailable.",
      );

      return;
    }

    this.activeProvider = "browser";

    browserTTSService.speak(text, options, {
      onStart: () => {
        this.activeProvider = "browser";

        callbacks.onStart?.();
      },

      onEnd: () => {
        this.activeProvider = null;

        callbacks.onEnd?.();
      },

      onError: (error) => {
        this.activeProvider = null;

        callbacks.onError?.(error);
      },
    });
  }

  private normalizeForSpeech(text: string): string {
    return (
      text
        // Remove leading/trailing whitespace.
        .trim()

        // Collapse repeated spaces/tabs.
        .replace(/[ \t]+/g, " ")

        // Collapse excessive blank lines.
        .replace(/\n{3,}/g, "\n\n")

        // Remove Markdown code fences while keeping their content.
        .replace(/```(?:\w+)?\n?/g, "")

        // Remove inline-code markers.
        .replace(/`([^`]+)`/g, "$1")

        // Convert Markdown links:
        // [OpenAI](https://...) -> OpenAI
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Remove raw URLs because speaking them is usually undesirable.
        .replace(/https?:\/\/\S+/gi, "")

        // Remove Markdown heading markers.
        .replace(/^#{1,6}\s+/gm, "")

        // Remove Markdown emphasis markers.
        .replace(/(\*\*|__)(.*?)\1/g, "$2")
        .replace(/([*_])([^*_]+)\1/g, "$2")

        // Convert common list markers into normal text.
        .replace(/^\s*[-*+]\s+/gm, "")
        .replace(/^\s*\d+\.\s+/gm, "")

        // Normalize excessive punctuation.
        .replace(/\.{4,}/g, "...")
        .replace(/!{2,}/g, "!")
        .replace(/\?{2,}/g, "?")

        // Clean spaces created by transformations above.
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .trim()
    );
  }
}

export default new SpeechSynthesisService();
