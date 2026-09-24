import type { ZodType } from "zod";
import type { ToolCategory } from "@schemas/tool.schema.js";

export interface ToolExecutionContext {
  userPublicId?: string;
  conversationId?: string;
  workingDirectory?: string;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ToolDefinition<TInput = unknown, TOut = unknown> {
  name: string;

  description: string;

  category: ToolCategory;

  inputSchema: ZodType<TInput>;

  execute: (
    input: TInput,
    context: ToolExecutionContext,
  ) => Promise<ToolExecutionResult<TOut>>;
}
