import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  REDIS_PORT: number;
  REDIS_HOST: string;
  REDIS_PASSWORD: string;
  OLLAMA_BASE_URL: string;
  OLLAMA_MODEL: string;
}

const env: ENV = {
  PORT: Number(process.env.PORT),
  REDIS_PORT: Number(process.env.REDIS_PORT),
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD!,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL!,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL!
};

export default env;
