CREATE TABLE "memories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_public_id" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"importance" real NOT NULL,
	"embedding" vector(3072) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
