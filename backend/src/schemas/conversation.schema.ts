import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { userTable } from "./user.schema.js";

export const conversationMetaTable = pgTable("conversation_meta", {
  internalId: bigserial("internal_id", {
    mode: "bigint",
  }).primaryKey(),

  conversationId: uuid("conversation_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .unique(),

  userPublicId: uuid("user_public_id")
    .references(() => userTable.publicId)
    .notNull(),

  title: varchar("title", {
    length: 255,
  }).notNull(),

  summary: text("summary"),

  mongoDocumentId: varchar("mongo_document_id", {
    length: 24,
  }),

  messageCount: integer("message_count").default(0).notNull(),

  isArchived: boolean("is_archived").default(false).notNull(),

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

  lastMessageAt: timestamp("last_message_at", {
    withTimezone: true,
    mode: "date",
  }),

  deletedAt: timestamp("deleted_at", {
    withTimezone: true,
    mode: "date",
  }),
});
