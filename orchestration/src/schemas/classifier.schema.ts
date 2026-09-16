import { z } from "zod";

export const classifierSchema = z.object({
  intent: z.enum([
    "conversation",
    "question",
    "explanation",
    "summarize",
    "translate",
    "rewrite",

    "code_generation",
    "code_debugging",
    "code_review",

    "planning",
    "multi_step_task",

    "web_search",
    "memory_store",
    "memory_retrieve",

    "image_generation",
    "image_analysis",
    "file_analysis",

    "terminal",
    "filesystem",
    "git",

    "unknown",
  ]),

  domain: z.enum([
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
  ]),

  realtime: z.boolean(),

  general: z.boolean(),

  requires_web: z.boolean(),

  requires_tool: z.boolean(),

  complexity: z.enum(["low", "medium", "high"]),

  confidence: z.number(),
});

export type ClassifierResult = z.infer<typeof classifierSchema>;
