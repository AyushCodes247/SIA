import { and, desc, eq, gte, sql } from "drizzle-orm";
import vectorDB from "@/vector.js";
import { memories } from "@schemas/memory.schema.js";

import {
  memoryRetrieveSchema,
  type MemoryRetrieveInput,
} from "@brain/memory.schema.js";
import { embedText } from "./embedding.pipe.js";

class MemoryRetrieveEngine {
  async execute(input: MemoryRetrieveInput) {
    const validateInput = memoryRetrieveSchema.parse(input);

    const queryEmbedding = await embedText(validateInput.query);

    const similarity = sql<number>`
      1 - (
        ${memories.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector
      )
    `;

    const results = await vectorDB
      .select({
        id: memories.id,
        content: memories.content,
        category: memories.category,
        importance: memories.importance,
        similarity,
      })
      .from(memories)
      .where(
        and(
          eq(memories.userPublicId, validateInput.userPublicId),
          gte(similarity, validateInput.similarityThreshold),
        ),
      )
      .orderBy(desc(similarity))
      .limit(validateInput.topK);

    return {
      query: validateInput.query,
      memories: results,
    };
  }
}

export default new MemoryRetrieveEngine();
