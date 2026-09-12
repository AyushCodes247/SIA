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

    // console.log("ollama response:", response);
    /*
    ollama response: {
  model: 'Gemma4:e4b',
  created_at: '2026-09-12T12:10:22.655633Z',
  message: {
    role: 'assistant',
    content: '{"intent": "unknown", "domain": "science", "realtime": false, "general": true, "requires_web": false, "requires_tool": false, "complexity": "low", "confidence": 1.0}'
  },
  done: true,
  done_reason: 'stop',
  total_duration: 4939357750,
  load_duration: 2612840792,
  prompt_eval_count: 655,
  prompt_eval_cached_count: 0,
  prompt_eval_duration: 957874000,
  eval_count: 52,
  eval_duration: 1353458000
}
    */

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
