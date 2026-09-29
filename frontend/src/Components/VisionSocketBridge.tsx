import { useEffect, useRef } from "react";

import visionEngine from "../Engines/visions/vision.engine";
import visionSocket from "../Engines/visions/services/vision.socket";

interface VisionSocketBridgeProps {
  cameraId: string;
  serverUrl: string;
}

const VisionSocketBridge = ({
  cameraId,
  serverUrl,
}: VisionSocketBridgeProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (!videoElement) {
      return;
    }

    let cancelled = false;

    const start = async () => {
      try {
        visionSocket.connect(serverUrl, cameraId);

        await visionEngine.start(
          videoElement,
          {},
          {
            onEvent: (event) => {
              if (!cancelled) {
                visionSocket.emit(event);
              }
            },
            onError: (error) => {
              if (!cancelled) {
                console.error("Vision engine error:", error);
              }
            },
          },
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("Failed to start Vision Socket Bridge:", error);

        visionSocket.disconnect();
      }
    };

    start();

    return () => {
      cancelled = true;

      if (visionEngine.isRunning()) {
        visionEngine.stop();
      }

      visionSocket.disconnect();
    };
  }, [cameraId, serverUrl]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      style={{
        display: "block",
        width: "640px",
        height: "480px",
        objectFit: "cover",
      }}
    />
  );
};

export default VisionSocketBridge;
