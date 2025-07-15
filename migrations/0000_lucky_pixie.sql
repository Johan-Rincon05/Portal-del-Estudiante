-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."document_status" AS ENUM('pendiente', 'aprobado', 'rechazado', 'en_revision');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('cedula', 'diploma', 'acta', 'foto', 'recibo', 'formulario', 'certificado', 'otro');--> statement-breakpoint
CREATE TYPE "public"."enrollment_stage" AS ENUM('suscrito', 'documentos_completos', 'registro_validado', 'proceso_universitario', 'matriculado', 'inicio_clases', 'estudiante_activo', 'pagos_al_dia', 'proceso_finalizado');--> statement-breakpoint
CREATE TYPE "public"."request_type" AS ENUM('financiera', 'academica', 'documental_administrativa', 'datos_estudiante_administrativa');--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "document_type" NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"status" "document_status" DEFAULT 'pendiente' NOT NULL,
	"rejection_reason" text,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"observations" text
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"university_id" integer NOT NULL,
	"name" text NOT NULL,
	"is_convention" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "university_data" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"university_id" integer NOT NULL,
	"program_id" integer NOT NULL,
	"academic_period" text,
	"study_duration" text,
	"methodology" text,
	"degree_title" text,
	"subscription_type" text,
	"application_method" text,
	"severance_payment_used" boolean
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(50) DEFAULT 'estudiante' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"permissions" jsonb DEFAULT '{}'::jsonb,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "enrollment_stage_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"previous_stage" "enrollment_stage" NOT NULL,
	"new_stage" "enrollment_stage" NOT NULL,
	"changed_by" integer NOT NULL,
	"comments" text,
	"validation_status" text DEFAULT 'approved' NOT NULL,
	"validation_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"description" varchar(255),
	"permissions" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"type" text DEFAULT 'general' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installment_observations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"observation" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"full_name" text NOT NULL,
	"document_type" text,
	"document_number" text,
	"birth_date" timestamp,
	"birth_place" text,
	"personal_email" text,
	"icfes_ac" text,
	"phone" varchar(20),
	"city" text,
	"address" text,
	"neighborhood" text,
	"locality" text,
	"social_stratum" text,
	"blood_type" text,
	"conflict_victim" boolean,
	"marital_status" text,
	"created_at" timestamp DEFAULT now(),
	"enrollment_stage" "enrollment_stage" DEFAULT 'suscrito' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"payment_date" timestamp,
	"payment_method" text,
	"amount" numeric(10, 2),
	"gift_received" boolean,
	"documents_status" text,
	"installment_id" integer
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'pendiente' NOT NULL,
	"response" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp,
	"responded_at" timestamp,
	"responded_by" integer,
	"request_type" "request_type" DEFAULT 'academica' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "installments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"installment_number" integer NOT NULL,
	"amount" numeric(10, 2),
	"support" text,
	"created_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'pendiente',
	"due_date" timestamp,
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"payment_date" timestamp
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_data" ADD CONSTRAINT "university_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_data" ADD CONSTRAINT "university_data_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "university_data" ADD CONSTRAINT "university_data_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_stage_history" ADD CONSTRAINT "enrollment_stage_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "enrollment_stage_history" ADD CONSTRAINT "enrollment_stage_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installment_observations" ADD CONSTRAINT "installment_observations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_installment_id_installments_id_fk" FOREIGN KEY ("installment_id") REFERENCES "public"."installments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
*/