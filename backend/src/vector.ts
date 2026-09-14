import env from "./configs/env.config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@schemas/vector.schema.js";

const vectorDB = drizzle(env.DATABASE_URL_VECTOR, {
  schema,
});

export default vectorDB;
