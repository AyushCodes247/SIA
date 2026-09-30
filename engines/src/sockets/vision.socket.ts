import type { Socket } from "socket.io";

import type { VisionSocketEvent } from "./visionSocket.type.js";

export function registerVisionSocket(socket: Socket): void {
  console.info("Vision socket listener registered:", socket.id);

  socket.on("vision:event", async (event: VisionSocketEvent) => {
    try {
      console.info("VISION EVENT RECEIVED:", event);

      switch (event.type) {
        case "POINTER_MOVE":
          console.info("Pointer event received:", event.position);
          break;

        case "GESTURE":
          console.info("Gesture event received:", event.gesture);
          break;
      }
    } catch (error) {
      console.error("Vision event processing failed:", error);
    }
  });
}
