import { pgTable, foreignKey, serial, integer, text, timestamp, boolean, unique, varchar, jsonb, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const documentStatus = pgEnum("document_status", ['pendiente', 'aprobado', 'rechazado', 'en_revision'])
export const documentType = pgEnum("document_type", ['cedula', 'diploma', 'acta', 'foto', 'recibo', 'formulario', 'certificado', 'otro'])
export const enrollmentStage = pgEnum("enrollment_stage", ['suscrito', 'documentos_completos', 'registro_validado', 'proceso_universitario', 'matriculado', 'inicio_clases', 'estudiante_activo', 'pagos_al_dia', 'proceso_finalizado'])
export const requestType = pgEnum("request_type", ['financiera', 'academica', 'documental_administrativa', 'datos_estudiante_administrativa'])


export const documents = pgTable("documents", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	type: documentType().notNull(),
	name: text().notNull(),
	path: text().notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).defaultNow(),
	status: documentStatus().default('pendiente').notNull(),
	rejectionReason: text("rejection_reason"),
	reviewedBy: integer("reviewed_by"),
	reviewedAt: timestamp("reviewed_at", { mode: 'string' }),
	observations: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "documents_user_id_users_id_fk"
		}),
]);

export const universities = pgTable("universities", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const programs = pgTable("programs", {
	id: serial().primaryKey().notNull(),
	universityId: integer("university_id").notNull(),
	name: text().notNull(),
	isConvention: boolean("is_convention").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.universityId],
			foreignColumns: [universities.id],
			name: "programs_university_id_universities_id_fk"
		}),
]);

export const universityData = pgTable("university_data", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	universityId: integer("university_id").notNull(),
	programId: integer("program_id").notNull(),
	academicPeriod: text("academic_period"),
	studyDuration: text("study_duration"),
	methodology: text(),
	degreeTitle: text("degree_title"),
	subscriptionType: text("subscription_type"),
	applicationMethod: text("application_method"),
	severancePaymentUsed: boolean("severance_payment_used"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "university_data_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.universityId],
			foreignColumns: [universities.id],
			name: "university_data_university_id_universities_id_fk"
		}),
	foreignKey({
			columns: [table.programId],
			foreignColumns: [programs.id],
			name: "university_data_program_id_programs_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	role: varchar({ length: 50 }).default('estudiante').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	email: varchar({ length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	permissions: jsonb().default({}),
}, (table) => [
	unique("users_username_unique").on(table.username),
	unique("users_email_unique").on(table.email),
]);

export const enrollmentStageHistory = pgTable("enrollment_stage_history", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	previousStage: enrollmentStage("previous_stage").notNull(),
	newStage: enrollmentStage("new_stage").notNull(),
	changedBy: integer("changed_by").notNull(),
	comments: text(),
	validationStatus: text("validation_status").default('approved').notNull(),
	validationNotes: text("validation_notes"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "enrollment_stage_history_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "enrollment_stage_history_changed_by_users_id_fk"
		}),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }),
	permissions: jsonb().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("roles_name_unique").on(table.name),
]);

export const notifications = pgTable("notifications", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	title: text().notNull(),
	body: text().notNull(),
	link: text(),
	isRead: boolean("is_read").default(false).notNull(),
	type: text().default('general').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const installmentObservations = pgTable("installment_observations", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	observation: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "installment_observations_user_id_users_id_fk"
		}),
]);

export const profiles = pgTable("profiles", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	fullName: text("full_name").notNull(),
	documentType: text("document_type"),
	documentNumber: text("document_number"),
	birthDate: timestamp("birth_date", { mode: 'string' }),
	birthPlace: text("birth_place"),
	personalEmail: text("personal_email"),
	icfesAc: text("icfes_ac"),
	phone: varchar({ length: 20 }),
	city: text(),
	address: text(),
	neighborhood: text(),
	locality: text(),
	socialStratum: text("social_stratum"),
	bloodType: text("blood_type"),
	conflictVictim: boolean("conflict_victim"),
	maritalStatus: text("marital_status"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	enrollmentStage: enrollmentStage("enrollment_stage").default('suscrito').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "profiles_user_id_users_id_fk"
		}),
]);

export const payments = pgTable("payments", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
	paymentMethod: text("payment_method"),
	amount: numeric({ precision: 10, scale:  2 }),
	giftReceived: boolean("gift_received"),
	documentsStatus: text("documents_status"),
	installmentId: integer("installment_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "payments_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.installmentId],
			foreignColumns: [installments.id],
			name: "payments_installment_id_installments_id_fk"
		}),
]);

export const requests = pgTable("requests", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	status: text().default('pendiente').notNull(),
	response: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
	respondedAt: timestamp("responded_at", { mode: 'string' }),
	respondedBy: integer("responded_by"),
	requestType: requestType("request_type").default('academica').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "requests_user_id_users_id_fk"
		}),
]);

export const installments = pgTable("installments", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	installmentNumber: integer("installment_number").notNull(),
	amount: numeric({ precision: 10, scale:  2 }),
	support: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	status: text().default('pendiente'),
	dueDate: timestamp("due_date", { mode: 'string' }),
	paidAmount: numeric("paid_amount", { precision: 10, scale:  2 }).default('0'),
	paymentDate: timestamp("payment_date", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "installments_user_id_users_id_fk"
		}),
]);
