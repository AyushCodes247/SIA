import type { SpeechSynthesisOptions } from "./voice.type";

export interface NeuralTTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

console.log(import.meta.env.VITE_ELEVENLABS_API_KEY)

class NeuralTTSService {
  private audio: HTMLAudioElement | null = null;
  private audioUrl: string | null = null;
  private abortController: AbortController | null = null;

  private readonly apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  private readonly voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;
  private readonly modelId =
    import.meta.env.VITE_ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";

  async speak(
    text: string,
    options: SpeechSynthesisOptions = {},
    callbacks: NeuralTTSCallbacks = {},
  ): Promise<void> {
    const normalizedText = text.trim();

    if (!normalizedText) {
      callbacks.onError?.("Cannot synthesize empty text.");
      return;
    }

    if (!this.apiKey) {
      callbacks.onError?.("ElevenLabs API key is missing.");
      return;
    }

    if (!this.voiceId) {
      callbacks.onError?.("ElevenLabs Voice ID is missing.");
      return;
    }

    // Stop any previous request/audio before starting a new one.
    this.stop();

    this.abortController = new AbortController();

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Accept: "audio/mpeg",
            "xi-api-key": this.apiKey,
          },

          body: JSON.stringify({
            text: normalizedText,

            model_id: this.modelId,

            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,

              ...(options.rate !== undefined && {
                speed: this.clamp(options.rate, 0.7, 1.2),
              }),
            },
          }),

          signal: this.abortController.signal,
        },
      );

      if (!response.ok) {
        throw new Error(await this.getResponseError(response));
      }

      const audioBlob = await response.blob();

      if (audioBlob.size === 0) {
        throw new Error("ElevenLabs returned an empty audio response.");
      }

      this.audioUrl = URL.createObjectURL(audioBlob);

      this.audio = new Audio(this.audioUrl);

      this.audio.volume = this.clamp(options.volume ?? 1, 0, 1);

      this.audio.onplay = () => {
        callbacks.onStart?.();
      };

      this.audio.onended = () => {
        callbacks.onEnd?.();
        this.cleanup();
      };

      this.audio.onerror = () => {
        callbacks.onError?.("Failed to play generated speech.");
        this.cleanup();
      };

      await this.audio.play();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Unknown neural TTS error occurred.";

      callbacks.onError?.(message);

      this.cleanup();
    } finally {
      this.abortController = null;
    }
  }

  stop(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }

    this.cleanup();
  }

  pause(): void {
    if (!this.audio || this.audio.paused) {
      return;
    }

    this.audio.pause();
  }

  async resume(): Promise<void> {
    if (!this.audio || !this.audio.paused) {
      return;
    }

    try {
      await this.audio.play();
    } catch (error) {
      console.error("Failed to resume neural TTS:", error);
    }
  }

  isActive(): boolean {
    return Boolean(this.audio && !this.audio.paused && !this.audio.ended);
  }

  private cleanup(): void {
    if (this.audio) {
      this.audio.onplay = null;
      this.audio.onended = null;
      this.audio.onerror = null;

      this.audio = null;
    }

    if (this.audioUrl) {
      URL.revokeObjectURL(this.audioUrl);
      this.audioUrl = null;
    }
  }

  private async getResponseError(response: Response): Promise<string> {
    try {
      const data = await response.json();

      if (typeof data === "object" && data !== null && "detail" in data) {
        const detail = data.detail;

        if (typeof detail === "string") {
          return `ElevenLabs error: ${detail}`;
        }

        if (
          typeof detail === "object" &&
          detail !== null &&
          "message" in detail &&
          typeof detail.message === "string"
        ) {
          return `ElevenLabs error: ${detail.message}`;
        }
      }
    } catch {
      // Ignore JSON parsing failure and use HTTP status below.
    }

    return `ElevenLabs request failed (${response.status} ${response.statusText}).`;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export default new NeuralTTSService();
