export type VisionStatus =
  | "idle"
  | "starting"
  | "tracking"
  | "paused"
  | "error";

export type HandSide = "left" | "right" | "unknown";

export interface Point2D {
  x: number;
  y: number;
}

export interface Point3D extends Point2D {
  z: number;
}

export interface HandLandmarks extends Point3D {
  index: number;
}

export interface TrackedHand {
  id: string;

  side: HandSide;

  confidence: number;

  landmarks: HandLandmarks[];
}

export interface VisionFrame {
  timestamp: number;

  hands: [TrackedHand];
}

export interface PointerPosition {
  x: number;
  y: number;
}

export interface PointerMoveEvent {
  type: "POINTER_MOVE";

  position: PointerPosition;

  timestamp: number;
}

export type GestureType =
  | "CLICK"
  | "PINCH_START"
  | "PINCH_HOLD"
  | "PINCH_END"
  | "SWIPE_LEFT"
  | "SWIPE_RIGHT";

export interface GestureEvent {
  type: GestureType;

  confidence: number;

  hand: HandSide;

  timestamp: number;
}

export type VisionEvent =
  | PointerMoveEvent
  | {
      type: "GESTURE";

      gesture: GestureEvent;
    };

export interface VisionConfig {
  preferredHand: HandSide;

  pointerSmoothing: number;

  minTrackingConfidence: number;

  enablePointer: boolean;

  enableGestures: boolean;
}

export const DEFAULT_VISION_CONFIG: VisionConfig = {
  preferredHand: "left",

  pointerSmoothing: 0.7,

  minTrackingConfidence: 0.6,

  enablePointer: true,

  enableGestures: true,
};
