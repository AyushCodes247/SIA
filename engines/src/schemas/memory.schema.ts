import { z } from "zod";

export const memorySchema = z.object({
  operation: z.enum(["store", "retrieve"]),

  query: z.string().min(1),

  content: z.string().optional(),

  category: z
    .enum([
      "preference",
      "project",
      "technical",
      "personal",
      "goal",
      "workflow",
      "fact",
      "instruction",
    ])
    .optional(),

  importance: z.number().min(0).max(1).optional(),

  topK: z.number().int().min(1).max(20).optional().default(5),
});

export type MemoryInput = z.infer<typeof memorySchema>;
