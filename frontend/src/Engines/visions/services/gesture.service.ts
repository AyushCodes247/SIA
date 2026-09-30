import type { GestureEvent, HandLandmarks, TrackedHand } from "../vision.type";

export interface GestureOptions {
  pinchStartThreshold?: number;
  pinchEndThreshold?: number;
  clickMaxDuration?: number;

  swipeMinDistance?: number;
  swipeMaxDuration?: number;
  swipeCooldown?: number;
}

const DEFAULT_GESTURE_OPTIONS: Required<GestureOptions> = {
  pinchStartThreshold: 0.035,
  pinchEndThreshold: 0.055,

  clickMaxDuration: 250,

  swipeMinDistance: 0.18,
  swipeMaxDuration: 500,
  swipeCooldown: 700,
};

interface PositionSample {
  x: number;
  y: number;
  timestamp: number;
}

class GestureService {
  private isPinching = false;

  private pinchStartedAt: number | null = null;

  private positionHistory: PositionSample[] = [];

  private lastSwipeAt = 0;

  detect(
    hand: TrackedHand,
    timestamp = performance.now(),
    options: GestureOptions = {},
  ): GestureEvent[] {
    const config = {
      ...DEFAULT_GESTURE_OPTIONS,
      ...options,
    };

    const events: GestureEvent[] = [];

    const pinchEvents = this.detectPinch(hand, timestamp, config);

    events.push(...pinchEvents);

    if (!this.isPinching) {
      const swipeEvent = this.detectSwipe(hand, timestamp, config);

      if (swipeEvent) {
        events.push(swipeEvent);
      }
    } else {
      this.positionHistory = [];
    }

    return events;
  }

  reset(): void {
    this.isPinching = false;
    this.pinchStartedAt = null;
    this.positionHistory = [];
    this.lastSwipeAt = 0;
  }

  getIsPinching(): boolean {
    return this.isPinching;
  }

  private detectPinch(
    hand: TrackedHand,
    timestamp: number,
    config: Required<GestureOptions>,
  ): GestureEvent[] {
    const events: GestureEvent[] = [];

    const thumbTip = hand.landmarks[4];
    const indexTip = hand.landmarks[8];

    if (!thumbTip || !indexTip) {
      return events;
    }

    const distance = this.distance2D(thumbTip, indexTip);

    if (!this.isPinching && distance <= config.pinchStartThreshold) {
      this.isPinching = true;
      this.pinchStartedAt = timestamp;

      events.push({
        type: "PINCH_START",
        confidence: this.calculatePinchConfidence(
          distance,
          config.pinchStartThreshold,
        ),
        hand: hand.side,
        timestamp,
      });

      return events;
    }

    if (this.isPinching && distance < config.pinchEndThreshold) {
      events.push({
        type: "PINCH_HOLD",
        confidence: this.calculatePinchConfidence(
          distance,
          config.pinchEndThreshold,
        ),
        hand: hand.side,
        timestamp,
      });

      return events;
    }

    if (this.isPinching && distance >= config.pinchEndThreshold) {
      const startedAt = this.pinchStartedAt;

      const duration =
        startedAt !== null ? timestamp - startedAt : Number.POSITIVE_INFINITY;

      this.isPinching = false;
      this.pinchStartedAt = null;

      events.push({
        type: "PINCH_END",
        confidence: 1,
        hand: hand.side,
        timestamp,
      });

      if (duration <= config.clickMaxDuration) {
        events.push({
          type: "CLICK",
          confidence: 1,
          hand: hand.side,
          timestamp,
        });
      }
    }

    return events;
  }

  private detectSwipe(
    hand: TrackedHand,
    timestamp: number,
    config: Required<GestureOptions>,
  ): GestureEvent | null {
    const indexTip = hand.landmarks[8];

    if (!indexTip) {
      return null;
    }

    this.positionHistory.push({
      x: indexTip.x,
      y: indexTip.y,
      timestamp,
    });

    const cutoff = timestamp - config.swipeMaxDuration;

    this.positionHistory = this.positionHistory.filter(
      (sample) => sample.timestamp >= cutoff,
    );

    if (this.positionHistory.length < 3) {
      return null;
    }

    if (timestamp - this.lastSwipeAt < config.swipeCooldown) {
      return null;
    }

    const first = this.positionHistory[0];
    const last = this.positionHistory[this.positionHistory.length - 1];

    if (!first || !last) {
      return null;
    }

    const deltaX = last.x - first.x;
    const deltaY = last.y - first.y;

    const horizontalMovement = Math.abs(deltaX);
    const verticalMovement = Math.abs(deltaY);

    const dominantMovement = Math.max(horizontalMovement, verticalMovement);

    if (dominantMovement < config.swipeMinDistance) {
      return null;
    }

    if (horizontalMovement > verticalMovement) {
      if (horizontalMovement < verticalMovement * 1.5) {
        return null;
      }
    } else {
      if (verticalMovement < horizontalMovement * 1.5) {
        return null;
      }
    }

    this.lastSwipeAt = timestamp;

    this.positionHistory = [];

    let type: "SWIPE_LEFT" | "SWIPE_RIGHT" | "SWIPE_UP" | "SWIPE_DOWN";

    if (horizontalMovement > verticalMovement) {
      type = deltaX > 0 ? "SWIPE_RIGHT" : "SWIPE_LEFT";
    } else {
      type = deltaY > 0 ? "SWIPE_DOWN" : "SWIPE_UP";
    }

    return {
      type,
      confidence: this.calculateSwipeConfidence(
        dominantMovement,
        config.swipeMinDistance,
      ),
      hand: hand.side,
      timestamp,
    };
  }

  private distance2D(first: HandLandmarks, second: HandLandmarks): number {
    const dx = first.x - second.x;
    const dy = first.y - second.y;

    return Math.sqrt(dx * dx + dy * dy);
  }

  private calculatePinchConfidence(
    distance: number,
    threshold: number,
  ): number {
    if (threshold <= 0) {
      return 0;
    }

    return this.clamp(1 - distance / threshold, 0, 1);
  }

  private calculateSwipeConfidence(
    distance: number,
    threshold: number,
  ): number {
    if (threshold <= 0) {
      return 0;
    }

    return this.clamp(distance / (threshold * 2), 0, 1);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export default new GestureService();
