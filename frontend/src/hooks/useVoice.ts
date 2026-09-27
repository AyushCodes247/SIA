import { useCallback } from "react";

import voiceEngine from "../Engines/voices/voice.engine";

import {
  startListening as startListeningAction,
  stopListening as stopListeningAction,
  setTranscript,
  setInterimTranscript,
  startSpeaking as startSpeakingAction,
  stopSpeaking as stopSpeakingAction,
  setVoiceError,
  clearVoiceError,
} from "../Slices/voice.slice";

import { useAppDispatch, useAppSelector } from "../Store/hook";

import type { SpeechSynthesisOptions } from "../Engines/voices/voice.type";

export const useVoice = () => {
  const dispatch = useAppDispatch();

  const voice = useAppSelector((state) => state.voice);

  /*
   * ============================================================
   * Speech Recognition
   * ============================================================
   */

  const startListening = useCallback(() => {
    dispatch(clearVoiceError());
    dispatch(setTranscript(""));
    dispatch(setInterimTranscript(""));

    voiceEngine.startListening(
      {
        language: voice.recognitionLanguage,
        continuous: false,
        interimResults: true,
      },
      {
        onStart: () => {
          dispatch(startListeningAction());
        },

        onResult: (result) => {
          if (result.isFinal) {
            dispatch(setTranscript(result.transcript));
            dispatch(setInterimTranscript(""));

            return;
          }

          dispatch(setInterimTranscript(result.transcript));
        },

        onError: (error) => {
          dispatch(setVoiceError(error));
        },

        onEnd: () => {
          dispatch(stopListeningAction());
        },
      },
    );
  }, [dispatch, voice.recognitionLanguage]);

  const stopListening = useCallback(() => {
    voiceEngine.stopListening();

    dispatch(stopListeningAction());
  }, [dispatch]);

  const abortListening = useCallback(() => {
    voiceEngine.abortListening();

    dispatch(stopListeningAction());
    dispatch(setInterimTranscript(""));
  }, [dispatch]);

  /*
   * ============================================================
   * Speech Synthesis
   * ============================================================
   */

  const speak = useCallback(
    async (text: string, options: SpeechSynthesisOptions = {}) => {
      dispatch(clearVoiceError());

      await voiceEngine.speak(text, options, {
        onStart: () => {
          dispatch(startSpeakingAction());
        },

        onEnd: () => {
          dispatch(stopSpeakingAction());
        },

        onError: (error) => {
          dispatch(setVoiceError(error));
        },
      });
    },
    [dispatch],
  );

  const stopSpeaking = useCallback(() => {
    voiceEngine.stopSpeaking();

    dispatch(stopSpeakingAction());
  }, [dispatch]);

  const pauseSpeaking = useCallback(() => {
    voiceEngine.pauseSpeaking();
  }, []);

  const resumeSpeaking = useCallback(async () => {
    await voiceEngine.resumeSpeaking();
  }, []);

  /*
   * ============================================================
   * Global Voice Controls
   * ============================================================
   */

  const stopVoice = useCallback(() => {
    voiceEngine.stop();

    dispatch(stopListeningAction());
    dispatch(stopSpeakingAction());
    dispatch(setInterimTranscript(""));
  }, [dispatch]);

  /*
   * ============================================================
   * Public API
   * ============================================================
   */

  return {
    // Redux state
    status: voice.status,

    transcript: voice.transcript,
    interimTranscript: voice.interimTranscript,

    isListening: voice.isListening,
    isSpeaking: voice.isSpeaking,

    recognitionLanguage: voice.recognitionLanguage,
    detectedLanguage: voice.detectedLanguage,

    error: voice.error,

    // Recognition
    startListening,
    stopListening,
    abortListening,

    // Synthesis
    speak,
    stopSpeaking,
    pauseSpeaking,
    resumeSpeaking,

    // Global
    stopVoice,

    // Capability
    isRecognitionSupported: voiceEngine.isRecognitionSupported(),
  };
};

export default useVoice;
