import type {
  SpeechRecognitionOptions,
  SpeechRecognitionResult,
} from "./voice.type";

interface SpeechRecognitionCallbacks {
  onStart?: () => void;

  onResult?: (result: SpeechRecognitionResult) => void;

  onError?: (error: string) => void;

  onEnd?: () => void;
}

interface BrowserSpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface BrowserSpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  start(): void;
  stop(): void;
  abort(): void;

  onstart: (() => void) | null;

  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;

  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;

  onend: (() => void) | null;
}

interface BrowserSpeechRecognitionConstructor {
  new (): BrowserSpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor;

    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor;
  }
}

class SpeechRecognitionService {
  private recognition: BrowserSpeechRecognition | null = null;

  private active = false;

  isSupported(): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start(
    options: SpeechRecognitionOptions = {},
    callbacks: SpeechRecognitionCallbacks = {},
  ): void {
    if (!this.isSupported()) {
      callbacks.onError?.(
        "Speech recognition is not supported in this browser.",
      );

      return;
    }

    if (this.active) {
      return;
    }

    const Recognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!Recognition) {
      callbacks.onError?.("Speech recognition is unavailable.");

      return;
    }

    const recognition = new Recognition();

    recognition.lang = options.language ?? "en-IN";

    recognition.continuous = options.continuous ?? false;

    recognition.interimResults = options.interimResults ?? true;

    recognition.onstart = () => {
      this.active = true;

      callbacks.onStart?.();
    };

    recognition.onresult = (event) => {
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index];

        if (!result) {
          continue;
        }

        const alternative = result[0];

        if (!alternative) {
          continue;
        }

        const transcript = alternative.transcript.trim();

        if (!transcript) {
          continue;
        }

        callbacks.onResult?.({
          transcript,
          isFinal: result.isFinal,
        });
      }
    };

    recognition.onerror = (event) => {
      this.active = false;

      callbacks.onError?.(this.getErrorMessage(event.error));
    };

    recognition.onend = () => {
      this.active = false;

      callbacks.onEnd?.();
    };

    this.recognition = recognition;

    try {
      recognition.start();
    } catch (error) {
      this.active = false;
      this.recognition = null;

      callbacks.onError?.(
        error instanceof Error
          ? error.message
          : "Failed to start speech recognition.",
      );
    }
  }

  stop(): void {
    if (!this.recognition || !this.active) {
      return;
    }

    this.recognition.stop();
  }

  abort(): void {
    if (!this.recognition) {
      return;
    }

    this.recognition.abort();

    this.active = false;
    this.recognition = null;
  }

  isActive(): boolean {
    return this.active;
  }

  private getErrorMessage(error: string): string {
    switch (error) {
      case "not-allowed":
        return "Microphone permission was denied.";

      case "audio-capture":
        return "No microphone was detected.";

      case "no-speech":
        return "No speech was detected.";

      case "network":
        return "Speech recognition network error.";

      case "aborted":
        return "Speech recognition was aborted.";

      default:
        return `Speech recognition failed: ${error}.`;
    }
  }
}

export default new SpeechRecognitionService();
