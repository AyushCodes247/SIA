import type { Classification } from "./brain.type.js";

export type BrainRouterType = "ANSWER" | "WEB" | "RAG" | "MEMORY" | "TOOL";

class BrainRouter {
  router(classifiaction: Classification): BrainRouterType[] {
    const routes: BrainRouterType[] = [];

    if (classifiaction.requires_web || classifiaction.realtime) {
      routes.push("WEB");
    }

    if (classifiaction.intent === "file_analysis") {
      routes.push("RAG");
    }

    if (classifiaction.intent === "memory_retrieve") {
      routes.push("MEMORY");
    }

    if (classifiaction.requires_tool) {
      routes.push("TOOL");
    }

    routes.push("ANSWER");

    return routes;
  }
}

export default new BrainRouter();
