import { and, eq, inArray, isNull, sql } from "drizzle-orm";

import db from "@/index.js";
import vectorDB from "@/vector.js";

import { docMetaTable } from "@schemas/document.schema.js";
import { docChunks } from "@schemas/vector.schema.js";

import { embedText } from "@pipes/embedding.pipe.js";

interface RagRetrieveInput {
  userPublicId: string;
  conversationId: string;
  query: string;
  documentIds?: string[];
  topK?: number;
  perDocumentTopK?: number;
  similarityThreshold?: number;
}

interface RagChunk {
  chunkId: string;
  documentId: string;
  content: string;
  metadata: unknown;
  similarity: number;
  fileName: string;
  mimeType: string;
}

interface RagSource {
  documentId: string;
  title: string;
  type: "pdf" | "image";
}

interface RagRetrieveResult {
  chunks: RagChunk[];
  sources: RagSource[];
}

class RagRetrieveEngine {
  async execute({
    userPublicId,
    conversationId,
    query,
    documentIds,
    topK = 5,
    perDocumentTopK = 3,
    similarityThreshold = 0.7,
  }: RagRetrieveInput): Promise<RagRetrieveResult> {
    const filters = [
      eq(docMetaTable.userPublicId, userPublicId),
      eq(docMetaTable.conversationId, conversationId),
      eq(docMetaTable.status, "READY"),
      isNull(docMetaTable.deletedAt),
    ];

    if (documentIds?.length) {
      filters.push(inArray(docMetaTable.documentId, documentIds));
    }

    const documents = await db
      .select({
        documentId: docMetaTable.documentId,
        fileName: docMetaTable.fileName,
        mimeType: docMetaTable.mimeType,
      })
      .from(docMetaTable)
      .where(and(...filters));

    if (documents.length === 0) {
      return {
        chunks: [],
        sources: [],
      };
    }

    const questionEmbedding = await embedText(query);

    const vector = `[${questionEmbedding.join(",")}]`;

    const similarity = sql<number>`
      1 - (${docChunks.embedding} <=> ${vector}::vector)
    `;

    const explicitAttachments =
      Array.isArray(documentIds) && documentIds.length > 0;

    let rows: Array<{
      chunkId: string;
      documentId: string;
      content: string;
      metadata: unknown;
      similarity: number;
    }> = [];

    if (explicitAttachments) {
      const results = await Promise.all(
        documents.map(async (document) => {
          return vectorDB
            .select({
              chunkId: docChunks.id,
              documentId: docChunks.documentId,
              content: docChunks.content,
              metadata: docChunks.metadata,
              similarity,
            })
            .from(docChunks)
            .where(
              and(
                eq(docChunks.documentId, document.documentId),
                sql`${similarity} >= ${similarityThreshold}`,
              ),
            )
            .orderBy(sql`${docChunks.embedding} <=> ${vector}::vector`)
            .limit(perDocumentTopK);
        }),
      );

      rows = results
        .flat()
        .sort((a, b) => Number(b.similarity) - Number(a.similarity));
    } else {
      const allowedDocumentIds = documents.map(
        (document) => document.documentId,
      );

      rows = await vectorDB
        .select({
          chunkId: docChunks.id,
          documentId: docChunks.documentId,
          content: docChunks.content,
          metadata: docChunks.metadata,
          similarity,
        })
        .from(docChunks)
        .where(
          and(
            inArray(docChunks.documentId, allowedDocumentIds),
            sql`${similarity} >= ${similarityThreshold}`,
          ),
        )
        .orderBy(sql`${docChunks.embedding} <=> ${vector}::vector`)
        .limit(topK);
    }

    const documentMap = new Map(
      documents.map((document) => [document.documentId, document]),
    );

    const chunks: RagChunk[] = rows.flatMap((row) => {
      const document = documentMap.get(row.documentId);

      if (!document) {
        return [];
      }

      return [
        {
          chunkId: row.chunkId,
          documentId: row.documentId,
          content: row.content,
          metadata: row.metadata,
          similarity: Number(row.similarity),
          fileName: document.fileName,
          mimeType: document.mimeType,
        },
      ];
    });

    const sourceMap = new Map<string, RagSource>();

    for (const chunk of chunks) {
      if (sourceMap.has(chunk.documentId)) {
        continue;
      }

      sourceMap.set(chunk.documentId, {
        documentId: chunk.documentId,
        title: chunk.fileName,
        type: chunk.mimeType.startsWith("image/") ? "image" : "pdf",
      });
    }

    return {
      chunks,
      sources: Array.from(sourceMap.values()),
    };
  }
}

export default new RagRetrieveEngine();
