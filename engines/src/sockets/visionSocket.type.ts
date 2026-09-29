export interface PointerMoveEvent {
  type: "POINTER_MOVE";
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
}

export interface GestureEvent {
  type: "GESTURE";
  gesture: {
    type:
      | "CLICK"
      | "PINCH_START"
      | "PINCH_HOLD"
      | "PINCH_END"
      | "SWIPE_LEFT"
      | "SWIPE_RIGHT";
    confidence: number;
    hand: "left" | "right" | "unknown";
    timestamp: number;
  };
}

export type VisionSocketEvent = PointerMoveEvent | GestureEvent;
