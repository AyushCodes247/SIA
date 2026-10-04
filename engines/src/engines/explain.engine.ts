import ollamaService from "@services/ollama.service.js";
import { explainSchema, type ExplainResult } from "@schemas/explain.schema.js";
import { EXPLAIN_SYSTEM_PROMPT } from "@prompts/explain.prompt.js";
import { z } from "zod";

export const explainInputSchema = z.object({
  content: z.string(),

  path: z.string().optional(),
});

type ExplainInput = z.infer<typeof explainInputSchema>;

class ExplainEngine {
  async explain(input: ExplainInput): Promise<ExplainResult> {
    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: EXPLAIN_SYSTEM_PROMPT,
        },

        {
          role: "user",
          content: `
File Path:
${input.path ?? "Unknown"}

Content:
${input.content}
`,
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
      console.error("Error in explain engine:", error);

      console.error("Explain raw output:", rawOutput);

      throw new Error("Explain engine returned invalid JSON.");
    }

    const result = explainSchema.safeParse(parsedOutput);

    if (!result.success) {
      throw new Error(
        `Explain engine returned invalid output: ${result.error.message}`,
      );
    }

    return result.data;
  }
}

export default new ExplainEngine();
