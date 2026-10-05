import { z } from "zod";

export const testSchema = z.object({
  summary: z.string(),

  status: z.enum(["passed", "failed", "skipped", "unknown"]),

  command: z.string(),

  testRunner: z.string(),

  total: z.number().int().nonnegative(),

  passed: z.number().int().nonnegative(),

  failed: z.number().int().nonnegative(),

  skipped: z.number().int().nonnegative(),

  duration: z.number().nonnegative(),

  failures: z.array(
    z.object({
      name: z.string(),
      message: z.string(),
      source: z.string(),
    }),
  ),

  output: z.string(),

  recommendations: z.array(z.string()),
});

export type TestResult = z.infer<typeof testSchema>;
