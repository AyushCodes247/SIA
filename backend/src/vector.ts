import env from "./configs/env.config.js";
import { drizzle } from "drizzle-orm/node-postgres";
import * as vectorSchema from "@schemas/vector.schema.js";
import * as memorySchema from "@schemas/memory.schema.js";

const vectorDB = drizzle(env.DATABASE_URL_VECTOR, {
  schema: {
    ...vectorSchema,
    ...memorySchema,
  },
});

export default vectorDB;
