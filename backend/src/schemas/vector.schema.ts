import {
  pgTable,
  uuid,
  text,
  vector,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const docChunks = pgTable("doc_chunks", {
  id: uuid("id").primaryKey(),

  documentId: uuid("document_id").notNull(),

  content: text("content").notNull(),

  embedding: vector("embedding", {
    dimensions: 3072,
  }).notNull(),

  metadata: jsonb("metadata"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
