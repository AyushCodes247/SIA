import { z } from "zod";

export const buildSchema = z.object({
  summary: z.string(),

  status: z.enum(["passed", "failed", "skipped", "unknown"]),

  command: z.string(),

  buildTool: z.string(),

  duration: z.number().nonnegative(),

  errors: z.array(
    z.object({
      message: z.string(),
      source: z.string(),
      category: z.enum([
        "syntax",
        "compile",
        "type",
        "dependency",
        "configuration",
        "module",
        "filesystem",
        "other",
      ]),
      severity: z.enum(["critical", "high", "medium", "low", "info"]),
    }),
  ),

  warnings: z.array(
    z.object({
      message: z.string(),
      source: z.string(),
    }),
  ),

  output: z.string(),

  recommendations: z.array(z.string()),
});

export type BuildResult = z.infer<typeof buildSchema>;
