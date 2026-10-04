import { z } from "zod";

export const analyzeSchema = z.object({
  summary: z.string(),

  projectType: z.string(),

  architecture: z.string(),

  technologies: z.array(z.string()),

  structure: z.array(
    z.object({
      path: z.string(),
      purpose: z.string(),
    }),
  ),

  findings: z.array(
    z.object({
      category: z.enum([
        "architecture",
        "code_quality",
        "performance",
        "security",
        "maintainability",
        "testing",
        "dependency",
        "configuration",
        "other",
      ]),

      severity: z.enum(["critical", "high", "medium", "low", "info"]),

      title: z.string(),

      description: z.string(),

      recommendation: z.string(),
    }),
  ),

  strengths: z.array(z.string()),

  recommendations: z.array(z.string()),
});

export type AnalyzeResult = z.infer<typeof analyzeSchema>;
