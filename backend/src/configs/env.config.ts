import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  REDIS_PORT: number;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
}

const env: ENV = {
  PORT: parseInt(process.env.PORT as string, 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  NODE_ENV: process.env.NODE_ENV!,
  DATABASE_URL: process.env.DATABASE_URL!,
  MONGODB_URI: process.env.MONGODB_URI!,
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
};

export default env;
