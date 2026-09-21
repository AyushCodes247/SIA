import {
  pgTable,
  uuid,
  varchar,
  text,
  real,
  vector,
  timestamp,
} from "drizzle-orm/pg-core";

export const memories = pgTable("memories", {
  id: uuid("id").primaryKey(),

  userPublicId: varchar("user_public_id", {
    length: 255,
  }).notNull(),

  content: text("content").notNull(),

  category: varchar("category", {
    length: 50,
  }).notNull(),

  importance: real("importance").notNull(),

  embedding: vector("embedding", {
    dimensions: 3072,
  }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
