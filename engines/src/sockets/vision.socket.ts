import type { Socket } from "socket.io";
import type { VisionSocketEvent } from "./visionSocket.type.js";

export function registerVisionSocket(socket: Socket): void {
  socket.on("vision:event", async (event: VisionSocketEvent) => {
    try {
      console.info("Vision event:", event);

      switch (event.type) {
        case "POINTER_MOVE":
          break;
        case "GESTURE":
          break;
      }
    } catch (error) {
      console.error("Vision event processing failed:", error);
    }
  });
}
