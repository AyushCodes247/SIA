import { Pool } from "pg";
import env from "@configs/env.config.js";

export const pool = new Pool({
  connectionString: env.DATABASE_URL_VECTOR,
});

export const initDB = async () => {
  await pool.query(`CREATE EXTENSION IF NOT EXISTS vector;`);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS doc_chunks(
            id UUID PRIMARY KEY,
            content TEXT NOT NULL,
            embedding VECTOR(3072),
            created_at TIMESTAMP DEFAULT NOW()
        );`);

  console.info("CONNECTED TO THE VECTOR DB.");
};
