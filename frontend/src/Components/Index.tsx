import { useState } from "react";
import voiceEngine from "../Engines/voices/voice.engine";

const VoiceTest = () => {
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const startListening = () => {
    setError(null);
    setTranscript("");
    setInterimTranscript("");

    voiceEngine.startListening(
      {
        language: "en-IN",
        continuous: false,
        interimResults: true,
      },
      {
        onStart: () => {
          console.log("Voice Engine: listening started");

          setStatus("listening");
        },

        onResult: (result) => {
          console.log("Recognition result:", result);

          if (result.isFinal) {
            setTranscript(result.transcript);
            setInterimTranscript("");

            console.log("Final transcript:", result.transcript);
          } else {
            setInterimTranscript(result.transcript);
          }
        },

        onError: (message) => {
          console.error("Voice Engine recognition error:", message);

          setError(message);
          setStatus("error");
        },

        onEnd: () => {
          console.log("Voice Engine: listening ended");

          setStatus((currentStatus) =>
            currentStatus === "listening" ? "idle" : currentStatus,
          );
        },
      },
    );
  };

  const speakTestResponse = async () => {
    setError(null);
    setStatus("processing");

    await voiceEngine.speak(
      "Hello! I received your voice input successfully. The Sia voice engine is working correctly.",
      {
        language: "en-IN",
        volume: 1,
        rate: 1,
      },
      {
        onStart: () => {
          console.log("Voice Engine: speaking started");

          setStatus("speaking");
        },

        onEnd: () => {
          console.log("Voice Engine: speaking ended");

          setStatus("idle");
        },

        onError: (message) => {
          console.error("Voice Engine synthesis error:", message);

          setError(message);
          setStatus("error");
        },
      },
    );
  };

  const stopEverything = () => {
    voiceEngine.stop();

    setStatus("idle");
  };

  const pauseSpeaking = () => {
    voiceEngine.pauseSpeaking();

    setStatus("paused");
  };

  const resumeSpeaking = async () => {
    await voiceEngine.resumeSpeaking();

    setStatus("speaking");
  };

  const printEngineState = () => {
    console.log("Voice Engine State:", voiceEngine.getState());
  };

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-semibold">
          Voice Engine Integration Test
        </h1>

        <div className="rounded-lg border border-neutral-800 p-4">
          <p>
            Status: <strong>{status}</strong>
          </p>

          <p className="mt-3">Final transcript:</p>

          <p className="text-neutral-300">{transcript || "—"}</p>

          <p className="mt-3">Interim transcript:</p>

          <p className="text-neutral-500">{interimTranscript || "—"}</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-950 p-4 text-red-300">{error}</div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={startListening}
            className="rounded-lg bg-white px-4 py-2 text-black"
          >
            Start Listening
          </button>

          <button
            onClick={speakTestResponse}
            className="rounded-lg border border-neutral-700 px-4 py-2"
          >
            Speak Test Response
          </button>

          <button
            onClick={pauseSpeaking}
            className="rounded-lg border border-neutral-700 px-4 py-2"
          >
            Pause
          </button>

          <button
            onClick={resumeSpeaking}
            className="rounded-lg border border-neutral-700 px-4 py-2"
          >
            Resume
          </button>

          <button
            onClick={stopEverything}
            className="rounded-lg border border-red-900 px-4 py-2 text-red-300"
          >
            Stop
          </button>

          <button
            onClick={printEngineState}
            className="rounded-lg border border-neutral-700 px-4 py-2"
          >
            Print State
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceTest;
