export type VoiceStatus =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "error";

export interface VoiceState {
  status: VoiceStatus;

  transcript: string;
  interimTranscript: string;

  isListening: boolean;
  isSpeaking: boolean;

  recognitionLanguage: string;
  detectedLanguage: string | null;

  error: string | null;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isFinal: boolean;
}

export interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export interface SpeechSynthesisOptions {
  language?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}
