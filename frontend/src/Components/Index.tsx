import {
  useEffect,
  useRef,
  useState,
} from "react";

import visionEngine from "../Engines/visions/vision.engine";

import type {
  GestureEvent,
  VisionEvent,
  VisionStatus,
} from "../Engines/visions/vision.type";

const VisionTest = () => {
  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const [status, setStatus] =
    useState<VisionStatus>("idle");

  const [pointer, setPointer] = useState({
    x: 0,
    y: 0,
  });

  const [latestGesture, setLatestGesture] =
    useState<GestureEvent | null>(null);

  const [eventCount, setEventCount] =
    useState(0);

  const [error, setError] =
    useState<string | null>(null);

  const start = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    try {
      setError(null);

      await visionEngine.start(
        video,
        {
          config: {
            preferredHand: "right",
            pointerSmoothing: 0.7,
            minTrackingConfidence: 0.6,
            enablePointer: true,
            enableGestures: true,
          },
        },
        {
          onStatusChange: (
            nextStatus,
          ) => {
            console.log(
              "Vision status:",
              nextStatus,
            );

            setStatus(nextStatus);
          },

          onEvent: (
            event: VisionEvent,
          ) => {
            setEventCount(
              (count) => count + 1,
            );

            if (
              event.type ===
              "POINTER_MOVE"
            ) {
              setPointer(
                event.position,
              );
            }

            if (
              event.type === "GESTURE"
            ) {
              console.log(
                "Vision gesture:",
                event.gesture,
              );

              setLatestGesture(
                event.gesture,
              );
            }
          },

          onError: (error) => {
            console.error(
              "Vision error:",
              error,
            );

            setError(error.message);
          },
        },
      );
    } catch (error) {
      console.error(
        "Failed to start vision:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to start vision.",
      );
    }
  };

  const stop = () => {
    visionEngine.stop();

    setPointer({
      x: 0,
      y: 0,
    });

    setLatestGesture(null);
    setEventCount(0);
  };

  useEffect(() => {
    return () => {
      visionEngine.stop();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black p-10 text-white">
      <div className="mx-auto max-w-5xl space-y-6">

        <div>
          <h1 className="text-2xl font-semibold">
            SIA Vision Engine Test
          </h1>

          <p className="mt-2 text-neutral-400">
            Status: {status}
          </p>
        </div>

        <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-neutral-950">

          <video
            ref={videoRef}
            className="h-full w-full scale-x-[-1] object-cover"
            playsInline
            muted
          />

          <div
            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{
              left: `${pointer.x * 100}%`,
              top: `${pointer.y * 100}%`,
            }}
          />

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Pointer X
            </p>

            <p className="mt-2 text-xl">
              {pointer.x.toFixed(3)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Pointer Y
            </p>

            <p className="mt-2 text-xl">
              {pointer.y.toFixed(3)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Latest Gesture
            </p>

            <p className="mt-2 text-xl">
              {latestGesture?.type ??
                "NONE"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Gesture Confidence
            </p>

            <p className="mt-2 text-xl">
              {latestGesture
                ? latestGesture.confidence.toFixed(
                    3,
                  )
                : "NONE"}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Event Count
            </p>

            <p className="mt-2 text-xl">
              {eventCount}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 p-5">
            <p className="text-sm text-neutral-500">
              Hand
            </p>

            <p className="mt-2 text-xl">
              {latestGesture?.hand ??
                "NONE"}
            </p>
          </div>

        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="flex gap-3">

          <button
            onClick={start}
            disabled={
              status === "starting" ||
              status === "tracking"
            }
            className="rounded-lg bg-white px-5 py-2 text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start Vision
          </button>

          <button
            onClick={stop}
            className="rounded-lg border border-red-500/30 px-5 py-2 text-red-300"
          >
            Stop Vision
          </button>

        </div>

      </div>
    </div>
  );
};

export default VisionTest;