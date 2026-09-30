import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from "@mediapipe/tasks-vision";
import type { HandLandmarks, HandSide, TrackedHand } from "../vision.type";

export interface TrackingOptions {
  maxHands?: number;
  minhandDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
}

class TrackingService {
  private handLandmarker: HandLandmarker | null = null;
  private initialized = false;
  private lastVideoTime = -1;

  async initialize(options: TrackingOptions = {}): Promise<void> {
    if (this.initialized && this.handLandmarker) {
      return;
    }

    const {
      maxHands = 1,
      minHandPresenceConfidence = 0.6,
      minTrackingConfidence = 0.6,
      minhandDetectionConfidence = 0.6,
    } = options;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm",
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU",
        },

        runningMode: "VIDEO",

        numHands: maxHands,

        minHandDetectionConfidence: minhandDetectionConfidence,

        minHandPresenceConfidence,

        minTrackingConfidence,
      });

      this.initialized = true;
      this.lastVideoTime = -1;
    } catch (error) {
      this.destroy();

      throw new Error("Failed to initialize hand tracking.", {
        cause: error,
      });
    }
  }

  detect(
    videoElement: HTMLVideoElement,
    timestamp = performance.now(),
  ): TrackedHand[] {
    if (!this.handLandmarker) {
      throw new Error("Hand tracking has not been initialized.");
    }

    console.log("Tracking video state:", {
      readyState: videoElement.readyState,
      currentTime: videoElement.currentTime,
      videoWidth: videoElement.videoWidth,
      videoHeight: videoElement.videoHeight,
    });

    if (videoElement.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      console.log("Tracking skipped: video has no current data.");

      return [];
    }

    if (videoElement.currentTime === this.lastVideoTime) {
      return [];
    }

    this.lastVideoTime = videoElement.currentTime;

    const result = this.handLandmarker.detectForVideo(videoElement, timestamp);

    console.log("MediaPipe result:", {
      landmarks: result.landmarks.length,
      handedness: result.handedness.length,
    });

    return this.mapResult(result);
  }

  isInitialized(): boolean {
    return this.initialized && this.handLandmarker !== null;
  }

  reset(): void {
    this.lastVideoTime = -1;
  }

  destroy(): void {
    if (this.handLandmarker) {
      this.handLandmarker.close();
    }

    this.handLandmarker = null;
    this.initialized = false;
    this.lastVideoTime = -1;
  }

  private mapResult(result: HandLandmarkerResult): TrackedHand[] {
    const hands: TrackedHand[] = [];

    for (let index = 0; index < result.landmarks.length; index++) {
      const landmarks = result.landmarks[index];

      if (!landmarks) {
        continue;
      }

      const handedness = result.handedness[index]?.[0];

      const side = this.mapHandSide(handedness?.categoryName);

      const confidence = handedness?.score ?? 0;

      const mappedLandmarks: HandLandmarks[] = landmarks.map(
        (landmark, landmarkIndex) => ({
          index: landmarkIndex,

          x: landmark.x,
          y: landmark.y,
          z: landmark.z,
        }),
      );

      hands.push({
        id: `${side}-${index}`,
        side,
        confidence,
        landmarks: mappedLandmarks,
      });
    }

    return hands;
  }

  private mapHandSide(side?: string): HandSide {
    switch (side?.toLowerCase()) {
      case "left":
        return "left";

      case "right":
        return "right";

      default:
        return "unknown";
    }
  }
}

export default new TrackingService();
