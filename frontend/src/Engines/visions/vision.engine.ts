import cameraService, { type CameraOptions } from "./services/camera.service";

import trackingService, {
  type TrackingOptions,
} from "./services/tracking.service";

import pointerService, {
  type PointerOptions,
} from "./services/pointer.service";

import gestureService, {
  type GestureOptions,
} from "./services/gesture.service";

import type {
  TrackedHand,
  VisionConfig,
  VisionEvent,
  VisionStatus,
} from "./vision.type";

import { DEFAULT_VISION_CONFIG } from "./vision.type";

export interface VisionEngineOptions {
  camera?: CameraOptions;
  tracking?: TrackingOptions;
  pointer?: PointerOptions;
  gesture?: GestureOptions;
  config?: Partial<VisionConfig>;
}

export interface VisionCallbacks {
  onStatusChange?: (status: VisionStatus) => void;
  onEvent?: (event: VisionEvent) => void;
  onError?: (error: Error) => void;
}

class VisionEngine {
  private videoElement: HTMLVideoElement | null = null;

  private animationFrameId: number | null = null;

  private running = false;

  private starting = false;

  private startGeneration = 0;

  private status: VisionStatus = "idle";

  private config: VisionConfig = {
    ...DEFAULT_VISION_CONFIG,
  };

  private cameraOptions: CameraOptions = {};
  private trackingOptions: TrackingOptions = {};
  private pointerOptions: PointerOptions = {};
  private gestureOptions: GestureOptions = {};

  private callbacks: VisionCallbacks = {};

  async start(
    videoElement: HTMLVideoElement,
    options: VisionEngineOptions = {},
    callbacks: VisionCallbacks = {},
  ): Promise<void> {
    if (this.running || this.starting) {
      return;
    }

    this.starting = true;

    const generation = ++this.startGeneration;

    this.videoElement = videoElement;

    this.config = {
      ...DEFAULT_VISION_CONFIG,
      ...options.config,
    };

    console.log("Vision config:", this.config);

    this.cameraOptions = options.camera ?? {};

    this.trackingOptions = options.tracking ?? {};

    this.pointerOptions = {
      smoothing: this.config.pointerSmoothing,
      ...options.pointer,
    };

    this.gestureOptions = options.gesture ?? {};

    this.callbacks = callbacks;

    this.setStatus("starting");

    try {
      await cameraService.start(videoElement, this.cameraOptions);

      if (generation !== this.startGeneration) {
        return;
      }

      await trackingService.initialize(this.trackingOptions);

      if (generation !== this.startGeneration) {
        return;
      }

      pointerService.reset();
      gestureService.reset();
      trackingService.reset();

      this.running = true;
      this.starting = false;

      this.setStatus("tracking");

      this.processFrame();
    } catch (error) {
      if (generation !== this.startGeneration) {
        return;
      }

      this.running = false;
      this.starting = false;

      cameraService.stop();
      trackingService.destroy();

      pointerService.reset();
      gestureService.reset();

      this.videoElement = null;

      const normalizedError =
        error instanceof Error
          ? error
          : new Error("Failed to start vision engine.", {
              cause: error,
            });

      this.setStatus("error");
      this.callbacks.onError?.(normalizedError);

      throw normalizedError;
    }
  }

  stop(): void {
    this.startGeneration++;

    this.running = false;
    this.starting = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);

      this.animationFrameId = null;
    }

    cameraService.stop();
    trackingService.destroy();

    pointerService.reset();
    gestureService.reset();

    this.videoElement = null;

    this.setStatus("idle");
  }

  pause(): void {
    if (!this.running) {
      return;
    }

    cameraService.pause();

    this.setStatus("paused");
  }

  resume(): void {
    if (!this.running) {
      return;
    }

    cameraService.resume();

    trackingService.reset();
    pointerService.reset();
    gestureService.reset();

    this.setStatus("tracking");

    this.processFrame();
  }

  setConfig(config: Partial<VisionConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    this.pointerOptions = {
      ...this.pointerOptions,
      smoothing: this.config.pointerSmoothing,
    };
  }

  getConfig(): VisionConfig {
    return {
      ...this.config,
    };
  }

  getStatus(): VisionStatus {
    return this.status;
  }

  isRunning(): boolean {
    return this.running;
  }

  private processFrame = (): void => {
    if (!this.running) {
      return;
    }

    const videoElement = this.videoElement;

    if (!videoElement) {
      return;
    }

    try {
      const hands = trackingService.detect(videoElement);

      console.log("Tracked Hand:", hands);

      const hand = this.selectHand(hands);

      console.log("Selected Hand:", hand);

      if (hand) {
        if (this.config.enablePointer) {
          console.log("Pointer processing Enabled.");

          this.processPointer(hand);
        }

        if (this.config.enableGestures) {
          console.log("Gesture processing enabled");

          this.processGestures(hand);
        }
      }
    } catch (error) {
      const normalizedError =
        error instanceof Error
          ? error
          : new Error("Vision frame processing failed.", {
              cause: error,
            });

      this.callbacks.onError?.(normalizedError);
    }

    if (this.running) {
      this.animationFrameId = requestAnimationFrame(this.processFrame);
    }
  };

  private processPointer(hand: TrackedHand): void {
    const position = pointerService.getPointerPosition(
      hand,
      this.pointerOptions,
    );

    console.log("Pointer position:", position);

    if (!position) {
      return;
    }

    const event: VisionEvent = {
      type: "POINTER_MOVE",
      position,
      timestamp: performance.now(),
    };

    console.log("Emitting vision event:", event);

    this.emit(event);
  }

  private processGestures(hand: TrackedHand): void {
    const events = gestureService.detect(
      hand,
      performance.now(),
      this.gestureOptions,
    );

    for (const gesture of events) {
      this.emit({
        type: "GESTURE",
        gesture,
      });
    }
  }

  private selectHand(hands: TrackedHand[]): TrackedHand | null {
    if (hands.length === 0) {
      return null;
    }

    const preferred = hands.find(
      (hand) =>
        hand.side === this.config.preferredHand &&
        hand.confidence >= this.config.minTrackingConfidence,
    );

    if (preferred) {
      return preferred;
    }

    const confident = hands.find(
      (hand) => hand.confidence >= this.config.minTrackingConfidence,
    );

    return confident ?? null;
  }

  private emit(event: VisionEvent): void {
    this.callbacks.onEvent?.(event);
  }

  private setStatus(status: VisionStatus): void {
    this.status = status;
    this.callbacks.onStatusChange?.(status);
  }
}

export default new VisionEngine();
