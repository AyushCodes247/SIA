import ollamaService from "@services/ollama.service.js";
import { errorSchema, type ErrorResult } from "@schemas/error.schema.js";
import { ERROR_SYSTEM_PROMPT } from "@prompts/error.prompt.js";

const errorOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    errors: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          message: {
            type: "string",
          },

          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },

          category: {
            type: "string",
            enum: [
              "runtime",
              "build",
              "compile",
              "dependency",
              "configuration",
              "database",
              "network",
              "authentication",
              "authorization",
              "filesystem",
              "api",
              "logic",
              "performance",
              "unknown",
            ],
          },

          source: {
            type: "string",
          },

          rootCause: {
            type: "string",
          },

          confidence: {
            type: "string",
            enum: ["high", "medium", "low"],
          },

          impact: {
            type: "string",
          },

          evidence: {
            type: "array",

            items: {
              type: "string",
            },
          },

          recommendations: {
            type: "array",

            items: {
              type: "string",
            },
          },
        },

        required: [
          "name",
          "message",
          "severity",
          "category",
          "source",
          "rootCause",
          "confidence",
          "impact",
          "evidence",
          "recommendations",
        ],

        additionalProperties: false,
      },
    },

    patterns: {
      type: "array",

      items: {
        type: "object",

        properties: {
          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },
        },

        required: ["title", "description", "severity"],

        additionalProperties: false,
      },
    },

    recommendations: {
      type: "array",

      items: {
        type: "string",
      },
    },
  },

  required: ["summary", "errors", "patterns", "recommendations"],

  additionalProperties: false,
};

class ErrorEngine {
  async diagnose(input: string): Promise<ErrorResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Dependency input cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: ERROR_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Diagnose the following error information.

ERROR INFORMATION:

${input}

Return the complete error diagnostic JSON object now.`,
        },
      ],
      errorOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Error diagnostic raw output:", rawOutput);

    console.log("Error diagnostic Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Error diagnostic generation was truncated.");

      throw new Error(
        "Error diagnostic engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing error diagnostic output:", error);

      console.error("Error diagnostic raw output:", rawOutput);

      throw new Error("Error diagnostic engine returned invalid JSON.");
    }

    console.log("Error diagnostic parsed output:", parsedOutput);

    const validationResult = errorSchema.safeParse(parsedOutput);

    console.log("Error diagnostic validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Error diagnostic validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Error diagnostic engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new ErrorEngine();
