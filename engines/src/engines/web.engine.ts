import { tavily } from "@tavily/core";

import { webSchema, type WebSearchInput } from "@schemas/web.schema.js";

import env from "@configs/env.config.js";

class WebSearchEngine {
  private readonly client;

  constructor() {
    this.client = tavily({
      apiKey: env.TAVILY_TOKEN,
    });
  }

  async execute(input: WebSearchInput) {
    const validateInput = webSchema.parse(input);

    const response = await this.client.search(validateInput.query, {
      searchDepth: validateInput.searchDepth,

      topic: this.mapTopic(validateInput.topic),

      maxResults: validateInput.maxResults,

      includeAnswer: validateInput.includeAnswer,

      includeRawContent: validateInput.includeRawContent,
    });

    return {
      query: validateInput.query,

      answer: response.answer ?? null,

      results: response.results.map((result) => ({
        title: result.title,
        url: result.url,
        content: result.content,
        score: result.score,
        rawContent: result.rawContent ?? null,
      })),
    };
  }

  private mapTopic(topic: WebSearchInput["topic"]) {
    if (topic === "finance") {
      return "finance" as const;
    }

    if (topic === "media") {
      return "news" as const;
    }

    return "general" as const;
  }
}

export default new WebSearchEngine();
