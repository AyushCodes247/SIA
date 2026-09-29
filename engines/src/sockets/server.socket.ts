import { Server } from "socket.io";
import env from "@configs/env.config.js";
import { registerVisionSocket } from "./vision.socket.js";

let io: Server;

export function initSocketServer(server: any) {
  io = new Server(server, {
    cors: {
      methods: ["GET", "POST"],
      origin: env.CORS_ORIGIN,
    },
  });

  io.on("connection", (socket) => {
    console.info("socket connected successfully .:", socket.id);

    socket.on("join:camera", (cameraId: string) => {
      socket.join(`camera:${cameraId}`);

      console.info(`Camear sockets connected successfully .: ${socket.id}`);
    });

    socket.on("leave:camera", (cameraId: string) => {
      socket.leave(`camera:${cameraId}`);
    });

    registerVisionSocket(socket);

    socket.on("disconnect", () => {
      console.info(`Socket disconnected .: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }

  return io;
}
