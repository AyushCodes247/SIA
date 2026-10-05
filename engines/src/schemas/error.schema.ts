import { z } from "zod";

export const errorSchema = z.object({
  summary: z.string(),

  errors: z.array(
    z.object({
      name: z.string(),

      message: z.string(),

      severity: z.enum(["critical", "high", "medium", "low", "info"]),

      category: z.enum([
        "runtime",
        "build",
        "compile",
        "dependency",
        "configuration",
        "database",
        "network",
        "authentication",
        "authorization",
        "filesystem",
        "api",
        "logic",
        "performance",
        "unknown",
      ]),

      source : z.string(),

      rootCause: z.string(),

      confidence: z.enum(["high", "medium", "low"]),

      impact: z.string(),

      evidence: z.array(z.string()),

      recommendations: z.array(z.string()),
    }),
  ),

  patterns: z.array(
    z.object({
      title: z.string(),

      description: z.string(),

      severity: z.enum(["critical", "high", "medium", "low", "info"]),
    }),
  ),

  recommendations: z.array(z.string()),
});

export type ErrorResult = z.infer<typeof errorSchema>;
