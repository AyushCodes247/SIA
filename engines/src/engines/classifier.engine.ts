import ollamaService from "@services/ollama.service.js";

import {
  classifierSchema,
  type ClassifierResult,
} from "@schemas/classifier.schema.js";

import { CLASSIFIER_SYSTEM_PROMPT } from "@prompts/classifier.prompt.js";

class ClassifierEngine {
  async classify(query: string): Promise<ClassifierResult> {
    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: CLASSIFIER_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: query,
        },
      ],
      "json",
    );

    const rawOutput = response.message.content;

    const cleanedOutput = rawOutput
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(cleanedOutput);
    } catch (error) {
      console.error("Error in classifier engine:", error);
      console.error("Classifier raw output:", rawOutput);

      throw new Error("Classifier returned invalid JSON.");
    }

    const result = classifierSchema.safeParse(parsedOutput);

    if (!result.success) {
      throw new Error(
        `Classifier returned invalid output: ${result.error.message}`,
      );
    }

    return result.data;
  }
}

export default new ClassifierEngine();
