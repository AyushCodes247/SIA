import express, { type Express } from "express";
import connectMcp from "@/engine.js";

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { transport } = await connectMcp();

app.all("/mcp", async (req, res) => {
  try {
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        error: "MCP request failed",
      });
    }
  }
});

export default app;
