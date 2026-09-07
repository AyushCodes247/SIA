import {
  pgTable,
  bigserial,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userTable = pgTable("users", {
  internalId: bigserial("internal_id", { mode: "bigint" }).primaryKey(),
  publicId: uuid("public_id")
    .default(sql`gen_random_uuid()`)
    .notNull()
    .unique(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  profileImageUri: text("profile_image_uri"),
  isVerified: boolean("is_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at", {
    withTimezone: true,
    mode: "date",
  }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),

  emailVerifiedAt: timestamp("email_verified_at", {
    withTimezone: true,
    mode: "date",
  }),
});
