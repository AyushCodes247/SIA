import { z } from "zod";

export const webSchema = z.object({
  query: z.string().min(1),

  searchDepth: z.enum(["basic", "advanced"]).optional().default("basic"),

  topic: z
    .enum([
      "general",
      "technology",
      "programming",
      "web",
      "database",
      "devops",
      "system_design",
      "mathematics",
      "science",
      "education",
      "finance",
      "health",
      "travel",
      "weather",
      "media",
      "personal",
      "entertainment",
      "unknown",
    ])
    .optional()
    .default("general"),

  maxResults: z.number().int().min(1).max(10).optional().default(5),

  includeAnswer: z.boolean().optional().default(false),

  includeRawContent: z
    .union([z.literal(false), z.literal("markdown"), z.literal("text")])
    .optional()
    .default(false),
});

export type WebSearchInput = z.infer<typeof webSchema>;
