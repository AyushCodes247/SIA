import ollamaService from "@services/ollama.service.js";
import {
  dependenciesSchema,
  type DependenciesResult,
} from "@schemas/dependencies.schema.js";
import { DEPENDENCIES_SYSTEM_PROMPT } from "@prompts/dependencies.prompt.js";

const dependenciesOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    packageManager: {
      type: "string",
    },

    dependencies: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          version: {
            type: "string",
          },

          type: {
            type: "string",
            enum: ["runtime", "development", "peer", "optional"],
          },

          purpose: {
            type: "string",
          },

          status: {
            type: "string",
            enum: [
              "healthy",
              "outdated",
              "deprecated",
              "vulnerable",
              "unused",
              "misconfigured",
              "unknown",
            ],
          },

          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },

          issues: {
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
          "version",
          "type",
          "purpose",
          "status",
          "severity",
          "issues",
          "recommendations",
        ],

        additionalProperties: false,
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

          title: {
            type: "string",
          },

          description: {
            type: "string",
          },

          recommendation: {
            type: "string",
          },
        },

        required: ["severity", "title", "description", "recommendation"],

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

  required: [
    "summary",
    "packageManager",
    "dependencies",
    "risks",
    "recommendations",
  ],

  additionalProperties: false,
};

class DependenciesEngine {
  async analyze(input: string): Promise<DependenciesResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Dependency input cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: DEPENDENCIES_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following project dependency information.

DEPENDENCY INFORMATION:

${input}

Return the complete dependency analysis JSON object now.`,
        },
      ],
      dependenciesOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Dependencies raw output:", rawOutput);

    console.log("Dependencies Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Dependencies generation was truncated.");

      throw new Error(
        "Dependencies engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing dependencies output:", error);

      console.error("Dependencies raw output:", rawOutput);

      throw new Error("Dependencies engine returned invalid JSON.");
    }

    console.log("Dependencies parsed output:", parsedOutput);

    const validationResult = dependenciesSchema.safeParse(parsedOutput);

    console.log("Dependencies validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Dependencies validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Dependencies engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new DependenciesEngine();
