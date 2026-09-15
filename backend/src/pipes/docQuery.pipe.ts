import { sql } from "drizzle-orm";
import vectorDB from "@/vector.js";
import { docChunks } from "@schemas/vector.schema.js";
import { embedText, generateAnswer } from "./embedding.pipe.js";

export async function queryDocument(question: string) {
  const questionEmbedding = await embedText(question);

  const vector = `[${questionEmbedding.join(",")}]`;

  const rows = await vectorDB
    .select({
      id: docChunks.id,
      documentId: docChunks.documentId,
      content: docChunks.content,
      metadata: docChunks.metadata,

      similarity: sql<number>`1 - (${docChunks.embedding} <=> ${vector}::vector)`,
    })
    .from(docChunks)
    .orderBy(sql`${docChunks.embedding} <=> ${vector}::vector`)
    .limit(5);

  if (rows.length === 0) {
    return {
      answer: "No relevant documents found.",
      sources: [],
    };
  }

  const context = rows.map((row) => row.content).join("\n\n---\n\n");

  const answer = await generateAnswer(context, question);

  return {
    answer,

    sources: rows.map((row) => ({
      docmentId: row.documentId,
      filename:
        typeof row.metadata === "object" &&
        row.metadata !== null &&
        "filename" in row.metadata
          ? row.metadata.filename
          : undefined,
    })),

    topSimilarity: Number(rows[0]?.similarity ?? 0).toFixed(3),
  };
}
