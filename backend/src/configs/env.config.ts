import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  CORS_ORIGIN: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  MONGODB_URI: string;
}

const env: ENV = {
  PORT: parseInt(process.env.PORT as string, 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  NODE_ENV: process.env.NODE_ENV!,
  DATABASE_URL: process.env.DATABASE_URL!,
  MONGODB_URI: process.env.MONGODB_URI!
};

export default env;
