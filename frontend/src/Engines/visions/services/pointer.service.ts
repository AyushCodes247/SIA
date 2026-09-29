import type { PointerPosition, TrackedHand } from "../vision.type";

export interface PointerOptions {
  smoothing?: number;
  marginX?: number;
  marginY?: number;
  mirrorX?: boolean;
}

const DEFAULT_POINTER_OPTIONS: Required<PointerOptions> = {
  smoothing: 0.7,
  marginX: 0.1,
  marginY: 0.1,
  mirrorX: true,
};

class PointerService {
  private previousPosition: PointerPosition | null = null;

  getPointerPosition(
    hand: TrackedHand,
    options: PointerOptions = {},
  ): PointerPosition | null {
    const indexTip = hand.landmarks[8];

    if (!indexTip) {
      return null;
    }

    const config = {
      ...DEFAULT_POINTER_OPTIONS,
      ...options,
    };

    let x = indexTip.x;
    let y = indexTip.y;

    /*
     * Camera preview behaves like a mirror.
     *
     * MediaPipe gives us raw camera coordinates,
     * so invert X to make pointer movement feel natural.
     */
    if (config.mirrorX) {
      x = 1 - x;
    }

    /*
     * Map a smaller camera interaction region
     * onto the complete 0..1 pointer space.
     *
     * Example with marginX = 0.1:
     *
     * camera 0.1  -> pointer 0
     * camera 0.5  -> pointer 0.5
     * camera 0.9  -> pointer 1
     *
     * This prevents the user from needing to move
     * their hand all the way to the camera edges.
     */
    x = this.remapWithMargin(x, config.marginX);

    y = this.remapWithMargin(y, config.marginY);

    const rawPosition: PointerPosition = {
      x,
      y,
    };

    /*
     * First frame has nothing to smooth against.
     */
    if (!this.previousPosition) {
      this.previousPosition = rawPosition;

      return rawPosition;
    }

    const position = this.smoothPosition(
      this.previousPosition,
      rawPosition,
      config.smoothing,
    );

    this.previousPosition = position;

    return position;
  }

  reset(): void {
    this.previousPosition = null;
  }

  getPreviousPosition(): PointerPosition | null {
    return this.previousPosition;
  }

  private smoothPosition(
    previous: PointerPosition,
    current: PointerPosition,
    smoothing: number,
  ): PointerPosition {
    const factor = this.clamp(smoothing, 0, 1);

    /*
     * Higher smoothing means more weight is given
     * to the previous position.
     *
     * smoothing = 0   -> raw movement
     * smoothing = 0.7 -> stable movement
     * smoothing = 1   -> effectively frozen
     */
    return {
      x: previous.x * factor + current.x * (1 - factor),

      y: previous.y * factor + current.y * (1 - factor),
    };
  }

  private remapWithMargin(value: number, margin: number): number {
    const safeMargin = this.clamp(margin, 0, 0.49);

    const usableRange = 1 - safeMargin * 2;

    const mapped = (value - safeMargin) / usableRange;

    return this.clamp(mapped, 0, 1);
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export default new PointerService();
