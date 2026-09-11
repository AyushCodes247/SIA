import dotenv from "dotenv";
dotenv.config();

interface ENV {
  PORT: number;
}

const env: ENV = {
  PORT: Number(process.env.PORT),
};

export default env;
