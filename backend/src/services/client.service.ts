import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import env from "@configs/env.config.js";

class ClientService {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;

  async connect() {
    if (this.client) {
      return this.client;
    }

    this.client = new Client({
      name: "sia-backend",
      version: "1.0.0",
    });

    this.transport = new StreamableHTTPClientTransport(
      new URL(`${env.MCP_BASE_URL}/mcp`),
    );

    await this.client.connect(this.transport);

    return this.client;
  }

  async callTool(name: string, args: Record<string, unknown>) {
    const client = await this.connect();

    return await client.callTool({
      name,
      arguments: args,
    });
  }
}

export default new ClientService();
