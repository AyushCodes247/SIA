import ollamaService, { type OllamaMessage } from "@services/ollama.service.js";
import {
  answeringSchema,
  type AnsweringResponse,
} from "@schemas/answer.schema.js";
import { ANSWERING_SYSTEM_PROMPT } from "@prompts/answer.prompt.js";

export interface AnswerInput {
  query: string;
  classifications: {
    intent: string;
    domain: string;
    realtime: boolean;
    general: boolean;
    require_web: boolean;
    require_tool: boolean;
    complexity: number;
  };

  messages: Array<{
    role: "system" | "user" | "assistant" | "tool";
    content: string;
  }>;

  context?: {
    web?: unknown;
    rag?: unknown;
    memory?: unknown;
    tools?: unknown;
  };
}

class AnsweringEngine {
  async answer(input: AnswerInput): Promise<AnsweringResponse> {
    const context = input.context
      ? JSON.stringify(input.context, null, 2)
      : "No external context is available.";

    const classification = JSON.stringify(input.classifications, null, 2);

    const messages: OllamaMessage[] = [
      {
        role: "system",
        content: ANSWERING_SYSTEM_PROMPT,
      },

      ...input.messages
        .filter(
          (message) => message.role === "user" || message.role === "assistant",
        )
        .map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content,
        })),

      {
        role: "user" as const,
        content: `
        User Query:
        ${input.query}

        Query Classification:
        ${classification}

        Additional Context:
        ${context}
        `,
      },
    ];

    const response = await ollamaService.chat(messages);

    const parsed = JSON.parse(response.message.content);

    return answeringSchema.parse(parsed);
  }
}

export default new AnsweringEngine();
