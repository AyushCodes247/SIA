import mcpClient from "@mcps/client";

import BrainContextManager from "./brain.context.js";
import BrainRouter from "./brain.router.js";

import type {
  BrainInput,
  BrainContext,
  BrainResult,
  Classification,
} from "./brain.type.js";

class BrainService {
  async braining(input: BrainInput): Promise<BrainResult> {
    const classificationResult = await mcpClient.callTools(
      "query_classifier_engine",
      {
        query: input.message,
      },
    );

    const classification =
      this.parseMCPResponse<Classification>(classificationResult);

    let context: BrainContext = BrainContextManager.create();

    const routes = BrainRouter.router(classification);

    for (const route of routes) {
      switch (route) {
        case "WEB": {
          const webResult = await mcpClient.callTools("web_search_engine", {
            query: input.message,
            topic: classification.domain,
          });

          const webContent = this.parseMCPResponse<{
            query: string;
            answer: string | null;
            results: Array<{
              title: string;
              url: string;
              content: string;
              score: number;
              rawContent: string | null;
            }>;
          }>(webResult);

          context = BrainContextManager.addWebContent(context, webContent);

          break;
        }

        case "RAG": {
          // RAG integration later
          break;
        }

        case "MEMORY": {
          // Memory integration later
          break;
        }

        case "TOOL": {
          // Tool integration later
          break;
        }

        case "ANSWER": {
          const answeringResult = await mcpClient.callTools(
            "answering_engine",
            {
              query: input.message,
              classification: classification,
              messages: input.messages,
              context,
            },
          );

          const answer = this.parseMCPResponse<{
            content: string;
          }>(answeringResult);

          const normalizedAnswer = this.normalizeBrainResult(answer);

          const webContext = context.web as
            | {
                results?: Array<{
                  title: string;
                  url: string;
                }>;
              }
            | undefined;

          const sources = webContext?.results?.map((result) => ({
            title: result.title,
            url: result.url,
            type: "web" as const,
          }));

          return {
            ...normalizedAnswer,
            sources,
          };
        }
      }
    }

    throw new Error("Brain did not produce an answer.");
  }

  private normalizeBrainResult(answer: unknown): BrainResult {
    if (typeof answer === "string") {
      return {
        content: answer,
        sources: undefined,
        toolExecutions: undefined,
        model: undefined,
      };
    }

    if (!answer || typeof answer !== "object") {
      throw new Error("Invalid answering engine response.");
    }

    const result = answer as BrainResult;

    if (typeof result.content !== "string") {
      throw new Error("Invalid answering engine content.");
    }

    return {
      content: result.content,
      sources: result.sources,
      toolExecutions: result.toolExecutions,
      model: result.model,
    };
  }

  private parseMCPResponse<T>(response: unknown): T {
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

    try {
      return JSON.parse(cleanedText) as T;
    } catch {
      return cleanedText as T;
    }
  }
}

export default new BrainService();
