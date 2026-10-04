import { z } from "zod";
import ollamaService from "@services/ollama.service.js";
import { reviewSchema, type ReviewResult } from "@schemas/review.schema.js";
import { REVIEW_SYSTEM_PROMPT } from "@prompts/review.prompt.js";

const reviewOutputSchema = {
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

class ReviewEngine {
  async review(input: string): Promise<ReviewResult> {
    if (!input || input.trim().length === 0) {
      throw new Error("Review input cannot be empty.");
    }

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: REVIEW_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: `Review the following code or project context:

${input}

Return the complete review JSON object now.`,
        },
      ],
      reviewOutputSchema,
      {
        num_predict: 2048,
        temperature: 0,
      },
    );

    const rawOutput = response.message.content;

    console.log("Review raw output:", rawOutput);

    console.log("Review Ollama metadata:", {
      done: response.done,
      done_reason: response.done_reason,
      eval_count: response.eval_count,
      eval_duration: response.eval_duration,
    });

    if (response.done_reason === "length") {
      console.error("Review generation was truncated.");

      throw new Error(
        "Review engine output was truncated because Ollama reached the generation limit.",
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
      console.error("Error parsing review output:", error);
      console.error("Review raw output:", rawOutput);

      throw new Error("Review engine returned invalid JSON.");
    }

    console.log("Review parsed output:", parsedOutput);

    const validationResult = reviewSchema.safeParse(parsedOutput);

    console.log("Review validation result:", {
      success: validationResult.success,
    });

    if (!validationResult.success) {
      console.error(
        "Review validation error:",
        z.prettifyError(validationResult.error),
      );

      throw new Error(
        `Review engine returned invalid output: ${validationResult.error.message}`,
      );
    }

    return validationResult.data;
  }
}

export default new ReviewEngine();
