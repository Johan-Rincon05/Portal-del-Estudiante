/**
 * Esquema de la base de datos y tipos para el Portal del Estudiante
 * Este archivo define las tablas, tipos y validaciones para la base de datos
 */

import { pgTable, text, timestamp, varchar, integer, serial, boolean, numeric, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Enum para las etapas del proceso de matrícula
 * Define los estados por los que pasa un estudiante durante su proceso de inscripción
 */
export const enrollmentStageEnum = pgEnum("enrollment_stage", [
  "suscrito",
  "documentos_completos", 
  "registro_validado",
  "proceso_universitario",
  "matriculado",
  "inicio_clases",
  "estudiante_activo",
  "pagos_al_dia",
  "proceso_finalizado"
]);

/**
 * Enum para tipos de documentos
 * Define los tipos de documentos permitidos en el sistema
 */
export const documentTypeEnum = pgEnum("document_type", [
  "cedula",
  "diploma",
  "acta", 
  "foto",
  "recibo",
  "formulario",
  "certificado",
  "otro"
]);

/**
 * Enum para estados de documentos
 * Define los estados posibles de un documento en el sistema
 */
export const documentStatusEnum = pgEnum("document_status", [
  "pendiente",
  "aprobado", 
  "rechazado",
  "en_revision"
]);

/**
 * Enum para tipos de solicitud
 * Define las categorías de solicitudes que pueden crear los estudiantes
 */
export const requestTypeEnum = pgEnum("request_type", [
  "financiera",
  "academica", 
  "documental_administrativa",
  "datos_estudiante_administrativa"
]);

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
  // email removido - se obtiene de users.email para evitar duplicación
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
  enrollmentStage: enrollmentStageEnum("enrollment_stage").notNull().default("suscrito"),
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
  documentsStatus: text("documents_status"),
  installmentId: integer("installment_id").references(() => installments.id) // Relación con cuota específica
});

// Installments table - stores payment plan installments
export const installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  support: text("support"),
  status: text("status").default("pendiente"), // Estado de la cuota: pendiente, pagada, vencida, parcial
  dueDate: timestamp("due_date"), // Fecha de vencimiento
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default(0), // Monto pagado
  paymentDate: timestamp("payment_date"), // Fecha de pago
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
  type: documentTypeEnum("type").notNull(),  // Tipo de documento validado
  name: text("name").notNull(),  // Nombre del documento
  path: text("path").notNull(),  // Storage path
  status: documentStatusEnum("status").notNull().default("pendiente"), // Estado del documento validado
  rejectionReason: text("rejection_reason"), // Motivo del rechazo (opcional)
  observations: text("observations"), // Observaciones del estudiante al subir (opcional)
  reviewedBy: integer("reviewed_by"), // ID del administrador que revisó
  reviewedAt: timestamp("reviewed_at"), // Fecha de revisión
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Requests table - for student requests
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  requestType: requestTypeEnum("request_type").notNull().default("academica"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"),
  response: text("response"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'date' }),
  respondedAt: timestamp("responded_at", { mode: 'date' }),
  respondedBy: integer("responded_by")
});

// Notifications table - stores user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"), // URL opcional para redirección
  isRead: boolean("is_read").notNull().default(false),
  type: text("type").notNull().default("general"), // "document", "request", "stage", "general"
  createdAt: timestamp("created_at").notNull().defaultNow()
});

