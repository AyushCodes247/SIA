import env from "@configs/env.config.js";

export interface OllamaMessage {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
}

export interface OllamaOptions {
  num_predict?: number;
  num_ctx?: number;
  temperature?: number;
  top_p?: number;
  top_k?: number;
  repeat_penalty?: number;
}

export type OllamaFormat = "json" | Record<string, unknown>;

export interface OllamaResponse {
  model: string;

  message: {
    role: "assistant";
    content: string;
    thinking?: string;
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

  async chat(
    messages: OllamaMessage[],
    format?: OllamaFormat,
    options?: OllamaOptions,
  ): Promise<OllamaResponse> {
    if (messages.length === 0) {
      throw new Error("Ollama requires at least one message.");
    }

    const payload = {
      model: this.model,
      stream: false,
      messages,
      think: false,
      ...(format !== undefined && {
        format,
      }),
      ...(options !== undefined && {
        options,
      }),
    };

    console.log("OLLAMA REQUEST CONFIG:", {
      model: this.model,
      format,
      options,
      messageCount: messages.length,
    });

    let response: Response;

    try {
      response = await fetch(`${this.url}/api/chat`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("OLLAMA CONNECTION ERROR:", error);

      throw new Error("Failed to connect to Ollama.");
    }

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Ollama response failed: ${response.status} ${errorBody}`,
      );
    }

    let result: OllamaResponse;

    try {
      result = (await response.json()) as OllamaResponse;
    } catch {
      throw new Error("Ollama returned an invalid response.");
    }

    if (!result.message || typeof result.message.content !== "string") {
      throw new Error(
        "Ollama response does not contain valid message content.",
      );
    }

    return result;
  }
}

export default new OllamaService();
