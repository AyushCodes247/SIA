import ollamaService from "@services/ollama.service.js";
import { analyzeSchema, type AnalyzeResult } from "@schemas/analyze.schema.js";
import { ANALYZE_SYSTEM_PROMPT } from "@prompts/analyze.prompt.js";
import type { ExplainResult } from "@schemas/explain.schema.js";

class AnalyzeEngine {
  async analyze(input: ExplainResult): Promise<AnalyzeResult> {
    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: ANALYZE_SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: JSON.stringify(input),
        },
      ],
      "json",
    );

    const rawOutput = response.message.content;

    const cleanedOutput = rawOutput
      .replace(/^\`\`\`json\s*/i, "")
      .replace(/^\`\`\`\s*/i, "")
      .replace(/\s*\`\`\`$/i, "")
      .trim();

    let parsedOutput: unknown;

    try {
      parsedOutput = JSON.parse(cleanedOutput);
    } catch (error) {
      console.error("Error in analyze engine:", error);
      console.error("Analyze raw output:", rawOutput);

      throw new Error("Analyze engine returned invalid JSON.");
    }

    const result = analyzeSchema.safeParse(parsedOutput);

    if (!result.success) {
      throw new Error(
        `Analyze engine returned invalid output: ${result.error.message}`,
      );
    }

    return result.data;
  }
}

export default new AnalyzeEngine();
