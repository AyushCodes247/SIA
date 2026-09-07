import {
  pgTable,
  pgEnum,
  bigserial,
  uuid,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { userTable } from "./user.schema.js";
import { conversationMetaTable } from "./conversation.schema.js";

export const documentStatusEnum = pgEnum("document_status", [
  "UPLOADED",
  "PROCESSING",
  "READY",
  "FAILED",
]);

export const docMetaTable = pgTable("doc_meta", {
  internalId: bigserial("internal_id", {
    mode: "bigint",
  }).primaryKey(),

  documentId: uuid("document_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .unique(),

  userPublicId: uuid("user_public_id")
    .references(() => userTable.publicId)
    .notNull(),

  conversationId: uuid("conversation_id")
    .references(() => conversationMetaTable.conversationId)
    .notNull(),

  fileName: text("file_name").notNull(),

  mimeType: text("mime_type").notNull(),

  fileSize: integer("file_size").notNull(),

  storageUri: text("storage_uri").notNull(),

  status: documentStatusEnum("status").default("UPLOADED").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "date",
  })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    mode: "date",
  }),
});
