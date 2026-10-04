import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import redis from "@configs/redis.config.js";
import { z } from "zod";
import classifierEngine from "@engines/classifier.engine.js";
import imageEngine from "@engines/image.engine.js";
import answeringEngine from "@engines/answer.engine.js";
import WebEngine from "@engines/web.engine.js";
import { webSchema } from "@schemas/web.schema.js";
import MemoryEngine from "@engines/memory.engine.js";
import { memorySchema } from "@schemas/memory.schema.js";
import ExplainEngine from "@engines/explain.engine.js";
import AnalyzeEngine from "@engines/analyze.engine.js";
import ReviewEngine from "@engines/review.engine.js";
import reviewDiffEngine from "@engines/reviewDiff.engine.js";
import dependenciesEngine from "@engines/dependencies.engine.js";

const transports = new Map<string, StreamableHTTPServerTransport>();

function mcpServerInit() {
  const server = new McpServer({
    name: "sia-mcp",
    version: "1.0.0",
  });

  // query classifier tool
  server.registerTool(
    "query_classifier_engine",
    {
      description: "Classifies a user query for SIA orchestration",
      inputSchema: {
        query: z.string().min(1),
      },
    },
    async ({ query }) => {
      const result = await classifierEngine.classify(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "project_dependencies_engine",
    {
      description:
        "Analyzes project dependencies for package type, purpose, health, risks, configuration concerns, and maintenance recommendations.",

      inputSchema: {
        dependencyInfo: z.string().min(1),
      },
    },
    async ({ dependencyInfo }) => {
      const result = await dependenciesEngine.analyze(dependencyInfo);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "project_review_engine",
    {
      description:
        "Reviews project code, files, components, or project context for correctness, code quality, security, performance, maintainability, error handling, and testing concerns.",
      inputSchema: {
        content: z.string().min(1),
      },
    },
    async ({ content }) => {
      const result = await ReviewEngine.review(content);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "analyze_engine",
    {
      description:
        "Analyzes project structure, architecture, code quality, performance, security, maintainability, testing, and configuration using project explanation context.",

      inputSchema: {
        projectContext: z.object({
          summary: z.string(),
          purpose: z.string(),
          components: z.array(
            z.object({
              name: z.string(),
              type: z.string(),
              purpose: z.string(),
            }),
          ),
          flow: z.array(z.string()),
          dependencies: z.array(z.string()),
          importantDetails: z.array(z.string()),
        }),
      },
    },
    async ({ projectContext }) => {
      const result = await AnalyzeEngine.analyze(projectContext);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  // image analysis tool
  server.registerTool(
    "image_analysis_engine",
    {
      description:
        "Analyzes an image using Gemma 4 E4B and returns a detailed textual representation for RAG.",
      inputSchema: {
        image: z.string().min(1),
      },
    },
    async ({ image }) => {
      const result = await imageEngine.analyze(image);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );

  server.registerTool(
    "web_search_engine",
    {
      description: "Search the web for relevant and up-to-date information.",
      inputSchema: webSchema,
    },
    async (input) => {
      const result = await WebEngine.execute(input);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "memory_engine",
    {
      description:
        "Extract and process information that may be useful as long-term memory.",
      inputSchema: memorySchema,
    },
    async (input) => {
      const result = await MemoryEngine.execute(input);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "review_diff_engine",
    {
      description:
        "Reviews a Git diff and identifies correctness, security, performance, maintainability, error handling, testing, and architectural issues introduced by the changes.",

      inputSchema: {
        diff: z.string().min(1),
      },
    },
    async ({ diff }) => {
      const result = await reviewDiffEngine.reviewDiff(diff);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "answering_engine",
    {
      description:
        "Generates the final response using the user's query, classification, conversation history, and optional context.",

      inputSchema: {
        query: z.string(),

        classification: z.object({
          intent: z.string(),
          domain: z.string(),
          realtime: z.boolean(),
          general: z.boolean(),
          requires_web: z.boolean(),
          requires_tool: z.boolean(),
          complexity: z.string(),
          confidence: z.number(),
        }),

        messages: z.array(
          z.object({
            role: z.enum(["system", "user", "assistant", "tool"]),
            content: z.string(),
          }),
        ),

        context: z
          .object({
            web: z.unknown().optional(),
            rag: z.unknown().optional(),
            memory: z.unknown().optional(),
            tools: z.unknown().optional(),
          })
          .optional(),
      },
    },

    async ({ query, classification, messages, context }) => {
      const result = await answeringEngine.answer({
        query,
        classification: classification,
        messages,
        context,
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  server.registerTool(
    "explain_engine",
    {
      description:
        "Explains project code, files, or components for SIA project analysis.",
      inputSchema: {
        content: z.string().min(1),
        path: z.string().optional(),
      },
    },
    async ({ content, path }) => {
      const result = await ExplainEngine.explain({ content, path });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );

  // development tool
  server.registerTool(
    "greet_dev",
    {
      description: "greets a user",
      inputSchema: {
        name: z.string(),
      },
    },
    async ({ name }) => {
      return {
        content: [
          {
            type: "text",
            text: `Hello user ${name}`,
          },
        ],
      };
    },
  );

  return server;
}

async function createMcpSession() {
  const server = mcpServerInit();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),

    onsessioninitialized: async (sessionId) => {
      await redis.set(
        `mcp:session:${sessionId}`,
        JSON.stringify({ sessionId, createdAt: Date.now() }),
        "EX",
        60 * 60,
      );
      transports.set(sessionId, transport);
    },
  });

  transport.onclose = async () => {
    const sessionId = transport.sessionId;

    if (!sessionId) return;

    transports.delete(sessionId);

    await redis.del(`mcp:session:${sessionId}`);
  };

  await server.connect(transport);

  return {
    server,
    transport,
  };
}

export { createMcpSession, mcpServerInit, transports };
