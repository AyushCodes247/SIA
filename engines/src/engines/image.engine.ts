import ollamaService from "@services/ollama.service.js";
import { IMAGE_RAG_SYSTEM_PROMPT } from "@prompts/imageRag.prompt.js";

class ImageEngine {
  async analyze(image: string): Promise<string> {
    const response = await ollamaService.chat([
      {
        role: "system",
        content: IMAGE_RAG_SYSTEM_PROMPT,
      },
      {
        role: "user",
        content: "Analyze the provided image.",
        images: [image],
      },
    ]);

    return response.message.content;
  }
}

export default new ImageEngine();
