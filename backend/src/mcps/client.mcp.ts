import { Client } from "@modelcontextprotocol/sdk/client/index";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp";
import env from "@configs/env.config.js";

class MCPClient {
  private client: Client;
  private transport: StreamableHTTPClientTransport;
  private isConnected : boolean = false;

  constructor() {
    this.client = new Client({
      name: "sia-backend",
      version: "1.0.0",
    });

    this.transport = new StreamableHTTPClientTransport(
      new URL(env.MCP_BASE_URL),
    );
  }

  async connect() {
    if(this.isConnected){
      return;
    }

    await this.client.connect(this.transport);

    this.isConnected = true;
    console.info("CONNECTED TO THE SIA's MCP SERVER.");
  }

  async listTools() {
    return await this.client.listTools();
  }

  async callTools(name: string, args: Record<string, unknown>) {
    return await this.client.callTool({
      name,
      arguments: args,
    });
  }
}

export default new MCPClient();
