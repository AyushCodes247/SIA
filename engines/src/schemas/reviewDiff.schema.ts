import { z } from "zod";

export const reviewDiffSchema = z.object({
  summary: z.string(),

  overallAssessment: z.enum([
    "excellent",
    "good",
    "acceptable",
    "needs_improvement",
    "poor",
  ]),

  findings: z.array(
    z.object({
      category: z.enum([
        "correctness",
        "code_quality",
        "security",
        "performance",
        "maintainability",
        "error_handling",
        "testing",
        "architecture",
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

export type ReviewDiffResult = z.infer<typeof reviewDiffSchema>;
