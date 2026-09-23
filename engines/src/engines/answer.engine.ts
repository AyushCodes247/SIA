import ollamaService, { type OllamaMessage } from "@services/ollama.service.js";

import {
  answeringSchema,
  type AnsweringResponse,
} from "@schemas/answer.schema.js";

import { ANSWERING_SYSTEM_PROMPT } from "@prompts/answer.prompt.js";

export interface AnswerInput {
  query: string;

  classification: {
    intent: string;
    domain: string;
    realtime: boolean;
    general: boolean;
    requires_web: boolean;
    requires_tool: boolean;
    complexity: string;
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
    const context =
      input.context && Object.keys(input.context).length > 0
        ? JSON.stringify(input.context, null, 2)
        : "No external context is available.";

    const classification = JSON.stringify({
      intent: input.classification.intent,
      domain: input.classification.domain,
      complexity: input.classification.complexity,
    });

    const history = input.messages
      .slice(0, -1)
      .filter(
        (
          message,
        ): message is {
          role: "user" | "assistant";
          content: string;
        } => message.role === "user" || message.role === "assistant",
      )
      .map(
        (message): OllamaMessage => ({
          role: message.role,
          content: message.content,
        }),
      );

    const messages: OllamaMessage[] = [
      {
        role: "system",
        content: ANSWERING_SYSTEM_PROMPT,
      },
      ...history,
      {
        role: "user",
        content: `
User Query:

${input.query}

Query Classification:

${classification}

Additional Context:

${context}
        `.trim(),
      },
    ];

    const response = await ollamaService.chat(messages, "json", {
      num_ctx: 16384,
      num_predict: 2048,
      temperature: 0.3,
    });

    console.log("ANSWER OLLAMA RESPONSE:", response);

    console.log("ANSWER OLLAMA CONTENT:", response.message.content);

    if (response.done_reason === "length") {
      throw new Error(
        `Answer generation reached the token/context limit. ` +
          `Prompt tokens: ${
            response.prompt_eval_count ?? "unknown"
          }, generated tokens: ${response.eval_count ?? "unknown"}.`,
      );
    }

    const rawContent = response.message.content.trim();

    if (!rawContent) {
      throw new Error("Answering engine returned empty content.");
    }

    const cleanedText = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedResponse: unknown;

    try {
      parsedResponse = JSON.parse(cleanedText);
    } catch (error) {
      console.error("ANSWER JSON PARSE FAILED:", error);

      console.error("ANSWER RAW CONTENT:", cleanedText);

      throw new Error("Answering engine returned invalid JSON.");
    }

    return answeringSchema.parse(parsedResponse);
  }
}

export default new AnsweringEngine();
