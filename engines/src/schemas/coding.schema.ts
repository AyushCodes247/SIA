import { z } from "zod";

export const codingSchema = z.object({
  summary: z.string(),

  approach: z.string(),

  files: z.array(
    z.object({
      path: z.string(),

      action: z.enum(["create", "modify", "delete", "rename"]),

      purpose: z.string(),

      changes: z.array(z.string()),
    }),
  ),

  implementation: z.array(
    z.object({
      path: z.string(),

      content: z.string(),
    }),
  ),

  tests: z.array(
    z.object({
      path: z.string(),

      purpose: z.string(),

      changes: z.array(z.string()),
    }),
  ),

  migrations: z.array(z.string()),

  configuration: z.array(z.string()),

  risks: z.array(
    z.object({
      severity: z.enum(["critical", "high", "medium", "low", "info"]),

      description: z.string(),

      mitigation: z.string(),
    }),
  ),

  validation: z.array(z.string()),
});

export type CodingResult = z.infer<typeof codingSchema>;
