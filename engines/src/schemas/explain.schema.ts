import { z } from "zod";

export const explainSchema = z.object({
  summary: z.string(),

  purpose: z.string(),

  components: z.array(
    z.object({
      name: z.string(),
      type: z.string(),
      purpose: z.string(),
    }),
  ),

  flow: z.array(z.string()),

  dependencies: z.array(z.string()),

  importantDetails: z.array(z.string()),
});

export type ExplainResult = z.infer<typeof explainSchema>;
