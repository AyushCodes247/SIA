import mcpClient from "@mcps/client";
import type { BrainInput, BrainContext, BrainResult } from "./brain.type.js";

class BrainService {
  async braining(input: BrainInput): Promise<BrainResult> {
    const classificationResult = await mcpClient.callTools(
      "query_classifier_engine",
      {
        query: input.message,
      },
    );

    const classification = this.pareMCPResponse(classificationResult);

    const context: BrainContext = {};

    const answeringResult = await mcpClient.callTools("answering_engine", {
      query: input.message,
      classification: classification,
      messages: input.messages,
      context,
    });

    return this.pareMCPResponse(answeringResult);
  }

  private pareMCPResponse(response: unknown) {
    const result = response as {
      content?: Array<{
        type: string;
        text?: string;
      }>;
    };

    const text = result.content?.find((item) => item.type === "text")?.text;

    if (!text) {
      throw new Error("Invalid MCP response.");
    }

    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    return JSON.parse(cleanedText);
  }
}

export default new BrainService();
