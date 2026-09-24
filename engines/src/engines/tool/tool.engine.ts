import ollamaService from "@services/ollama.service.js";

import toolRegistry from "./tool.registery.js";

import {
  toolEngineSchema,
  type ToolEngineResult,
} from "@schemas/tool.schema.js";

import { TOOL_SYSTEM_PROMPT } from "@prompts/tool.prompt.js";

import type { ToolExecutionContext, ToolExecutionResult } from "./tool.type.js";

interface ToolEngineInput {
  query: string;
  context: ToolExecutionContext;
}

export interface ToolEngineExecutionResult {
  decision: ToolEngineResult;

  executions: Array<{
    tool: string;
    arguments: Record<string, unknown>;
    result: ToolExecutionResult;
  }>;
}

class ToolEngine {
  async execute({
    query,
    context,
  }: ToolEngineInput): Promise<ToolEngineExecutionResult> {
    const availableTools = toolRegistry.getToolDescriptions();

    if (availableTools.length === 0) {
      throw new Error("No tools are registered.");
    }

    const response = await ollamaService.chat([
      {
        role: "system",
        content: TOOL_SYSTEM_PROMPT(availableTools),
      },
      {
        role: "user",
        content: query,
      },
    ]);

    const rawOutput = response.message.content;

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (error) {
      console.error("Tool engine JSON parsing failed:", error);

      throw new Error("Tool engine returned invalid JSON.");
    }

    const decision = toolEngineSchema.safeParse(parsedOutput);

    if (!decision.success) {
      throw new Error(
        `Tool engine returned invalid output: ${decision.error.message}`,
      );
    }

    const executions: ToolEngineExecutionResult["executions"] = [];

    if (!decision.data.requiresExecution) {
      return {
        decision: decision.data,
        executions,
      };
    }

    for (const action of decision.data.actions) {
      const tool = toolRegistry.get(action.tool);

      if (!tool) {
        throw new Error(`Tool "${action.tool}" is not registered.`);
      }

      if (tool.category !== action.category) {
        throw new Error(
          `Tool "${action.tool}" does not belong to category "${action.category}".`,
        );
      }

      const validatedArguments = tool.inputSchema.safeParse(action.arguments);

      if (!validatedArguments.success) {
        executions.push({
          tool: action.tool,
          arguments: action.arguments,
          result: {
            success: false,
            error: `Invalid tool arguments: ${validatedArguments.error.message}`,
          },
        });

        continue;
      }

      const result = await tool.execute(validatedArguments.data, context);

      executions.push({
        tool: action.tool,
        arguments: action.arguments,
        result,
      });
    }

    return {
      decision: decision.data,
      executions,
    };
  }
}

export default new ToolEngine();
