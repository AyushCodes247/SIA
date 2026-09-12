import env from "@configs/env.config.js";
import type { BlockList } from "net";
import stream from "node:stream";

interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaResponse {
  model: string;
  role: string;
  message: {
    role: "assistant";
    content: string;
  };
  done: boolean;
  done_reason?: string;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_cached_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

class OllamaService {
  private readonly url: string;
  private readonly model: string;

  constructor() {
    this.url = env.OLLAMA_BASE_URL;
    this.model = env.OLLAMA_MODEL;
  }

  async chat(messages: OllamaMessage[]): Promise<OllamaResponse> {
    const response = await fetch(`${this.url}/api/chat`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`Ollama response failed: ${response.status} ${error}`);
    }

    return (await response.json()) as OllamaResponse;
  }
}

export default new OllamaService();
