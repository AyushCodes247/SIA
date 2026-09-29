import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
  TAVILY_TOKEN: string;
  NATIVE_PACKAGE_PATH: string;
  CORS_ORIGIN: string;
}

const env: ENV = {
  PORT: Number(process.env.PORT),
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL!,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL!,
  TAVILY_TOKEN: process.env.TAVILY_TOKEN!,
  NATIVE_PACKAGE_PATH: process.env.NATIVE_PACKAGE_PATH!,
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
};

export default env;
