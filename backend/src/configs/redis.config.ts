import { Redis } from "ioredis";
import env from "./env.config.js";

const redis = new Redis({
  host: env.REDIS_HOST,
  password: env.REDIS_PASSWORD,
  port: env.REDIS_PORT,

  maxRetriesPerRequest: 3,

  lazyConnect: true,

  enableReadyCheck: true,

  maxLoadingRetryTime: 1_000,
});

redis.on("connect", (): void => {
  console.info("Redis connected successfully.");
});

redis.on("ready", (): void => {
  console.info("Redis is ready.");
});

redis.on("error", (error: unknown): void => {
  console.error(`Redis error.:${error}`);
});

export default redis;
