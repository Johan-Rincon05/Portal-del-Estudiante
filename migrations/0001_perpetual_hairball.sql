CREATE TABLE "allies" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "request_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "request_type" SET DEFAULT 'documental'::text;--> statement-breakpoint
DROP TYPE "public"."request_type";--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('documental', 'financiera');--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "request_type" SET DEFAULT 'documental'::"public"."request_type";--> statement-breakpoint
ALTER TABLE "requests" ALTER COLUMN "request_type" SET DATA TYPE "public"."request_type" USING "request_type"::"public"."request_type";--> statement-breakpoint
ALTER TABLE "installments" ALTER COLUMN "paid_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "ally_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_ally_id_allies_id_fk" FOREIGN KEY ("ally_id") REFERENCES "public"."allies"("id") ON DELETE no action ON UPDATE no action;