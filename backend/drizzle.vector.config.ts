import env from "./src/configs/env.config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  dialect: "postgresql",
  schema: "./src/schemas/vector.schema.ts",
  dbCredentials: {
    url: env.DATABASE_URL_VECTOR,
  },
});