// Enrollment stage history table - stores stage change history
export const enrollmentStageHistory = pgTable("enrollment_stage_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  previousStage: enrollmentStageEnum("previous_stage").notNull(),
  newStage: enrollmentStageEnum("new_stage").notNull(),
  changedBy: integer("changed_by").notNull().references(() => users.id), // ID del admin que hizo el cambio
  comments: text("comments"), // Comentarios opcionales del administrador
  validationStatus: text("validation_status").notNull().default("approved"), // "pending", "approved", "rejected"
  validationNotes: text("validation_notes"), // Notas de validación
  createdAt: timestamp("created_at").notNull().defaultNow()
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
export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
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
  requestType: z.enum(["financiera", "academica", "documental_administrativa", "datos_estudiante_administrativa"], {
    required_error: "El tipo de solicitud es requerido"
  }),
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

/**
 * Esquema para actualizar la etapa de matrícula de un estudiante
 * Solo puede ser utilizado por administradores y superusuarios
 */
export const updateEnrollmentStageSchema = z.object({
  enrollmentStage: z.enum([
    "suscrito",
    "documentos_completos", 
    "registro_validado",
    "proceso_universitario",
    "matriculado",
    "inicio_clases",
    "estudiante_activo",
    "pagos_al_dia",
    "proceso_finalizado"
  ], {
    required_error: "La etapa de matrícula es requerida"
  }),
  comments: z.string().optional(), // Comentarios opcionales del administrador
  validationNotes: z.string().optional() // Notas de validación opcionales
});

/**
 * Esquema para validar cambios de etapa
 * Incluye validaciones adicionales antes del cambio
 */
export const validateStageChangeSchema = z.object({
  currentStage: z.enum([
    "suscrito",
    "documentos_completos", 
    "registro_validado",
    "proceso_universitario",
    "matriculado",
    "inicio_clases",
    "estudiante_activo",
    "pagos_al_dia",
    "proceso_finalizado"
  ]),
  newStage: z.enum([
    "suscrito",
    "documentos_completos", 
    "registro_validado",
    "proceso_universitario",
    "matriculado",
    "inicio_clases",
    "estudiante_activo",
    "pagos_al_dia",
    "proceso_finalizado"
  ]),
  userId: z.number(),
  documentsCount: z.number().optional(),
  pendingRequestsCount: z.number().optional()
}).refine((data) => {
  // Validaciones de progresión lógica
  const stageOrder = [
    "suscrito",
    "documentos_completos", 
    "registro_validado",
    "proceso_universitario",
    "matriculado",
    "inicio_clases",
    "estudiante_activo",
    "pagos_al_dia",
    "proceso_finalizado"
  ];
  
  const currentIndex = stageOrder.indexOf(data.currentStage);
  const newIndex = stageOrder.indexOf(data.newStage);
  
  // Permitir retroceder solo una etapa (para correcciones)
  if (newIndex < currentIndex - 1) {
    return false;
  }
  
  // Validaciones específicas por etapa
  if (data.newStage === "documentos_completos" && (!data.documentsCount || data.documentsCount < 3)) {
    return false;
  }
  
  if (data.newStage === "matriculado" && data.pendingRequestsCount && data.pendingRequestsCount > 0) {
    return false;
  }
  
  return true;
}, {
  message: "Cambio de etapa no válido. Verifica los requisitos previos.",
  path: ["newStage"]
});

/**
 * Esquema para actualizar el estado de un documento
 * Solo puede ser utilizado por administradores y superusuarios
 */
export const updateDocumentStatusSchema = z.object({
  status: z.enum(["pendiente", "aprobado", "rechazado"], {
    required_error: "El estado del documento es requerido"
  }),
  rejectionReason: z.string().optional().nullable(),
  reviewedBy: z.number().optional(),
  reviewedAt: z.date().optional()
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type NewUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = typeof requests.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export type EnrollmentStageHistory = typeof enrollmentStageHistory.$inferSelect;
export type InsertEnrollmentStageHistory = typeof enrollmentStageHistory.$inferInsert;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

export type UpdateRequest = z.infer<typeof updateRequestSchema>;

/**
 * Tipo para la actualización de etapa de matrícula
 */
export type UpdateEnrollmentStage = z.infer<typeof updateEnrollmentStageSchema>;

/**
 * Tipo para la actualización de estado de documento
 */
export type UpdateDocumentStatus = z.infer<typeof updateDocumentStatusSchema>;

/**
 * Tipo para la validación de cambio de etapa
 */
export type ValidateStageChange = z.infer<typeof validateStageChangeSchema>;

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
