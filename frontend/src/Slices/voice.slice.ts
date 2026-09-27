import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { VoiceState, VoiceStatus } from "../Engines/voices/voice.type";

const initialState: VoiceState = {
  status: "idle",

  transcript: "",
  interimTranscript: "",

  isListening: false,
  isSpeaking: false,

  recognitionLanguage: "en-IN",
  detectedLanguage: null,

  error: null,
};

const voiceSlice = createSlice({
  name: "voice",
  initialState,
  reducers: {
    setVoiceStatus: (state, action: PayloadAction<VoiceStatus>) => {
      state.status = action.payload;
    },

    startListening: (state) => {
      state.status = "listening";

      state.isListening = true;
      state.isSpeaking = false;

      state.transcript = "";
      state.interimTranscript = "";

      state.error = null;
    },

    setInterimTranscript: (state, action: PayloadAction<string>) => {
      state.interimTranscript = action.payload;
    },

    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload;
      state.interimTranscript = "";
    },

    stopListening: (state) => {
      state.isListening = false;

      if (state.status === "listening") {
        state.status = "idle";
      }
    },

    startProcessing: (state) => {
      state.status = "processing";

      state.isListening = false;
      state.isSpeaking = false;

      state.interimTranscript = "";
    },

    startSpeaking: (state) => {
      state.status = "speaking";

      state.isListening = false;
      state.isSpeaking = true;
    },

    stopSpeaking: (state) => {
      state.status = "idle";
      state.isSpeaking = false;
    },

    setRecognitionLanguage: (state, action: PayloadAction<string>) => {
      state.recognitionLanguage = action.payload;
    },

    setDetectedLanguage: (state, action: PayloadAction<string | null>) => {
      state.detectedLanguage = action.payload;
    },

    setVoiceError: (state, action: PayloadAction<string>) => {
      state.status = "error";

      state.isListening = false;
      state.isSpeaking = false;

      state.error = action.payload;
    },

    clearVoiceError: (state) => {
      state.error = null;

      if (state.status === "error") {
        state.status = "idle";
      }
    },

    clearTranscript: (state) => {
      state.transcript = "";
      state.interimTranscript = "";
    },

    resetVoice: () => initialState,
  },
});

export const {
  setVoiceStatus,

  startListening,
  stopListening,

  setTranscript,
  setInterimTranscript,
  clearTranscript,

  startProcessing,

  startSpeaking,
  stopSpeaking,

  setRecognitionLanguage,
  setDetectedLanguage,

  setVoiceError,
  clearVoiceError,

  resetVoice,
} = voiceSlice.actions;

export default voiceSlice.reducer;
