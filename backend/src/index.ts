import env from "@configs/env.config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@schemas/schema.js";

const db = drizzle(env.DATABASE_URL, {
  schema,
});

export default db;
