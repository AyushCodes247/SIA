import ollamaService from "@services/ollama.service.js";
import { codingSchema, type CodingResult } from "@schemas/coding.schema.js";
import { CODING_SYSTEM_PROMPT } from "@prompts/coding.prompt.js";
import { z } from "zod";

const codingOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    approach: {
      type: "string",
    },

    files: {
      type: "array",

      items: {
        type: "object",

        properties: {
          path: {
            type: "string",
          },

          action: {
            type: "string",
            enum: ["create", "modify", "delete", "rename"],
          },

          purpose: {
            type: "string",
          },

          changes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: ["path", "action", "purpose", "changes"],

        additionalProperties: false,
      },
    },

    implementation: {
      type: "array",

      items: {
        type: "object",

        properties: {
          path: {
            type: "string",
          },

          content: {
            type: "string",
          },
        },

        required: ["path", "content"],

        additionalProperties: false,
      },
    },

    tests: {
      type: "array",

      items: {
        type: "object",

        properties: {
          path: {
            type: "string",
          },

          purpose: {
            type: "string",
          },

          changes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: ["path", "purpose", "changes"],

        additionalProperties: false,
      },
    },

    migrations: {
      type: "array",

      items: {
        type: "string",
      },
    },

    configuration: {
      type: "array",

      items: {
        type: "string",
      },
    },

    risks: {
      type: "array",

      items: {
        type: "object",

        properties: {
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },

          description: {
            type: "string",
          },

          mitigation: {
            type: "string",
          },
        },

        required: ["severity", "description", "mitigation"],

        additionalProperties: false,
      },
    },

    validation: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: [
    "summary",
    "approach",
    "files",
    "implementation",
    "tests",
    "migrations",
    "configuration",
    "risks",
    "validation",
  ],

  additionalProperties: false,
};

class CodingEngine {
  async generate(input: string): Promise<CodingResult> {
    if (!input || input.length === 0) {
      throw new Error("Coding request cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: CODING_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following coding request and provided project context.

CODING REQUEST:

${input}

Return the complete coding implementation JSON object now.`,
        },
      ],
      codingOutputSchema,
      {
        num_predict: 8192,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Coding engine raw output:", rawOutput);

    console.log("Coding engine Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Coding engine generation was truncated.");

      throw new Error(
        "Coding engine output was truncated because Ollama reached the generation limit.",
      );
    }

    const cleanedOutput = rawOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(cleanedOutput);
    } catch (error) {
      console.error("Error parsing coding engine output:", error);

      console.error("Coding engine raw output:", rawOutput);

      throw new Error("Coding engine returned invalid JSON.");
    }

    console.log("Coding engine parsed output:", parsedOutput);

    const validationResult = codingSchema.safeParse(parsedOutput);

    console.log("Coding engine validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Coding engine validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Coding engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new CodingEngine();
