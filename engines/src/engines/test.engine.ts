import ollamaService from "@services/ollama.service.js";
import { testSchema, type TestResult } from "@schemas/test.schema.js";
import { TESTS_SYSTEM_PROMPT } from "@prompts/test.prompt.js";

const testsOutputSchema = {
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

    testRunner: {
      type: "string",
    },

    total: {
      type: "integer",
      minimum: 0,
    },

    passed: {
      type: "integer",
      minimum: 0,
    },

    failed: {
      type: "integer",
      minimum: 0,
    },

    skipped: {
      type: "integer",
      minimum: 0,
    },

    duration: {
      type: "number",
      minimum: 0,
    },

    failures: {
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

          source: {
            type: "string",
          },
        },

        required: ["name", "message", "source"],

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
    "testRunner",
    "total",
    "passed",
    "failed",
    "skipped",
    "duration",
    "failures",
    "output",
    "recommendations",
  ],

  additionalProperties: false,
};

class TestsEngine {
  async analyze(input: string): Promise<TestResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Test execution information cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: TESTS_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Analyze the following test execution information.

TEST EXECUTION INFORMATION:

${input}

Return the complete test diagnostic JSON object now.`,
        },
      ],
      testsOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Tests diagnostic raw output:", rawOutput);

    console.log("Tests diagnostic Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Tests diagnostic generation was truncated.");

      throw new Error(
        "Tests diagnostic engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing tests diagnostic output:", error);

      console.error("Tests diagnostic raw output:", rawOutput);

      throw new Error("Tests diagnostic engine returned invalid JSON.");
    }

    console.log("Tests diagnostic parsed output:", parsedOutput);

    const validationResult = testSchema.safeParse(parsedOutput);

    console.log("Tests diagnostic validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Tests diagnostic validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Tests diagnostic engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new TestsEngine();
