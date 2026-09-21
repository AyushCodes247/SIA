import mcpClient from "@mcps/client";

import BrainContextManager from "./brain.context.js";

import BrainRouter from "./brain.router.js";

import type {
  BrainInput,
  BrainContext,
  BrainResult,
  Classification,
} from "./brain.type.js";

import MemoryRetriveEngine from "@pipes/retrieve.pipe.js";
import MemoryStoreEngine from "@brain/memory.store.js";

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

    console.log("CLASSIFICATION:", classification);

    if (classification.needs_clarification) {
      return {
        content: classification.clarification_reason
          ? `Could you clarify your request? ${classification.clarification_reason}`
          : "Could you clarify your request?",
        sources: undefined,
        toolExecutions: undefined,
        model: undefined,
      };
    }

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
          const memoryResult = await MemoryRetriveEngine.execute({
            userPublicId: input.userPublicId,
            query: input.message,
            topK: 5,
            similarityThreshold: 0.7,
          });

          console.log("MEMORY RESULT:", memoryResult);

          context = BrainContextManager.addMemoryContext(context, memoryResult);

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

          console.log("ANSWERING ENGINE RAW RESULT:", answeringResult);

          const answer = this.parseMCPResponse<{
            content: string;
          }>(answeringResult);

          console.log("PARSED ANSWER:", answer);

          const normalizedAnswer = this.normalizeBrainResult(answer);

          console.log("NORMALIZED ANSWER:", normalizedAnswer);

          const memoryInput = [
            {
              role: "user",
              content: input.message,
            },
            {
              role: "assistant",
              content: normalizedAnswer.content,
            },
          ];

          try {
            const memoryResult = await mcpClient.callTools("memory_engine", {
              operation: "store",
              query: JSON.stringify(memoryInput),
            });

            const extractedMemory = this.parseMCPResponse<{
              shouldStore: boolean;
              memories: Array<{
                content: string;
                category: string;
                importance: number;
              }>;
            }>(memoryResult);

            console.log("EXTRACTED MEMORY:", extractedMemory);

            if (
              extractedMemory.shouldStore &&
              extractedMemory.memories.length > 0
            ) {
              for (const memory of extractedMemory.memories) {
                const storedMemory = await MemoryStoreEngine.execute({
                  userPublicId: input.userPublicId,
                  content: memory.content,
                  category: memory.category,
                  importance: memory.importance,
                });

                console.log("memory stored:", storedMemory);
              }

              console.log(
                `Stored ${extractedMemory.memories.length} memory/memories.`,
              );
            }
          } catch (error) {
            console.error("Memory extraction/storage failed:", error);
          }

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
      throw new Error(`MCP response is not valid JSON: ${cleanedText}`);
    }
  }
}

export default new BrainService();
