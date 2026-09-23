import type { Classification, BrainInput } from "./brain.type.js";

export type BrainRouterType = "ANSWER" | "WEB" | "RAG" | "MEMORY" | "TOOL";

class BrainRouter {
  router(classifiaction: Classification, input: BrainInput): BrainRouterType[] {
    const routes: BrainRouterType[] = [];

    if (classifiaction.requires_web || classifiaction.realtime) {
      routes.push("WEB");
    }

    const hasAttachments =
      Array.isArray(input.attachments) && input.attachments.length > 0;

    if (
      classifiaction.intent === "file_analysis" ||
      classifiaction.intent === "image_analysis" ||
      hasAttachments
    ) {
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
