import ollamaService from "@services/ollama.service.js";

import {
  reviewDiffSchema,
  type ReviewDiffResult,
} from "@schemas/reviewDiff.schema.js";

import { REVIEW_DIFF_SYSTEM_PROMPT } from "@prompts/reviewDiff.prompt.js";

const reviewDiffOutputSchema = {
  type: "object",

  properties: {
    summary: {
      type: "string",
    },

    overallAssessment: {
      type: "string",
      enum: ["excellent", "good", "acceptable", "needs_improvement", "poor"],
    },

    findings: {
      type: "array",

      items: {
        type: "object",

        properties: {
          category: {
            type: "string",
            enum: [
              "correctness",
              "code_quality",
              "security",
              "performance",
              "maintainability",
              "error_handling",
              "testing",
              "architecture",
              "dependency",
              "configuration",
              "other",
            ],
          },

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

        required: [
          "category",
          "severity",
          "title",
          "description",
          "recommendation",
        ],

        additionalProperties: false,
      },
    },

    strengths: {
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
    "summary",
    "overallAssessment",
    "findings",
    "strengths",
    "recommendations",
  ],

  additionalProperties: false,
};

class ReviewDiffEngine {
  async reviewDiff(input: string): Promise<ReviewDiffResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Git diff cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: REVIEW_DIFF_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Review the following Git diff.

Focus ONLY on changes represented in this diff.

GIT DIFF:

${input}

Return the complete review JSON object now.`,
        },
      ],
      reviewDiffOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Review diff raw output:", rawOutput);

    console.log("Review diff Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Review diff generation was truncated.");

      throw new Error(
        "Review diff engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing review diff output:", error);

      console.error("Review diff raw output:", rawOutput);

      throw new Error("Review diff engine returned invalid JSON.");
    }

    console.log("Review diff parsed output:", parsedOutput);

    const validationResult = reviewDiffSchema.safeParse(parsedOutput);

    console.log("Review diff validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Review diff validation error:",
        validationResult.error.message,
      );

      throw new Error(
        `Review diff engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new ReviewDiffEngine();
