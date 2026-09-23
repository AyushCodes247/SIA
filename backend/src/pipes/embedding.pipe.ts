import env from "@configs/env.config.js";

import { AppError } from "@utils/essential.util.js";

const GEMINI_KEY = env.GEMINI_KEY;
const GEMINI_BASE_URL = env.GEMINI_BASE_URL;

export async function embedText(text?: string) {
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
