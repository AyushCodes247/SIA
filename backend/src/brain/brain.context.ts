import type { BrainContext } from "./brain.type.js";

class BrainContextManager {
  create(): BrainContext {
    return {};
  }

  addWebContent(context: BrainContext, data: unknown): BrainContext {
    return {
      ...context,
      web: data,
    };
  }

  addRagContext(context: BrainContext, data: unknown): BrainContext {
    return {
      ...context,
      rag: data,
    };
  }

  addMemoryContext(context: BrainContext, data: unknown): BrainContext {
    return {
      ...context,
      memory: data,
    };
  }

  addToolContext(context: BrainContext, data: unknown): BrainContext {
    return {
      ...context,
      tools: data,
    };
  }
}

export default new BrainContextManager();
