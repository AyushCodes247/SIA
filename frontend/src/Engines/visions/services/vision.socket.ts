import { io, type Socket } from "socket.io-client";
import type { VisionEvent } from "../vision.type";

class VisionSocketService {
  private socket: Socket | null = null;
  private cameraId: string | null = null;

  connect(serverUrl: string, cameraId: string): void {
    if (this.socket?.connected) return;

    this.cameraId = cameraId;

    this.socket = io(serverUrl, {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.info("Vision socket connected:", this.socket?.id);
      this.socket?.emit("join:camera", cameraId);
    });

    this.socket.on("disconnect", () => {
      console.info("Vision socket disconnected.");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Vision socket connection failed:", error);
    });
  }

  emit(event: VisionEvent): void {
    console.log("VISION EMIT CALLED:", event);

    if (!this.socket) {
      console.warn("Vision event not sent: socket does not exist.");
      return;
    }

    console.log("Socket state:", {
      id: this.socket.id,
      connected: this.socket.connected,
    });

    if (!this.socket.connected) {
      console.warn("Vision event not sent: socket is not connected.");
      return;
    }

    console.log("EMITTING vision:event:", event);

    this.socket.emit("vision:event", event);
  }

  disconnect(): void {
    if (!this.socket) return;

    if (this.cameraId) {
      this.socket.emit("leave:camera", this.cameraId);
    }

    this.socket.disconnect();

    this.socket = null;
    this.cameraId = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export default new VisionSocketService();
