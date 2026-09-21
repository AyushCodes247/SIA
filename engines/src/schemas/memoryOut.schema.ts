import { z } from "zod";

export const memoryOutputSchema = z.object({
  shouldStore: z.boolean(),

  memories: z.array(
    z.object({
      content: z.string().min(1),

      category: z.enum([
        "preference",
        "project",
        "technical",
        "personal",
        "goal",
        "workflow",
        "fact",
        "instruction",
      ]),

      importance: z.number().min(0).max(1),
    }),
  ),
});

export type MemoryOutput = z.infer<typeof memoryOutputSchema>;
