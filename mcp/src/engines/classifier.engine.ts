import ollamaService from "@services/ollama.service.js";
import {
  classifierSchema,
  type ClassifierResult,
} from "@schemas/classifier.schema.js";
import { CLASSIFIER_SYSTEM_PROMPT } from "@prompts/classifier.prompt.js";

class ClassifierEngine {
  async classify(query: string): Promise<ClassifierResult> {
    const response = await ollamaService.chat([
      {
        role: "system",
        content: CLASSIFIER_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: query,
      },
    ]);

    const rawOutput = response.message.content;

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(rawOutput);
    } catch (error) {
      console.error("Error in classifier engine:", error);
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
