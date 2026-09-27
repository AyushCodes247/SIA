import type { SpeechSynthesisOptions } from "./voice.type";

export interface SpeechSynthesisCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

class BrowserTTSService {
  private utterance: SpeechSynthesisUtterance | null = null;

  private active = false;

  isSupported(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  }

  speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    callbacks: SpeechSynthesisCallbacks = {},
  ): void {
    if (!this.isSupported()) {
      callbacks.onError?.("Browser speech synthesis is not supported.");

      return;
    }

    const normalizedText = text.trim();

    if (!normalizedText) {
      callbacks.onError?.("Speech synthesis text cannot be empty.");

      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(normalizedText);

    utterance.lang = options.language ?? "en-IN";

    utterance.rate = this.clamp(options.rate ?? 1, 0.1, 10);

    utterance.pitch = this.clamp(options.pitch ?? 1, 0, 2);

    utterance.volume = this.clamp(options.volume ?? 1, 0, 1);

    const voice = this.findVoice(utterance.lang);

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.active = true;

      callbacks.onStart?.();
    };

    utterance.onend = () => {
      this.active = false;
      this.utterance = null;

      callbacks.onEnd?.();
    };

    utterance.onerror = (event) => {
      this.active = false;
      this.utterance = null;

      callbacks.onError?.(this.getErrorMessage(event.error));
    };

    this.utterance = utterance;

    try {
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      this.active = false;
      this.utterance = null;

      callbacks.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to start browser speech synthesis.",
      );
    }
  }

  stop(): void {
    if (!this.isSupported()) {
      return;
    }

    window.speechSynthesis.cancel();

    this.active = false;
    this.utterance = null;
  }

  pause(): void {
    if (!this.isSupported() || !window.speechSynthesis.speaking) {
      return;
    }

    window.speechSynthesis.pause();
  }

  resume(): void {
    if (!this.isSupported() || !window.speechSynthesis.paused) {
      return;
    }

    window.speechSynthesis.resume();
  }

  isActive(): boolean {
    if (!this.isSupported()) {
      return false;
    }

    return this.active || window.speechSynthesis.speaking;
  }

  getVoices(): SpeechSynthesisVoice[] {
    if (!this.isSupported()) {
      return [];
    }

    return window.speechSynthesis.getVoices();
  }

  private findVoice(language: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();

    if (voices.length === 0) {
      return null;
    }

    const normalizedLanguage = language.toLowerCase();

    // Prefer exact locale:
    // en-IN -> en-IN
    const exactMatch = voices.find(
      (voice) => voice.lang.toLowerCase() === normalizedLanguage,
    );

    if (exactMatch) {
      return exactMatch;
    }

    // Otherwise try the base language:
    // hi-IN -> hi-*
    const baseLanguage = normalizedLanguage.split("-")[0];

    if (!baseLanguage) {
      return null;
    }

    return (
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith(baseLanguage),
      ) ?? null
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case "canceled":
        return "Browser speech synthesis was canceled.";

      case "interrupted":
        return "Browser speech synthesis was interrupted.";

      case "audio-busy":
        return "Audio output is currently busy.";

      case "audio-hardware":
        return "Audio hardware is unavailable.";

      case "network":
        return "Browser speech synthesis network error.";

      case "synthesis-unavailable":
        return "Browser speech synthesis is unavailable.";

      case "voice-unavailable":
        return "The requested browser voice is unavailable.";

      case "text-too-long":
        return "The text is too long for browser speech synthesis.";

      case "language-unavailable":
        return "The requested speech language is unavailable.";

      default:
        return `Browser speech synthesis failed: ${error}.`;
    }
  }
}

export default new BrowserTTSService();
