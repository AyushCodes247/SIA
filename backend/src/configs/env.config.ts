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
  SMTP_USER: string;
  SMTP_PORT: number;
  SMTP_HOST: string;
  SMTP_SECURE: boolean;
  SMTP_PASSWORD: string;
  MAIL_USER: string;
  UPLOAD_PATH: string;
  GEMINI_BASE_URL: string;
  GEMINI_KEY: string;
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  DATABASE_URL_VECTOR: string;
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
  SMTP_HOST: process.env.SMTP_HOST!,
  SMTP_PORT: Number(process.env.SMTP_PORT),
  SMTP_SECURE: Boolean(process.env.SMTP_SECURE!),
  SMTP_PASSWORD: process.env.SMTP_PASSWORD!,
  SMTP_USER: process.env.SMTP_USER!,
  MAIL_USER: process.env.MAIL_USER!,
  UPLOAD_PATH: process.env.UPLOAD_PATH!,
  GEMINI_BASE_URL: process.env.GEMINI_BASE_URL!,
  GEMINI_KEY: process.env.GEMINI_KEY!,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL!,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL!,
  DATABASE_URL_VECTOR: process.env.DATABASE_URL_VECTOR!,
};

export default env;
