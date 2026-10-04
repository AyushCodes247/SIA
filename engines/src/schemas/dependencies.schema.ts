import { z } from "zod";

export const dependenciesSchema = z.object({
  summary: z.string(),

  packageManager: z.string(),

  dependencies: z.array(
    z.object({
      name: z.string(),

      version: z.string(),

      type: z.enum(["runtime", "development", "peer", "optional"]),

      purpose: z.string(),

      status: z.enum([
        "healthy",
        "outdated",
        "deprecated",
        "vulnerable",
        "unused",
        "misconfigured",
        "unknown",
      ]),

      severity: z.enum(["critical", "high", "medium", "low", "info"]),

      issues: z.array(z.string()),

      recommendations: z.array(z.string()),
    }),
  ),

  risks: z.array(
    z.object({
      severity: z.enum(["critical", "high", "medium", "low", "info"]),

      title: z.string(),

      description: z.string(),

      recommendation: z.string(),
    }),
  ),

  recommendations: z.array(z.string()),
});

export type DependenciesResult = z.infer<typeof dependenciesSchema>;
