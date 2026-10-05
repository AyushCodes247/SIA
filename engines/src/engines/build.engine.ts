import ollamaService from "@services/ollama.service.js";
import { buildSchema, type BuildResult } from "@schemas/build.schema.js";
import { BUILD_SYSTEM_PROMPT } from "@prompts/build.prompt.js";

const buildOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    status: {
      type: "string",
      enum: ["passed", "failed", "skipped", "unknown"],
    },

    command: {
      type: "string",
    },

    buildTool: {
      type: "string",
    },

    duration: {
      type: "number",
      minimum: 0,
    },

    errors: {
      type: "array",

      items: {
        type: "object",

        properties: {
          message: {
            type: "string",
          },

          source: {
            type: "string",
          },

          category: {
            type: "string",
            enum: [
              "syntax",
              "compile",
              "type",
              "dependency",
              "configuration",
              "module",
              "filesystem",
              "other",
            ],
          },

          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low", "info"],
          },
        },

        required: ["message", "source", "category", "severity"],

        additionalProperties: false,
      },
    },

    warnings: {
      type: "array",

      items: {
        type: "object",

        properties: {
          message: {
            type: "string",
          },

          source: {
            type: "string",
          },
        },

        required: ["message", "source"],

        additionalProperties: false,
      },
    },

    output: {
      type: "string",
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
    "status",
    "command",
    "buildTool",
    "duration",
    "errors",
    "warnings",
    "output",
    "recommendations",
  ],

  additionalProperties: false,
};

class BuildEngine {
  async analyze(input: string): Promise<BuildResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Build execution information cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: BUILD_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following build execution information.

BUILD EXECUTION INFORMATION:

${input}

Return the complete build diagnostic JSON object now.`,
        },
      ],
      buildOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Build diagnostic raw output:", rawOutput);

    console.log("Build diagnostic Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Build diagnostic generation was truncated.");

      throw new Error(
        "Build diagnostic engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing build diagnostic output:", error);

      console.error("Build diagnostic raw output:", rawOutput);

      throw new Error("Build diagnostic engine returned invalid JSON.");
    }

    console.log("Build diagnostic parsed output:", parsedOutput);

    const validationResult = buildSchema.safeParse(parsedOutput);

    console.log("Build diagnostic validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Build diagnostic validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Build diagnostic engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new BuildEngine();
