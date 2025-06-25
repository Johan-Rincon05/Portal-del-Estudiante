/**
 * Esquema de la base de datos y tipos para el Portal del Estudiante
 * Este archivo define las tablas, tipos y validaciones para la base de datos
 */

import { pgTable, text, timestamp, varchar, integer, serial, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Tabla de usuarios
 * Almacena la información de autenticación y roles de los usuarios
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("estudiante"),
  isActive: boolean("is_active").notNull().default(true),
  permissions: jsonb("permissions").$type<Record<string, boolean>>().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

// Profiles table - stores user profile information
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  documentType: text("document_type"),
  documentNumber: text("document_number"),
  birthDate: timestamp("birth_date"),
  birthPlace: text("birth_place"),
  personalEmail: text("personal_email"),
  icfesAc: text("icfes_ac"),
  phone: varchar("phone", { length: 20 }),
  city: text("city"),
  address: text("address"),
  neighborhood: text("neighborhood"),
  locality: text("locality"),
  socialStratum: text("social_stratum"),
  bloodType: text("blood_type"),
  conflictVictim: boolean("conflict_victim"),
  maritalStatus: text("marital_status"),
  createdAt: timestamp("created_at").defaultNow()
});

// University data table - stores student academic information
export const universityData = pgTable("university_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  universityId: integer("university_id").notNull().references(() => universities.id),
  programId: integer("program_id").notNull().references(() => programs.id),
  academicPeriod: text("academic_period"),
  studyDuration: text("study_duration"),
  methodology: text("methodology"),
  degreeTitle: text("degree_title"),
  subscriptionType: text("subscription_type"),
  applicationMethod: text("application_method"),
  severancePaymentUsed: boolean("severance_payment_used")
});

// Payments table - stores payment information
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  giftReceived: boolean("gift_received"),
  documentsStatus: text("documents_status")
});

// Installments table - stores payment plan installments
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  support: text("support"),
  createdAt: timestamp("created_at").defaultNow()
});

// Installment observations table - stores payment-related observations
export const installmentObservations = pgTable("installment_observations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow()
});

// Documents table - stores uploaded documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),  // "cedula", "diploma", "acta", "foto", "recibo", "formulario"
  name: text("name").notNull(),  // Nombre del documento
  path: text("path").notNull(),  // Storage path
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Requests table - for student requests
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"),
  response: text("response"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'date' }),
  respondedAt: timestamp("responded_at", { mode: 'date' }),
  respondedBy: integer("responded_by")
});

// Universities table
export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Programs table
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").notNull().references(() => universities.id),
  name: text("name").notNull(),
  isConvention: boolean("is_convention").default(false),
  createdAt: timestamp("created_at").defaultNow()
});

// Relationships are defined through foreign keys above

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertUniversityDataSchema = createInsertSchema(universityData).omit({ id: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
export const insertInstallmentSchema = createInsertSchema(installments).omit({ id: true, createdAt: true });
export const insertInstallmentObservationSchema = createInsertSchema(installmentObservations).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });
export const insertUniversitySchema = createInsertSchema(universities).omit({ id: true });
export const insertProgramSchema = createInsertSchema(programs).omit({ id: true });

// Additional validation schemas
export const registerUserSchema = z.object({
  username: z.string().min(3, "Nombre de usuario es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida")
});

export const createUserSchema = z.object({
  username: z.string().min(3, "Nombre de usuario es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["estudiante", "admin", "superuser"])
});

export const createRequestSchema = z.object({
  subject: z.string().min(1, "El asunto es requerido"),
  message: z.string().min(1, "El mensaje es requerido")
});

export const updateRequestSchema = z.object({
  response: z.string().min(1, "La respuesta es requerida"),
  status: z.enum(["pendiente", "en_proceso", "completada", "rechazada"]),
  respondedAt: z.date().optional(),
  respondedBy: z.number().optional()
});

export const universityDataFormSchema = z.object({
  universityId: z.number().min(1, "Debes seleccionar una universidad"),
  programId: z.number().min(1, "Debes seleccionar un programa"),
  academicPeriod: z.string().min(1, "El periodo académico es requerido"),
  studyDuration: z.string().min(1, "La duración de estudios es requerida"),
  methodology: z.enum(["presencial", "virtual", "distancia"], {
    required_error: "La metodología es requerida"
  }),
  degreeTitle: z.string().min(1, "El título a obtener es requerido"),
  subscriptionType: z.enum(["nuevo", "reingreso", "transferencia"], {
    required_error: "El tipo de inscripción es requerido"
  }),
  applicationMethod: z.enum(["online", "presencial"], {
    required_error: "El método de aplicación es requerido"
  }),
  severancePaymentUsed: z.boolean()
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateRequest = z.infer<typeof updateRequestSchema>;

/**
 * Tabla de roles
 * Define los roles disponibles y sus permisos por defecto
 */
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  description: varchar('description', { length: 255 }),
  permissions: jsonb('permissions').$type<Record<string, boolean>>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Tipos TypeScript
export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;

/**
 * Permisos predefinidos del sistema
 */
export const PERMISSIONS = {
  // Permisos de usuario
  USER_CREATE: 'user:create',
  USER_READ: 'user:read',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  
  // Permisos de documentos
  DOCUMENT_CREATE: 'document:create',
  DOCUMENT_READ: 'document:read',
  DOCUMENT_UPDATE: 'document:update',
  DOCUMENT_DELETE: 'document:delete',
  
  // Permisos de administración
  ADMIN_ACCESS: 'admin:access',
  ADMIN_MANAGE_USERS: 'admin:manage_users',
  ADMIN_MANAGE_ROLES: 'admin:manage_roles',
  
  // Permisos de superusuario
  SUPERUSER_ACCESS: 'superuser:access'
} as const;

/**
 * Roles predefinidos con sus permisos por defecto
 */
export const DEFAULT_ROLES = {
  estudiante: {
    description: 'Usuario básico del sistema',
    permissions: {
      [PERMISSIONS.DOCUMENT_READ]: true
    }
  },
  admin: {
    description: 'Administrador del sistema',
    permissions: {
      [PERMISSIONS.USER_READ]: true,
      [PERMISSIONS.USER_UPDATE]: true,
      [PERMISSIONS.DOCUMENT_READ]: true,
      [PERMISSIONS.DOCUMENT_UPDATE]: true,
      [PERMISSIONS.ADMIN_ACCESS]: true,
      [PERMISSIONS.ADMIN_MANAGE_USERS]: true
    }
  },
  superuser: {
    description: 'Superusuario con acceso total',
    permissions: {
      [PERMISSIONS.USER_CREATE]: true,
      [PERMISSIONS.USER_READ]: true,
      [PERMISSIONS.USER_UPDATE]: true,
      [PERMISSIONS.USER_DELETE]: true,
      [PERMISSIONS.DOCUMENT_CREATE]: true,
      [PERMISSIONS.DOCUMENT_READ]: true,
      [PERMISSIONS.DOCUMENT_UPDATE]: true,
      [PERMISSIONS.DOCUMENT_DELETE]: true,
      [PERMISSIONS.ADMIN_ACCESS]: true,
      [PERMISSIONS.ADMIN_MANAGE_USERS]: true,
      [PERMISSIONS.ADMIN_MANAGE_ROLES]: true,
      [PERMISSIONS.SUPERUSER_ACCESS]: true
    }
  }
} as const;
