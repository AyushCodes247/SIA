import env from "./src/configs/env.config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle-vector",
  dialect: "postgresql",
  schema: ["./src/schemas/vector.schema.ts","./src/schemas/memory.schema.ts"],
  dbCredentials: {
    url: env.DATABASE_URL_VECTOR,
  },
});
