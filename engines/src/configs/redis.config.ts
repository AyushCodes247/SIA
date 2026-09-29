import { Redis } from "ioredis";
import env from "@configs/env.config.js";

const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,

  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableReadyCheck: true,
  maxLoadingRetryTime: 1_000,
});

redis.on("connect", (): void => {
  console.info("ENGINE Redis connected successfully.");
});

redis.on("ready", (): void => {
  console.info("ENGINE Redis is ready.");
});

redis.on("error", (error: unknown) => {
  console.error(`ENGINE redis connection Error: ${error}`);
});

export default redis;
