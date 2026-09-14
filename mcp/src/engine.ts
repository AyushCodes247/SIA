import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import redis from "@configs/redis.config.js";
import { z } from "zod";
import classifierEngine from "@engines/classifier.engine.js";
import imageRagEngine from "@engines/image.engine.js";

const server = new McpServer({
  name: "sia-mcp",
  version: "1.0.0",
});

// real tools
server.registerTool(
  "classify_query",
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
  "analyze_image",
  {
    description:
      "Analyzes an image using Gemma 4 E4B and returns a detailed textual representation for RAG.",
    inputSchema: {
      image: z.string().min(1),
    },
  },
  async ({ image }) => {
    const result = await imageRagEngine.analyze(image);

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

// development testing only
server.registerTool(
  "greet",
  {
    description: "Returns a greeting message",
    inputSchema: {
      name: z.string(),
    },
  },
  async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello ${name}! Welcome to SIA MCP.`,
        },
      ],
    };
  },
);

const transports = new Map<string, StreamableHTTPServerTransport>();

async function connectMcp() {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => randomUUID(),

    onsessioninitialized: async (sessionId) => {
      (await redis.set(
        `mcp:session:${sessionId}`,
        JSON.stringify({
          sessionId,
          createdAt: Date.now(),
        }),
      ),
        {
          EX: 60 * 60,
        });

      transports.set(sessionId, transport);
    },
  });

  transport.onclose = async () => {
    const sessionId = transport.sessionId;

    if (!sessionId) return;

    transports.delete(sessionId);

    redis.del(`mcp:session:${sessionId}`);
  };

  await server.connect(transport);

  return {
    server,
    transport,
  };
}

export default connectMcp;
