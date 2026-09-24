import { z } from "zod";

export const toolCategorySchema = z.enum([
  "filesystem",
  "terminal",
  "git",
  "project",
  "desktop",
]);

export const toolActionSchema = z.object({
  tool: z.string().min(1),

  category: toolCategorySchema,

  arguments: z.record(z.string(), z.unknown()),

  reason: z.string().min(1),
});

export const toolEngineSchema = z.object({
  requiresExecution: z.boolean(),

  actions: z.array(toolActionSchema),

  completed: z.boolean(),
});

export type ToolCategory = z.infer<typeof toolCategorySchema>;

export type ToolAction = z.infer<typeof toolActionSchema>;

export type ToolEngineResult = z.infer<typeof toolEngineSchema>;
