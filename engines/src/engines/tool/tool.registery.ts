import type { ToolCategory } from "@schemas/tool.schema.js";
import type { ToolDefinition } from "./tool.type.js";

class ToolRegistery {
  private readonly tools = new Map<string, ToolDefinition<any, any>>();

  register(tool: ToolDefinition<any, any>): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool "${tool.name}" is already registered.`);
    }

    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(name);
  }

  getAll(): ToolDefinition<any, any>[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: ToolCategory): ToolDefinition<any, any>[] {
    return this.getAll().filter((tool) => tool.category === category);
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }

  getToolDescriptions() {
    return this.getAll().map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
    }));
  }
}

export default new ToolRegistery();