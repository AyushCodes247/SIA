import fs from "fs/promises";
import mcpClient from "@mcps/client";

interface ImageMcpContent {
  type: string;
  text?: string;
}

interface ImageMcpResponse {
  content?: ImageMcpContent[];
  isError?: boolean;
}

async function imageToBase64(filePath: string): Promise<string> {
  try {
    const buffer = await fs.readFile(filePath);

    if (buffer.length === 0) {
      throw new Error("Image file is empty.");
    }

    return buffer.toString("base64");
  } catch (error) {
    console.error("Error while reading image:", error);

    throw new Error("Failed to read image.");
  }
}

export async function extractImageContent(filePath: string): Promise<string> {
  try {
    const imageBase64 = await imageToBase64(filePath);

    const response = (await mcpClient.callTools("image_analysis_engine", {
      image: imageBase64,
    })) as ImageMcpResponse;

    if (response.isError) {
      throw new Error("Image Analysis engine failed.");
    }

    if (!Array.isArray(response.content)) {
      throw new Error("Image analysis engine returned invalid content.");
    }

    const textContent = response.content.find(
      (item) =>
        item.type === "text" &&
        typeof item.text === "string" &&
        item.text.trim().length > 0,
    );

    if (!textContent?.text) {
      throw new Error(
        "Image analysis engine returned no textual representation.",
      );
    }

    return textContent.text.trim();
  } catch (error) {
    console.error("Error while analyzing image:", error);

    throw new Error("Failed to analyze image.");
  }
}
