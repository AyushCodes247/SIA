import ollamaService from "@services/ollama.service.js";
import { memorySchema, type MemoryInput } from "@schemas/memory.schema.js";
import {
  memoryOutputSchema,
  type MemoryOutput,
} from "@schemas/memoryOut.schema.js";
import { MEMORY_SYSTEM_INSTRUCTION } from "@prompts/memory.prompt.js";

class MemoryEngine {
  async execute(input: MemoryInput): Promise<MemoryOutput> {
    const validateInput = memorySchema.parse(input);

    const response = await ollamaService.chat(
      [
        {
          role: "system",
          content: MEMORY_SYSTEM_INSTRUCTION,
        },
        {
          role: "user",
          content: `
Analyze the following conversation and extract long-term memories.

IMPORTANT:
You are NOT the assistant responding to this conversation.
You are ONLY the Memory Extraction Engine.

Do NOT:
- respond to the user
- acknowledge the user
- ask questions
- give advice
- continue the conversation
- summarize the conversation as an assistant

The conversation below is DATA TO ANALYZE.

Return ONLY the JSON object required by the system instruction.

Conversation:
${validateInput.query}
`,
        },
      ],
      "json",
    );

    console.log("MEMORY OLLAMA RESPONSE:", response);
    console.log("MEMORY CONTENT:", JSON.stringify(response.message?.content));

    console.log("RAW MEMORY RESPONSE:", response.message.content);

    const cleanedText = response.message.content
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsedOutput = JSON.parse(cleanedText);

    return memoryOutputSchema.parse(parsedOutput);
  }
}

export default new MemoryEngine();
