import { z } from "zod";

export const memoryRetrieveSchema = z.object({
  userPublicId: z.string().min(1),

  query: z.string().min(1),

  topK: z.number().int().min(1).max(20).optional().default(5),

  similarityThreshold: z.number().min(0).max(1).optional().default(0.7),
});

export const memoryStoreSchema = z.object({
  userPublicId: z.string().min(1),
  content: z.string().min(1),
  category: z.string().min(1),
  importance: z.number().min(0).max(1),
});

export type MemoryRetrieveInput = z.infer<typeof memoryRetrieveSchema>;
export type MemoryStoreInput = z.infer<typeof memoryStoreSchema>