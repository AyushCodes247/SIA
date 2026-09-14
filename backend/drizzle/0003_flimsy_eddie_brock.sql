CREATE TYPE "public"."document_status" AS ENUM('UPLOADED', 'PROCESSING', 'READY', 'FAILED');--> statement-breakpoint
CREATE TABLE "conversation_meta" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"conversation_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_public_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"mongo_document_id" varchar(24),
	"message_count" integer DEFAULT 0 NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "conversation_meta_conversation_id_unique" UNIQUE("conversation_id")
);
--> statement-breakpoint
CREATE TABLE "doc_meta" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"document_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_public_id" uuid NOT NULL,
	"conversation_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"storage_uri" text NOT NULL,
	"status" "document_status" DEFAULT 'UPLOADED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "doc_meta_document_id_unique" UNIQUE("document_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"internal_id" bigserial PRIMARY KEY NOT NULL,
	"public_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"profile_image_uri" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"email_verified_at" timestamp with time zone,
	CONSTRAINT "users_public_id_unique" UNIQUE("public_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "conversation_meta" ADD CONSTRAINT "conversation_meta_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_meta" ADD CONSTRAINT "doc_meta_user_public_id_users_public_id_fk" FOREIGN KEY ("user_public_id") REFERENCES "public"."users"("public_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doc_meta" ADD CONSTRAINT "doc_meta_conversation_id_conversation_meta_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation_meta"("conversation_id") ON DELETE no action ON UPDATE no action;