import ollamaService from "@services/ollama.service.js";
import { packageSchema, type PackageResult } from "@schemas/packages.schema.js";
import { PACKAGE_SYSTEM_PROMPT } from "@prompts/package.prompt.js";

const packageOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    packageManager: {
      type: "string",
    },

    packageName: {
      type: "string",
    },

    version: {
      type: "string",
    },

    packageType: {
      type: "string",
      enum: ["application", "library", "service", "cli", "monorepo", "unknown"],
    },

    scripts: {
      type: "array",

      items: {
        type: "object",

        properties: {
          name: {
            type: "string",
          },

          purpose: {
            type: "string",
          },

          status: {
            type: "string",
            enum: ["healthy", "missing", "misconfigured", "unknown"],
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

        required: ["name", "purpose", "status", "issues", "recommendations"],

        additionalProperties: false,
      },
    },

    configuration: {
      type: "array",

      items: {
        type: "object",

        properties: {
          field: {
            type: "string",
          },

          status: {
            type: "string",
            enum: ["healthy", "missing", "misconfigured", "unknown"],
          },

          description: {
            type: "string",
          },

          recommendation: {
            type: "string",
          },
        },

        required: ["field", "status", "description", "recommendation"],

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
    "packageName",
    "version",
    "packageType",
    "scripts",
    "configuration",
    "risks",
    "recommendations",
  ],

  additionalProperties: false,
};

class PackageEngine {
  async analyze(input: string): Promise<PackageResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Package configuration cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: PACKAGE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following package configuration.

PACKAGE CONFIGURATION:

${input}

Return the complete package diagnostic JSON object now.`,
        },
      ],
      packageOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Package diagnostic raw output:", rawOutput);

    console.log("Package diagnostic Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Package diagnostic generation was truncated.");

      throw new Error(
        "Package diagnostic engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing package diagnostic output:", error);

      console.error("Package diagnostic raw output:", rawOutput);

      throw new Error("Package diagnostic engine returned invalid JSON.");
    }

    console.log("Package diagnostic parsed output:", parsedOutput);

    const validationResult = packageSchema.safeParse(parsedOutput);

    console.log("Package diagnostic validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Package diagnostic validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Package diagnostic engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new PackageEngine();
