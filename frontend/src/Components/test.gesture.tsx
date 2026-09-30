import gestureService from "../Engines/visions/services/gesture.service";
import type { HandLandmarks, TrackedHand } from "../Engines/visions/vision.type";

function createLandmarks(
  indexX: number,
  indexY: number,
  thumbX = 0.5,
  thumbY = 0.5,
): HandLandmarks[] {
  const landmarks: HandLandmarks[] = Array.from({ length: 21 }, (_, index) => ({
    index,
    x: 0.5,
    y: 0.5,
    z: 0,
  }));

  // Thumb tip
  landmarks[4] = {
    index: 4,
    x: thumbX,
    y: thumbY,
    z: 0,
  };

  // Index finger tip
  landmarks[8] = {
    index: 8,
    x: indexX,
    y: indexY,
    z: 0,
  };

  // Wrist
  landmarks[0] = {
    index: 0,
    x: indexX,
    y: indexY,
    z: 0,
  };

  return landmarks;
}

function createHand(
  indexX: number,
  indexY: number,
  thumbX = 0.5,
  thumbY = 0.5,
): TrackedHand {
  return {
    id: "left-0",
    side: "left",
    confidence: 1,
    landmarks: createLandmarks(indexX, indexY, thumbX, thumbY),
  };
}

function test(name: string, callback: () => void): void {
  console.log(`\n========== ${name} ==========`);

  try {
    callback();
    console.log("PASS");
  } catch (error) {
    console.error("FAIL:", error);
  }
}

/*
|--------------------------------------------------------------------------
| TEST 1 — Normal movement
|--------------------------------------------------------------------------
*/

test("Normal movement", () => {
  gestureService.reset();

  let timestamp = 0;

  for (let i = 0; i < 10; i++) {
    const hand = createHand(0.5 + i * 0.01, 0.5);

    const events = gestureService.detect(hand, timestamp);

    console.log(`Frame ${i}:`, events);

    timestamp += 50;
  }
});

/*
|--------------------------------------------------------------------------
| TEST 2 — Pinch
|--------------------------------------------------------------------------
*/

test("Pinch", () => {
  gestureService.reset();

  const startHand = createHand(0.52, 0.5, 0.5, 0.5);

  const holdHand = createHand(0.515, 0.5, 0.5, 0.5);

  const endHand = createHand(0.65, 0.5, 0.5, 0.5);

  console.log("PINCH START:", gestureService.detect(startHand, 0));

  console.log("PINCH HOLD:", gestureService.detect(holdHand, 100));

  console.log("PINCH END:", gestureService.detect(endHand, 200));
});

/*
|--------------------------------------------------------------------------
| TEST 3 — Quick pinch / click
|--------------------------------------------------------------------------
*/

test("Click", () => {
  gestureService.reset();

  const pinchStart = createHand(0.52, 0.5, 0.5, 0.5);

  const pinchEnd = createHand(0.65, 0.5, 0.5, 0.5);

  console.log("START:", gestureService.detect(pinchStart, 0));

  console.log("END:", gestureService.detect(pinchEnd, 100));
});

/*
|--------------------------------------------------------------------------
| TEST 4 — Swipe right
|--------------------------------------------------------------------------
*/

test("Swipe right", () => {
  gestureService.reset();

  const positions = [
    [0.2, 0.5],
    [0.25, 0.5],
    [0.3, 0.5],
    [0.35, 0.5],
    [0.4, 0.5],
  ];

  let timestamp = 0;

  for (const [x, y] of positions) {
    const events = gestureService.detect(createHand(x, y), timestamp);

    console.log(`Position (${x}, ${y}):`, events);

    timestamp += 80;
  }
});

/*
|--------------------------------------------------------------------------
| TEST 5 — Swipe left
|--------------------------------------------------------------------------
*/

test("Swipe left", () => {
  gestureService.reset();

  const positions = [
    [0.8, 0.5],
    [0.75, 0.5],
    [0.7, 0.5],
    [0.65, 0.5],
    [0.6, 0.5],
  ];

  let timestamp = 0;

  for (const [x, y] of positions) {
    const events = gestureService.detect(createHand(x, y), timestamp);

    console.log(`Position (${x}, ${y}):`, events);

    timestamp += 80;
  }
});

/*
|--------------------------------------------------------------------------
| TEST 6 — Swipe up
|--------------------------------------------------------------------------
*/

test("Swipe up", () => {
  gestureService.reset();

  const positions = [
    [0.5, 0.8],
    [0.5, 0.75],
    [0.5, 0.7],
    [0.5, 0.65],
    [0.5, 0.6],
  ];

  let timestamp = 0;

  for (const [x, y] of positions) {
    const events = gestureService.detect(createHand(x, y), timestamp);

    console.log(`Position (${x}, ${y}):`, events);

    timestamp += 80;
  }
});

/*
|--------------------------------------------------------------------------
| TEST 7 — Swipe down
|--------------------------------------------------------------------------
*/

test("Swipe down", () => {
  gestureService.reset();

  const positions = [
    [0.5, 0.2],
    [0.5, 0.25],
    [0.5, 0.3],
    [0.5, 0.35],
    [0.5, 0.4],
  ];

  let timestamp = 0;

  for (const [x, y] of positions) {
    const events = gestureService.detect(createHand(x, y), timestamp);

    console.log(`Position (${x}, ${y}):`, events);

    timestamp += 80;
  }
});
