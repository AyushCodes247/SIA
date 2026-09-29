import app from "@/app.js";
import http from "http";
import env from "@configs/env.config.js";
import redis from "@configs/redis.config.js";
import { registerTools } from "@engines/tool/bootstrap.tool.js";
import { initSocketServer } from "@sockets/server.socket.js";

const server = http.createServer(app);

registerTools();

async function startOrchestrationServer(): Promise<void> {
  await redis.connect();
  initSocketServer(server);
  server.listen(env.PORT, () => {
    console.info(`ENGINE SERVER IS RUNNING ON PORT NO.: ${env.PORT}`);
  });
}

startOrchestrationServer();
