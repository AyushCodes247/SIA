import app from "@/app.js";
import env from "@configs/env.config.js";
import { createServer } from "http";
import connectDB from "@configs/db.config.js";
import redis from "@configs/redis.config.js";
import { initDB } from "@schemas/vector.js";

const server = createServer(app);

const startServer = async () => {
  await redis.connect();
  await connectDB(env.MONGODB_URI);
  initDB().then(() => {
    server.listen(env.PORT, () => {
      console.info(`SERVER IS RUNNING ON PORT NO.: ${env.PORT}`);
    });
  });
};

startServer();
