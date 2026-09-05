import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
  CORS_ORIGIN: string;
}

const env: ENV = {
  PORT: parseInt(process.env.PORT as string, 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
};

export default env;
