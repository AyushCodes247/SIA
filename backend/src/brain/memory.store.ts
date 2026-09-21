import { randomUUID } from "crypto";
import vectorDB from "@/vector.js";
import { memories } from "@schemas/memory.schema.js";
import { embedText } from "@pipes/embedding.pipe.js";
import { memoryStoreSchema } from "./memory.schema.js";

class MemoryStoreEngine {
  async execute(input: unknown) {
    const validatedInput = memoryStoreSchema.parse(input);

    const embedding = await embedText(validatedInput.content);

    const [memory] = await vectorDB
      .insert(memories)
      .values({
        id: randomUUID(),
        userPublicId: validatedInput.userPublicId,
        content: validatedInput.content,
        category: validatedInput.category,
        importance: validatedInput.importance,
        embedding,
      })
      .returning({
        id: memories.id,
        content: memories.content,
        category: memories.category,
        importance: memories.importance,
        createdAt: memories.createdAt,
      });

    return memory;
  }
}

export default new MemoryStoreEngine();
