import { Server } from "socket.io";
import env from "@configs/env.config.js";

let io: Server;

export function initSocketServer(server: any) {
  io = new Server(server, {
    cors: {
      origin: ["*", env.CORS_ORIGIN],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.info(`Socket connected: ${socket.id}`);

    socket.on("join:conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);

      console.info(`${socket.id} joined conversation:${conversationId}`);
    });

    socket.on("leave:conversation", (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on("disconnect", () => {
      console.info(`Socket disconnected: ${socket.id}`);
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
