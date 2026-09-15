import app from "@/app.js";
import env from "@configs/env.config.js";
import { createServer } from "http";
import connectDB from "@configs/db.config.js";
import redis from "@configs/redis.config.js";
import client from "@mcps/client";
import { initSocketServer } from "@sockets/server";

const server = createServer(app);

const startServer = async () => {
  await redis.connect();
  await connectDB(env.MONGODB_URI);
  await client.connect();
  await initSocketServer(server);
  server.listen(env.PORT, () => {
    console.info(`SIA SERVER IS RUNNING ON PORT NO.: ${env.PORT}`);
  });
};

startServer();
