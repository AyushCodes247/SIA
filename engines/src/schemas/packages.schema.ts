import { z } from "zod";

export const packageSchema = z.object({
  summary: z.string(),

  packageManager: z.string(),

  packageName: z.string(),

  version: z.string(),

  packageType: z.enum([
    "application",
    "library",
    "service",
    "cli",
    "monorepo",
    "unknown",
  ]),

  scripts: z.array(
    z.object({
      name: z.string(),

      purpose: z.string(),

      status: z.enum(["healthy", "missing", "misconfigured", "unknown"]),

      issues: z.array(z.string()),

      recommendations: z.array(z.string()),
    }),
  ),

  configuration: z.array(
    z.object({
      field: z.string(),

      status: z.enum(["healthy", "missing", "misconfigured", "unknown"]),

      description: z.string(),

      recommendation: z.string(),
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

export type PackageResult = z.infer<typeof packageSchema>;
