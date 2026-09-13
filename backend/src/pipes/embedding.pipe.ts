import env from "@configs/env.config.js";

import { AppError } from "@utils/essential.util.js";

const GEMINI_KEY = env.GEMINI_KEY;
const GEMINI_BASE_URL = env.GEMINI_BASE_URL;
const OLLAMA_BASE_URL = env.OLLAMA_BASE_URL;
const OLLAMA_MODEL = env.OLLAMA_MODEL;

export async function embedText(text: string) {
  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/gemini-embedding-001:embedContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: {
            parts: [{ text }],
          },
        }),
      },
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new AppError(`${JSON.stringify(data)}`, 400);
    }

    return data.embedding.values;
  } catch (error) {
    console.error("Error in embedding:", error);
    throw new AppError("Internal server error.", 500);
  }
}

export async function generateAnswer(context: string, question: string) {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Answer the question using only the provided context. If the answer is not present in the context, say that you don't have enough information.",
          },
          {
            role: "user",
            content: `Context:\n${context}\n\nQuestion: ${question}`,
          },
        ],
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      throw new AppError(`${JSON.stringify(data)}`, 400);
    }

    return data.message.content;
  } catch (error) {
    console.error("Error in generating:", error);
    throw new AppError("Internal server error.", 500);
  }
}
