import express, { type Express } from "express";
import { createMcpSession, transports } from "@/engine.js";

const app: Express = express();
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));

app.all("/mcp", async (req, res) => {
  try {
    const sessionId = req.headers["mcp-session-id"] as string | undefined;

    if (sessionId) {
      const transport = transports.get(sessionId);

      if (!transport) {
        return res.status(404).json({
          success: false,
          error: "MCP session not found.",
        });
      }

      await transport.handleRequest(req, res, req.body);

      return;
    }

    const { transport } = await createMcpSession();

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "MCP request failed.",
      });
    }
  }
});

export default app;
