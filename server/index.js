var __defProp = Object.defineProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import "dotenv/config";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";
import dotenv from "dotenv";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  DEFAULT_ROLES: () => DEFAULT_ROLES,
  PERMISSIONS: () => PERMISSIONS,
  createRequestSchema: () => createRequestSchema,
  createUserSchema: () => createUserSchema,
  documentStatusEnum: () => documentStatusEnum,
  documentTypeEnum: () => documentTypeEnum,
  documents: () => documents,
  enrollmentStageEnum: () => enrollmentStageEnum,
  enrollmentStageHistory: () => enrollmentStageHistory,
  insertDocumentSchema: () => insertDocumentSchema,
  insertInstallmentObservationSchema: () => insertInstallmentObservationSchema,
  insertInstallmentSchema: () => insertInstallmentSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPaymentSchema: () => insertPaymentSchema,
  insertProfileSchema: () => insertProfileSchema,
  insertProgramSchema: () => insertProgramSchema,
  insertRequestSchema: () => insertRequestSchema,
  insertUniversityDataSchema: () => insertUniversityDataSchema,
  insertUniversitySchema: () => insertUniversitySchema,
  insertUserSchema: () => insertUserSchema,
  installmentObservations: () => installmentObservations,
  installments: () => installments,
  loginSchema: () => loginSchema,
  notifications: () => notifications,
  payments: () => payments,
  profiles: () => profiles,
  programs: () => programs,
  registerUserSchema: () => registerUserSchema,
  requestTypeEnum: () => requestTypeEnum,
  requests: () => requests,
  roles: () => roles,
  universities: () => universities,
  universityData: () => universityData,
  universityDataFormSchema: () => universityDataFormSchema,
  updateDocumentStatusSchema: () => updateDocumentStatusSchema,
  updateEnrollmentStageSchema: () => updateEnrollmentStageSchema,
  updateRequestSchema: () => updateRequestSchema,
  users: () => users,
  validateStageChangeSchema: () => validateStageChangeSchema
});
import { pgTable, text, timestamp, varchar, integer, serial, boolean, numeric, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var enrollmentStageEnum = pgEnum("enrollment_stage", [
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
var documentTypeEnum = pgEnum("document_type", [
  "cedula",
  "diploma",
  "acta",
  "foto",
  "recibo",
  "formulario",
  "certificado",
  "otro"
]);
var documentStatusEnum = pgEnum("document_status", [
  "pendiente",
  "aprobado",
  "rechazado",
  "en_revision"
]);
var requestTypeEnum = pgEnum("request_type", [
  "financiera",
  "academica",
  "documental_administrativa",
  "datos_estudiante_administrativa"
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 50 }).notNull().default("estudiante"),
  isActive: boolean("is_active").notNull().default(true),
  permissions: jsonb("permissions").$type().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var profiles = pgTable("profiles", {
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
var universityData = pgTable("university_data", {
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
var payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paymentDate: timestamp("payment_date"),
  paymentMethod: text("payment_method"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  giftReceived: boolean("gift_received"),
  documentsStatus: text("documents_status"),
  installmentId: integer("installment_id").references(() => installments.id)
  // Relación con cuota específica
});
var installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  support: text("support"),
  status: text("status").default("pendiente"),
  // Estado de la cuota: pendiente, pagada, vencida, parcial
  dueDate: timestamp("due_date"),
  // Fecha de vencimiento
  paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default(0),
  // Monto pagado
  paymentDate: timestamp("payment_date"),
  // Fecha de pago
  createdAt: timestamp("created_at").defaultNow()
});
var installmentObservations = pgTable("installment_observations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  observation: text("observation"),
  createdAt: timestamp("created_at").defaultNow()
});
var documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: documentTypeEnum("type").notNull(),
  // Tipo de documento validado
  name: text("name").notNull(),
  // Nombre del documento
  path: text("path").notNull(),
  // Storage path
  status: documentStatusEnum("status").notNull().default("pendiente"),
  // Estado del documento validado
  rejectionReason: text("rejection_reason"),
  // Motivo del rechazo (opcional)
  observations: text("observations"),
  // Observaciones del estudiante al subir (opcional)
  reviewedBy: integer("reviewed_by"),
  // ID del administrador que revisó
  reviewedAt: timestamp("reviewed_at"),
  // Fecha de revisión
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  requestType: requestTypeEnum("request_type").notNull().default("academica"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"),
  response: text("response"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  respondedAt: timestamp("responded_at", { mode: "date" }),
  respondedBy: integer("responded_by")
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  // URL opcional para redirección
  isRead: boolean("is_read").notNull().default(false),
  type: text("type").notNull().default("general"),
  // "document", "request", "stage", "general"
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var enrollmentStageHistory = pgTable("enrollment_stage_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  previousStage: enrollmentStageEnum("previous_stage").notNull(),
  newStage: enrollmentStageEnum("new_stage").notNull(),
  changedBy: integer("changed_by").notNull().references(() => users.id),
  // ID del admin que hizo el cambio
  comments: text("comments"),
  // Comentarios opcionales del administrador
  validationStatus: text("validation_status").notNull().default("approved"),
  // "pending", "approved", "rejected"
  validationNotes: text("validation_notes"),
  // Notas de validación
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  universityId: integer("university_id").notNull().references(() => universities.id),
  name: text("name").notNull(),
  isConvention: boolean("is_convention").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
var insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
var insertUniversityDataSchema = createInsertSchema(universityData).omit({ id: true });
var insertPaymentSchema = createInsertSchema(payments).omit({ id: true });
var insertInstallmentSchema = createInsertSchema(installments).omit({ id: true, createdAt: true });
var insertInstallmentObservationSchema = createInsertSchema(installmentObservations).omit({ id: true, createdAt: true });
var insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
var insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });
var insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
var insertUniversitySchema = createInsertSchema(universities).omit({ id: true });
var insertProgramSchema = createInsertSchema(programs).omit({ id: true });
var registerUserSchema = z.object({
  username: z.string().min(3, "Nombre de usuario es requerido"),
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrase\xF1as no coinciden",
  path: ["confirmPassword"]
});
var loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contrase\xF1a es requerida")
});
var createUserSchema = z.object({
  username: z.string().min(3, "Nombre de usuario es requerido"),
  email: z.string().email("Email inv\xE1lido"),
  password: z.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
  role: z.enum(["estudiante", "admin", "superuser"])
});
var createRequestSchema = z.object({
  requestType: z.enum(["financiera", "academica", "documental_administrativa", "datos_estudiante_administrativa"], {
    required_error: "El tipo de solicitud es requerido"
  }),
  subject: z.string().min(1, "El asunto es requerido"),
  message: z.string().min(1, "El mensaje es requerido")
});
var updateRequestSchema = z.object({
  response: z.string().min(1, "La respuesta es requerida"),
  status: z.enum(["pendiente", "en_proceso", "completada", "rechazada"]),
  respondedAt: z.date().optional(),
  respondedBy: z.number().optional()
});
var universityDataFormSchema = z.object({
  universityId: z.number().min(1, "Debes seleccionar una universidad"),
  programId: z.number().min(1, "Debes seleccionar un programa"),
  academicPeriod: z.string().min(1, "El periodo acad\xE9mico es requerido"),
  studyDuration: z.string().min(1, "La duraci\xF3n de estudios es requerida"),
  methodology: z.enum(["presencial", "virtual", "distancia"], {
    required_error: "La metodolog\xEDa es requerida"
  }),
  degreeTitle: z.string().min(1, "El t\xEDtulo a obtener es requerido"),
  subscriptionType: z.enum(["nuevo", "reingreso", "transferencia"], {
    required_error: "El tipo de inscripci\xF3n es requerido"
  }),
  applicationMethod: z.enum(["online", "presencial"], {
    required_error: "El m\xE9todo de aplicaci\xF3n es requerido"
  }),
  severancePaymentUsed: z.boolean()
});
var updateEnrollmentStageSchema = z.object({
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
    required_error: "La etapa de matr\xEDcula es requerida"
  }),
  comments: z.string().optional(),
  // Comentarios opcionales del administrador
  validationNotes: z.string().optional()
  // Notas de validación opcionales
});
var validateStageChangeSchema = z.object({
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
  if (newIndex < currentIndex - 1) {
    return false;
  }
  if (data.newStage === "documentos_completos" && (!data.documentsCount || data.documentsCount < 3)) {
    return false;
  }
  if (data.newStage === "matriculado" && data.pendingRequestsCount && data.pendingRequestsCount > 0) {
    return false;
  }
  return true;
}, {
  message: "Cambio de etapa no v\xE1lido. Verifica los requisitos previos.",
  path: ["newStage"]
});
var updateDocumentStatusSchema = z.object({
  status: z.enum(["pendiente", "aprobado", "rechazado"], {
    required_error: "El estado del documento es requerido"
  }),
  rejectionReason: z.string().optional().nullable(),
  reviewedBy: z.number().optional(),
  reviewedAt: z.date().optional()
});
var roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  permissions: jsonb("permissions").$type().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});
var PERMISSIONS = {
  // Permisos de usuario
  USER_CREATE: "user:create",
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  // Permisos de documentos
  DOCUMENT_CREATE: "document:create",
  DOCUMENT_READ: "document:read",
  DOCUMENT_UPDATE: "document:update",
  DOCUMENT_DELETE: "document:delete",
  // Permisos de administración
  ADMIN_ACCESS: "admin:access",
  ADMIN_MANAGE_USERS: "admin:manage_users",
  ADMIN_MANAGE_ROLES: "admin:manage_roles",
  // Permisos de superusuario
  SUPERUSER_ACCESS: "superuser:access"
};
var DEFAULT_ROLES = {
  estudiante: {
    description: "Usuario b\xE1sico del sistema",
    permissions: {
      [PERMISSIONS.DOCUMENT_READ]: true
    }
  },
  admin: {
    description: "Administrador del sistema",
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
    description: "Superusuario con acceso total",
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
};

// server/storage.ts
import { eq, and, or, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/portal_estudiante";
var client = postgres(connectionString);
var db = drizzle(client);
var storage = {
  /**
   * Operaciones de Usuario
   */
  /**
   * Crea un nuevo usuario
   * @param userData - Datos del usuario a crear
   * @returns Usuario creado
   */
  async createUser(userData) {
    const [user] = await db.insert(users).values({
      ...userData,
      permissions: userData.permissions || {}
    }).returning();
    return user;
  },
  /**
   * Obtiene un usuario por su ID
   * @param id - ID del usuario
   * @returns Usuario encontrado o undefined
   */
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },
  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username - Nombre de usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  },
  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserByEmail(email) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },
  /**
   * Actualiza los datos de un usuario
   * @param id - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateUser(id, updates) {
    const [user] = await db.update(users).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, id)).returning();
    return user || null;
  },
  /**
   * Elimina un usuario
   * @param id - ID del usuario
   */
  async deleteUser(id) {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  },
  /**
   * Lista usuarios con filtros opcionales
   * @param filters - Filtros para la búsqueda
   * @returns Lista de usuarios
   */
  async listUsers(filters) {
    let query = db.select().from(users);
    if (filters) {
      const conditions = [];
      if (filters.role) conditions.push(eq(users.role, filters.role));
      if (filters.isActive !== void 0) conditions.push(eq(users.isActive, filters.isActive));
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    return await query;
  },
  /**
   * Operaciones de Roles
   */
  /**
   * Crea un nuevo rol
   * @param roleData - Datos del rol a crear
   * @returns Rol creado
   */
  async createRole(roleData) {
    const [role] = await db.insert(roles).values(roleData).returning();
    return role;
  },
  /**
   * Obtiene un rol por su nombre
   * @param name - Nombre del rol
   * @returns Rol encontrado o undefined
   */
  async getRole(name) {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  },
  /**
   * Actualiza los datos de un rol
   * @param name - Nombre del rol
   * @param roleData - Datos a actualizar
   * @returns Rol actualizado
   */
  async updateRole(name, roleData) {
    const [role] = await db.update(roles).set({ ...roleData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(roles.name, name)).returning();
    return role;
  },
  /**
   * Elimina un rol
   * @param name - Nombre del rol
   */
  async deleteRole(name) {
    await db.delete(roles).where(eq(roles.name, name));
  },
  /**
   * Lista todos los roles
   * @returns Lista de roles
   */
  async listRoles() {
    return await db.select().from(roles);
  },
  /**
   * Operaciones de Permisos
   */
  /**
   * Obtiene los permisos de un usuario
   * @param userId - ID del usuario
   * @returns Permisos del usuario
   */
  async getUserPermissions(userId) {
    const user = await this.getUser(userId);
    if (!user) return {};
    return user.permissions || {};
  },
  /**
   * Actualiza los permisos de un usuario
   * @param userId - ID del usuario
   * @param permissions - Nuevos permisos
   * @returns Usuario actualizado
   */
  async updateUserPermissions(userId, permissions) {
    const [user] = await db.update(users).set({ permissions, updatedAt: /* @__PURE__ */ new Date() }).where(eq(users.id, userId)).returning();
    return user;
  },
  /**
   * Inicializa los roles por defecto
   */
  async initializeDefaultRoles() {
    for (const [roleName, roleData] of Object.entries(DEFAULT_ROLES)) {
      const existingRole = await this.getRole(roleName);
      if (!existingRole) {
        await this.createRole({
          name: roleName,
          permissions: roleData.permissions,
          description: roleData.description
        });
      }
    }
  },
  /**
   * Operaciones de Solicitudes
   */
  /**
   * Obtiene todas las solicitudes
   * @returns Lista de solicitudes
   */
  async getAllRequests() {
    return await db.select().from(requests).orderBy(requests.createdAt);
  },
  /**
   * Obtiene las solicitudes de un usuario
   * @param userId - ID del usuario
   * @returns Lista de solicitudes del usuario
   */
  async getRequestsByUserId(userId) {
    return await db.select().from(requests).where(eq(requests.userId, userId));
  },
  /**
   * Crea una nueva solicitud
   * @param insertRequest - Datos de la solicitud
   * @returns Solicitud creada
   */
  async createRequest(insertRequest) {
    const [request] = await db.insert(requests).values(insertRequest).returning();
    return request;
  },
  /**
   * Actualiza una solicitud
   * @param id - ID de la solicitud
   * @param updateData - Datos a actualizar
   * @returns Solicitud actualizada
   */
  async updateRequest(id, updateData) {
    const [request] = await db.update(requests).set(updateData).where(eq(requests.id, id)).returning();
    return request;
  },
  /**
   * Obtiene el número de solicitudes activas de un usuario
   * @param userId - ID del usuario
   * @returns Número de solicitudes activas
   */
  async getActiveRequestsCount(userId) {
    const activeRequests = await db.select().from(requests).where(
      and(
        eq(requests.userId, userId),
        or(
          eq(requests.status, "pendiente"),
          eq(requests.status, "en_proceso")
        )
      )
    );
    return activeRequests.length;
  },
  /**
   * Operaciones de Perfiles
   */
  /**
   * Obtiene el perfil de un usuario
   * @param userId - ID del usuario
   * @returns Perfil del usuario
   */
  async getProfile(userId) {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || null;
  },
  /**
   * Crea un nuevo perfil para un usuario
   * @param profileData - Datos del perfil
   * @returns Perfil creado
   */
  async createProfile(profileData) {
    const [profile] = await db.insert(profiles).values(profileData).returning();
    return profile;
  },
  /**
   * Actualiza el perfil de un usuario
   * @param userId - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Perfil actualizado
   */
  async updateProfile(userId, updates) {
    const [profile] = await db.update(profiles).set(updates).where(eq(profiles.userId, userId)).returning();
    return profile || null;
  },
  /**
   * Operaciones de Documentos
   */
  /**
   * Obtiene documentos de un usuario
   * @param userId - ID del usuario
   * @returns Lista de documentos
   */
  async getDocuments(userId) {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  },
  /**
   * Obtiene un documento específico
   * @param id - ID del documento
   * @returns Documento encontrado o null
   */
  async getDocument(id) {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || null;
  },
  /**
   * Crea un nuevo documento
   * @param documentData - Datos del documento
   * @returns Documento creado
   */
  async createDocument(documentData) {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  },
  /**
   * Elimina un documento
   * @param id - ID del documento
   * @param userId - ID del usuario propietario
   * @returns true si se eliminó correctamente
   */
  async deleteDocument(id, userId) {
    const result = await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return result.length > 0;
  },
  /**
   * Operaciones de Universidades
   */
  /**
   * Obtiene la lista de universidades
   * @returns Lista de universidades
   */
  async getUniversities() {
    return await db.select().from(universities);
  },
  /**
   * Obtiene la lista de programas de una universidad
   * @param universityId - ID de la universidad
   * @returns Lista de programas
   */
  async getPrograms(universityId) {
    return await db.select().from(programs).where(eq(programs.universityId, universityId));
  },
  /**
   * Operaciones de Datos Universitarios
   */
  /**
   * Obtiene los datos universitarios de un usuario
   * @param userId - ID del usuario
   * @returns Datos universitarios del usuario
   */
  async getUniversityData(userId) {
    const [data] = await db.select().from(universityData).where(eq(universityData.userId, userId));
    return data || null;
  },
  /**
   * Crea nuevos datos universitarios para un usuario
   * @param data - Datos universitarios
   * @returns Datos universitarios creados
   */
  async createUniversityData(data) {
    const [newUniversityData] = await db.insert(universityData).values(data).returning();
    return newUniversityData;
  },
  /**
   * Actualiza los datos universitarios de un usuario
   * @param userId - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Datos universitarios actualizados
   */
  async updateUniversityData(userId, updates) {
    const [data] = await db.update(universityData).set(updates).where(eq(universityData.userId, userId)).returning();
    return data || null;
  },
  /**
   * Operaciones de Usuarios
   */
  /**
   * Obtiene la lista de todos los usuarios
   * @returns Lista de usuarios
   */
  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  },
  /**
   * Obtiene la lista de todos los usuarios con perfiles
   * @returns Lista de usuarios con perfiles
   */
  async getAllUsersWithProfiles() {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      profile: profiles
    }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).orderBy(desc(users.createdAt));
    return result.map((row) => ({
      ...row,
      profile: row.profile || null
    }));
  },
  /**
   * Obtiene la lista de todos los estudiantes con documentos
   * @returns Lista de estudiantes con documentos
   */
  async getAllStudentsWithDocuments() {
    const result = await db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      profile: profiles,
      documentsCount: count(documents.id)
    }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).leftJoin(documents, eq(users.id, documents.userId)).where(eq(users.role, "estudiante")).groupBy(users.id, profiles.id).orderBy(desc(users.createdAt));
    return result.map((row) => ({
      ...row,
      profile: row.profile || null,
      documentsCount: Number(row.documentsCount)
    }));
  },
  /**
   * Operaciones de Pagos
   */
  /**
   * Obtiene los pagos de un usuario
   * @param userId - ID del usuario
   * @returns Lista de pagos del usuario
   */
  async getPaymentsByUserId(userId) {
    return await db.select().from(payments).where(eq(payments.userId, userId)).orderBy(desc(payments.paymentDate));
  },
  /**
   * Obtiene un pago específico
   * @param id - ID del pago
   * @returns Pago encontrado o null
   */
  async getPayment(id) {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || null;
  },
  /**
   * Crea un nuevo pago
   * @param paymentData - Datos del pago
   * @returns Pago creado
   */
  async createPayment(paymentData) {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  },
  /**
   * Actualiza un pago
   * @param id - ID del pago
   * @param updates - Datos a actualizar
   * @returns Pago actualizado
   */
  async updatePayment(id, updates) {
    const [payment] = await db.update(payments).set(updates).where(eq(payments.id, id)).returning();
    return payment || null;
  },
  /**
   * Operaciones de Cuotas
   */
  /**
   * Obtiene las cuotas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de cuotas del usuario
   */
  async getInstallmentsByUserId(userId) {
    return await db.select().from(installments).where(eq(installments.userId, userId)).orderBy(installments.installmentNumber);
  },
  /**
   * Obtiene una cuota específica
   * @param id - ID de la cuota
   * @returns Cuota encontrada o null
   */
  async getInstallment(id) {
    const [installment] = await db.select().from(installments).where(eq(installments.id, id));
    return installment || null;
  },
  /**
   * Crea una nueva cuota
   * @param installmentData - Datos de la cuota
   * @returns Cuota creada
   */
  async createInstallment(installmentData) {
    const [installment] = await db.insert(installments).values(installmentData).returning();
    return installment;
  },
  /**
   * Actualiza una cuota
   * @param id - ID de la cuota
   * @param updates - Datos a actualizar
   * @returns Cuota actualizada
   */
  async updateInstallment(id, updates) {
    const [installment] = await db.update(installments).set(updates).where(eq(installments.id, id)).returning();
    return installment || null;
  },
  /**
   * Obtiene las observaciones de cuotas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de observaciones de cuotas
   */
  async getInstallmentObservationsByUserId(userId) {
    return await db.select().from(installmentObservations).where(eq(installmentObservations.userId, userId)).orderBy(desc(installmentObservations.createdAt));
  },
  /**
   * Crea una nueva observación de cuota
   * @param observationData - Datos de la observación
   * @returns Observación creada
   */
  async createInstallmentObservation(observationData) {
    const [observation] = await db.insert(installmentObservations).values(observationData).returning();
    return observation;
  }
};

// server/routes/documents.ts
import { Router } from "express";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var authenticateToken = (req, res, next) => {
  console.log("=== MIDDLEWARE AUTHENTICATE TOKEN ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Headers:", req.headers);
  const authHeader = req.headers["authorization"];
  console.log("Authorization header:", authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("Token extra\xEDdo:", token ? token.substring(0, 20) + "..." : "No token");
  if (!token) {
    console.log("\u274C No se proporcion\xF3 token");
    return res.status(401).json({ error: "Token de autenticaci\xF3n no proporcionado" });
  }
  try {
    const JWT_SECRET2 = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura";
    console.log("JWT_SECRET usado:", JWT_SECRET2 ? JWT_SECRET2.substring(0, 10) + "..." : "No definido");
    const decoded = jwt.verify(token, JWT_SECRET2);
    console.log("\u2705 Token v\xE1lido, usuario decodificado:", decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log("\u274C Error al verificar token:", error);
    return res.status(401).json({ error: "Token inv\xE1lido o expirado" });
  }
};
var requireRole = (roles2) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!roles2.includes(req.user.role)) {
      return res.status(403).json({ error: "Acceso denegado: rol no autorizado" });
    }
    next();
  };
};

// server/db.ts
import pg from "pg";
import { drizzle as drizzle2 } from "drizzle-orm/node-postgres";
import { config } from "dotenv";
config();
console.log("Variables de entorno:", {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV
});
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL no est\xE1 definida en las variables de entorno");
}
var pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
});
var db2 = drizzle2(pool, { schema: schema_exports });
var db_default = db2;

// server/routes/documents.ts
import { eq as eq2, and as and2 } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

// server/utils/notifications.ts
async function createNotification(notificationData) {
  try {
    const [newNotification] = await db2.insert(notifications).values(notificationData).returning();
    return newNotification;
  } catch (error) {
    console.error("Error al crear notificaci\xF3n:", error);
    throw error;
  }
}
async function createDocumentUploadNotification(userId, documentName, documentType) {
  const notificationData = {
    userId,
    title: "Documento Subido",
    body: `Has subido exitosamente el documento "${documentName}" (${documentType}). Ser\xE1 revisado por el administrador.`,
    type: "document",
    link: "/documents"
  };
  return createNotification(notificationData);
}
async function createDocumentApprovedNotification(userId, documentName) {
  const notificationData = {
    userId,
    title: "Documento Aprobado",
    body: `Tu documento "${documentName}" ha sido aprobado por el administrador.`,
    type: "document",
    link: "/documents"
  };
  return createNotification(notificationData);
}
async function createDocumentRejectedNotification(userId, documentName, rejectionReason) {
  const notificationData = {
    userId,
    title: "Documento Rechazado",
    body: `Tu documento "${documentName}" ha sido rechazado. Motivo: ${rejectionReason}`,
    type: "document",
    link: "/documents"
  };
  return createNotification(notificationData);
}
async function createRequestSubmittedNotification(userId, subject) {
  const notificationData = {
    userId,
    title: "Solicitud Enviada",
    body: `Tu solicitud "${subject}" ha sido enviada exitosamente. Recibir\xE1s una respuesta pronto.`,
    type: "request",
    link: "/requests"
  };
  return createNotification(notificationData);
}
async function createRequestResponseNotification(userId, subject, status) {
  const notificationData = {
    userId,
    title: "Respuesta a Solicitud",
    body: `Tu solicitud "${subject}" ha sido ${status}. Revisa los detalles en la secci\xF3n de solicitudes.`,
    type: "request",
    link: "/requests"
  };
  return createNotification(notificationData);
}
async function createEnrollmentStageNotification(userId, newStage, comments) {
  const stageNames = {
    "suscrito": "Suscrito",
    "documentos_completos": "Documentos Completos",
    "registro_validado": "Registro Validado",
    "proceso_universitario": "Proceso Universitario",
    "matriculado": "Matriculado",
    "inicio_clases": "Inicio de Clases",
    "estudiante_activo": "Estudiante Activo",
    "pagos_al_dia": "Pagos al D\xEDa",
    "proceso_finalizado": "Proceso Finalizado"
  };
  const stageName = stageNames[newStage] || newStage;
  const commentsText = comments ? `

Comentarios del administrador: ${comments}` : "";
  const notificationData = {
    userId,
    title: "Progreso en Matr\xEDcula",
    body: `Has avanzado a la etapa "${stageName}". \xA1Felicidades por tu progreso!${commentsText}`,
    type: "stage",
    link: "/"
  };
  return createNotification(notificationData);
}
async function createAdminDocumentUploadNotification(adminUserIds, studentName, documentName) {
  const notifications2 = adminUserIds.map((adminId) => ({
    userId: adminId,
    title: "Nuevo Documento Pendiente",
    body: `El estudiante ${studentName} ha subido el documento "${documentName}" y requiere revisi\xF3n.`,
    type: "document",
    link: "/admin/students"
  }));
  return Promise.all(notifications2.map(createNotification));
}
async function createAdminRequestNotification(adminUserIds, studentName, subject) {
  const notifications2 = adminUserIds.map((adminId) => ({
    userId: adminId,
    title: "Nueva Solicitud de Estudiante",
    body: `El estudiante ${studentName} ha enviado una solicitud: "${subject}".`,
    type: "request",
    link: "/admin/requests"
  }));
  return Promise.all(notifications2.map(createNotification));
}

// server/routes/documents.ts
import { fileURLToPath } from "url";
var router = Router();
var upload = multer({
  dest: "uploads/documentos/",
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024
    // 10MB máximo
  }
});
router.get("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const documents2 = await storage.getDocuments(req.user.id);
    res.json(documents2);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});
router.post("/", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    console.log("[DEBUG] Subida de documento iniciada:", {
      userId: req.user.id,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body
    });
    const { type, observations } = req.body;
    const file = req.file;
    if (!file) {
      console.log("[DEBUG] No se recibi\xF3 archivo en la petici\xF3n de documento");
      return res.status(400).json({ error: "Archivo no proporcionado" });
    }
    const createdDocument = await storage.createDocument({
      name: file.originalname,
      type,
      path: file.filename,
      // o file.path según tu lógica
      userId: req.user.id,
      status: "pendiente",
      observations: observations || null
    });
    await createDocumentUploadNotification(
      req.user.id,
      file.originalname,
      type
    );
    const adminUsers = await db2.select({ id: users.id }).from(users).where(and2(
      eq2(users.role, "admin"),
      eq2(users.isActive, true)
    ));
    const adminUserIds = adminUsers.map((admin) => admin.id);
    if (adminUserIds.length > 0) {
      await createAdminDocumentUploadNotification(
        adminUserIds,
        req.user.username || "Estudiante",
        file.originalname
      );
    }
    res.status(201).json(createdDocument);
  } catch (error) {
    console.error("Error al crear documento:", error);
    res.status(500).json({ error: "Error al crear documento" });
  }
});
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: "ID de documento inv\xE1lido" });
    }
    const deleted = await storage.deleteDocument(documentId, req.user.id);
    if (!deleted) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    res.json({ message: "Documento eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar documento:", error);
    res.status(500).json({ error: "Error al eliminar documento" });
  }
});
router.get("/:id/url", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send({ error: "Invalid document ID" });
    }
    const doc = await storage.getDocument(id);
    if (doc === null) {
      return res.status(404).send({ error: "Document not found" });
    }
    if (req.user.role !== "admin" && req.user.role !== "superuser" && doc.userId !== req.user.id) {
      return res.status(403).send({ error: "No tienes permisos para acceder a este documento" });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/api/documents/${id}/file`;
    res.send({ url });
  } catch (error) {
    console.error("Error al obtener URL del documento:", error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});
router.get("/:id/file", authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log(`[DEBUG] Solicitud de documento ID:`, documentId);
    if (isNaN(documentId)) {
      console.log(`[DEBUG] ID de documento inv\xE1lido:`, documentId);
      return res.status(400).json({ error: "ID de documento inv\xE1lido" });
    }
    const document = await storage.getDocument(documentId);
    if (!document) {
      console.log(`[DEBUG] Documento NO encontrado con ID:`, documentId);
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    console.log(`[DEBUG] Documento encontrado:`, document);
    if (userRole === "admin" || userRole === "superuser") {
    } else {
      if (document.userId !== userId) {
        console.log(`[DEBUG] Usuario ${userId} no tiene permisos para documento ${documentId}`);
        return res.status(403).json({ error: "No tienes permisos para ver este documento" });
      }
    }
    const filePath = path.join(__dirname, "../../uploads/documentos", document.path);
    console.log(`[DEBUG] Ruta absoluta buscada:`, filePath);
    if (!fs.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo NO encontrado en:`, filePath);
      return res.status(404).json({ error: "Archivo no encontrado" });
    } else {
      console.log(`[DEBUG] Archivo encontrado en:`, filePath);
    }
    const stats = fs.statSync(filePath);
    const ext = path.extname(document.name).toLowerCase();
    let contentType = "application/octet-stream";
    let disposition = "attachment";
    if (ext === ".pdf") {
      contentType = "application/pdf";
      disposition = "inline";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      contentType = `image/${ext.slice(1)}`;
      disposition = "inline";
    } else if (ext === ".txt") {
      contentType = "text/plain";
      disposition = "inline";
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `${disposition}; filename="${document.name}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    console.log(`Acceso a documento: ${document.name} por usuario ${userId} (${userRole})`);
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al servir documento:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router.get("/:id/download", authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;
    if (isNaN(documentId)) {
      return res.status(400).send({ error: "Invalid document ID" });
    }
    const doc = await storage.getDocument(documentId);
    if (doc === null) {
      return res.status(404).send({ error: "Document not found" });
    }
    if (userRole !== "admin" && userRole !== "superuser" && doc.userId !== userId) {
      return res.status(403).send({ error: "No tienes permisos para descargar este documento" });
    }
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const url = `${baseUrl}/api/documents/${documentId}/file`;
    res.send({ url });
  } catch (error) {
    console.error("Error al obtener URL de descarga:", error);
    res.status(500).send({ error: "Error interno del servidor" });
  }
});
router.put("/:id/status", authenticateToken, requireRole(["admin", "superuser"]), async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: "ID de documento inv\xE1lido" });
    }
    const result = updateDocumentStatusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Datos inv\xE1lidos",
        details: result.error.issues
      });
    }
    const { status, rejectionReason } = result.data;
    const [existingDocument] = await db2.select().from(documents).where(eq2(documents.id, documentId));
    if (!existingDocument) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    const [updatedDocument] = await db2.update(documents).set({
      status,
      rejectionReason,
      reviewedBy: req.user?.id,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq2(documents.id, documentId)).returning();
    if (status === "aprobado") {
      await createDocumentApprovedNotification(
        existingDocument.userId,
        existingDocument.name
      );
    } else if (status === "rechazado" && rejectionReason) {
      await createDocumentRejectedNotification(
        existingDocument.userId,
        existingDocument.name,
        rejectionReason
      );
    }
    console.log(`Estado de documento ${documentId} actualizado a: ${status}`);
    res.json({
      message: "Estado de documento actualizado exitosamente",
      document: updatedDocument
    });
  } catch (error) {
    console.error("Error al actualizar estado de documento:", error);
    res.status(500).json({ error: "Error al actualizar el estado del documento" });
  }
});
router.get("/:id/iframe", async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const token = req.query.token;
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }
    let user;
    try {
      const jwt3 = await import("jsonwebtoken");
      const decoded = jwt3.default.verify(token, process.env.JWT_SECRET || "tu_clave_secreta_muy_segura");
      user = decoded;
    } catch (error) {
      return res.status(401).json({ error: "Token inv\xE1lido" });
    }
    if (isNaN(documentId)) {
      return res.status(400).json({ error: "ID de documento inv\xE1lido" });
    }
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }
    if (user.role === "admin" || user.role === "superuser") {
    } else {
      if (document.userId !== user.id) {
        return res.status(403).json({ error: "No tienes permisos para ver este documento" });
      }
    }
    const __filename2 = fileURLToPath(import.meta.url);
    const __dirname4 = path.dirname(__filename2);
    const filePath = path.join(__dirname4, "../../uploads/documentos", document.path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Archivo no encontrado" });
    }
    const stats = fs.statSync(filePath);
    const ext = path.extname(document.name).toLowerCase();
    let contentType = "application/octet-stream";
    let disposition = "inline";
    if (ext === ".pdf") {
      contentType = "application/pdf";
      disposition = "inline";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      contentType = `image/${ext.slice(1)}`;
      disposition = "inline";
    } else if (ext === ".txt") {
      contentType = "text/plain";
      disposition = "inline";
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `${disposition}; filename="${document.name}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al servir documento en iframe:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
var documents_default = router;

// server/routes/requests.ts
import { Router as Router2 } from "express";
import { z as z2 } from "zod";
import { eq as eq3, and as and3 } from "drizzle-orm";
var router2 = Router2();
var responseSchema = z2.object({
  response: z2.string().min(1, "La respuesta es requerida"),
  status: z2.enum(["en_proceso", "completada", "rechazada"])
});
router2.get("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const user = req.user;
    let userRequests;
    if (user.role === "admin") {
      userRequests = await storage.getAllRequests();
    } else {
      userRequests = await storage.getRequestsByUserId(user.id);
    }
    res.json(userRequests);
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    res.status(500).json({ error: "Error al obtener las solicitudes" });
  }
});
router2.post("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const request = await storage.createRequest({
      ...req.body,
      userId: req.user.id,
      status: "pendiente"
    });
    await createRequestSubmittedNotification(
      req.user.id,
      req.body.subject
    );
    const adminUsers = await db2.select({ id: users.id }).from(users).where(and3(
      eq3(users.role, "admin"),
      eq3(users.isActive, true)
    ));
    const adminUserIds = adminUsers.map((admin) => admin.id);
    if (adminUserIds.length > 0) {
      await createAdminRequestNotification(
        adminUserIds,
        req.user.username || "Estudiante",
        req.body.subject
      );
    }
    res.status(201).json(request);
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
});
router2.put("/:id/respond", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "No autorizado" });
    }
    const { id } = req.params;
    const result = responseSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Datos inv\xE1lidos",
        details: result.error.issues
      });
    }
    const { response, status } = result.data;
    const [existingRequest] = await db2.select().from(requests).where(eq3(requests.id, parseInt(id)));
    if (!existingRequest) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    const updatedRequest = await storage.updateRequest(parseInt(id), {
      response,
      status,
      respondedAt: /* @__PURE__ */ new Date(),
      respondedBy: req.user.id
    });
    if (!updatedRequest) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    await createRequestResponseNotification(
      existingRequest.userId,
      existingRequest.subject,
      status
    );
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error al responder solicitud:", error);
    res.status(500).json({ error: "Error al responder la solicitud" });
  }
});
router2.get("/active-count", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const count2 = await storage.getActiveRequestsCount(req.user.id);
    res.json({ count: count2 });
  } catch (error) {
    console.error("Error al obtener conteo de solicitudes:", error);
    res.status(500).json({ error: "Error al obtener el conteo de solicitudes" });
  }
});
var requests_default = router2;

// server/utils.ts
import bcrypt from "bcrypt";
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  } catch (error) {
    console.error("Error al hashear contrase\xF1a:", error);
    throw new Error("Error al procesar la contrase\xF1a");
  }
}

// server/routes.ts
dotenv.config();
async function registerRoutes(app2) {
  app2.use("/api/documents", documents_default);
  app2.use("/api/requests", requests_default);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/admin/users", async (req, res) => {
    try {
      if (!req.user || req.user?.role !== "admin" && req.user?.role !== "superuser") {
        return res.status(403).json({
          error: "No autorizado",
          details: "Se requieren permisos de administrador o superusuario"
        });
      }
      const { username, password, role } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({
          error: "Faltan campos requeridos",
          details: "Se requieren username, password y role"
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        return res.status(400).json({
          error: "Formato de email inv\xE1lido",
          details: "El username debe ser un email v\xE1lido"
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          error: "Contrase\xF1a d\xE9bil",
          details: "La contrase\xF1a debe tener al menos 8 caracteres"
        });
      }
      if (!["estudiante", "admin", "superuser"].includes(role)) {
        return res.status(400).json({
          error: "Rol inv\xE1lido",
          details: "El rol debe ser uno de: estudiante, admin, superuser"
        });
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        email: username,
        isActive: true,
        permissions: {}
      });
      res.status(201).json({
        message: "Usuario creado exitosamente",
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.status(500).json({ error: "Error al crear usuario" });
    }
  });
  app2.post("/api/admin/create-example-users", async (req, res) => {
    try {
      const exampleUsers = [
        { username: "estudiante1", password: "password123", role: "estudiante" },
        { username: "admin1", password: "password123", role: "admin" },
        { username: "superuser1", password: "password123", role: "superuser" }
      ];
      const createdUsers = await Promise.all(
        exampleUsers.map(async (user) => {
          const hashedPassword = await hashPassword(user.password);
          return await storage.createUser({
            ...user,
            password: hashedPassword,
            email: user.username,
            isActive: true,
            permissions: {}
          });
        })
      );
      res.json({ message: "Usuarios de ejemplo creados exitosamente", users: createdUsers });
    } catch (error) {
      console.error("Error al crear usuarios de ejemplo:", error);
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin" && req.user?.role !== "superuser") {
        return res.status(403).json({ error: "Not authorized" });
      }
      const usersWithProfiles = await storage.getAllUsersWithProfiles();
      const result = usersWithProfiles.map((user) => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        fullName: user.profile?.fullName || null,
        email: user.profile?.email || null,
        documentType: user.profile?.documentType || null,
        documentNumber: user.profile?.documentNumber || null
      }));
      res.json(result);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  root: "client",
  resolve: {
    alias: {
      "@": path2.resolve(__dirname2, "client", "src"),
      "@shared": path2.resolve(__dirname2, "shared")
    }
  },
  build: {
    outDir: path2.resolve(__dirname2, "dist/client"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    }
  },
  server: {
    port: 3e3,
    host: true,
    proxy: {
      "/api": "http://localhost:3000"
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: {
      ...serverOptions,
      allowedHosts: true
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/routes/universities.ts
import { Router as Router3 } from "express";
import { eq as eq4 } from "drizzle-orm";
var router3 = Router3();
router3.get("/", async (req, res) => {
  try {
    const allUniversities = await db2.select().from(universities);
    res.json(allUniversities);
  } catch (error) {
    console.error("Error al obtener universidades:", error);
    res.status(500).json({ error: "Error al obtener las universidades" });
  }
});
router3.get("/:universityId/programs", async (req, res) => {
  try {
    const { universityId } = req.params;
    const universityPrograms = await db2.select().from(programs).where(eq4(programs.universityId, parseInt(universityId)));
    res.json(universityPrograms);
  } catch (error) {
    console.error("Error al obtener programas:", error);
    res.status(500).json({ error: "Error al obtener los programas" });
  }
});
var universities_default = router3;

// server/routes/university-data.ts
import { Router as Router4 } from "express";
import { eq as eq5 } from "drizzle-orm";
var router4 = Router4();
router4.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await db2.select().from(universityData).where(eq5(universityData.userId, parseInt(userId))).limit(1);
    res.json(data[0] || null);
  } catch (error) {
    console.error("Error al obtener datos universitarios:", error);
    res.status(500).json({ error: "Error al obtener los datos universitarios" });
  }
});
router4.post("/", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const existingData = await db2.select().from(universityData).where(eq5(universityData.userId, userId)).limit(1);
    let result;
    if (existingData.length > 0) {
      result = await db2.update(universityData).set(data).where(eq5(universityData.userId, userId)).returning();
    } else {
      result = await db2.insert(universityData).values({
        userId,
        ...data
      }).returning();
    }
    res.json(result[0]);
  } catch (error) {
    console.error("Error al guardar datos universitarios:", error);
    res.status(500).json({ error: "Error al guardar los datos universitarios" });
  }
});
var university_data_default = router4;

// server/routes/payments.ts
import { Router as Router5 } from "express";
import multer2 from "multer";
import path4 from "path";
import fs3 from "fs";
import { fileURLToPath as fileURLToPath3 } from "url";
var __filename = fileURLToPath3(import.meta.url);
var __dirname3 = path4.dirname(__filename);
var router5 = Router5();
var storageMulter = multer2.diskStorage({
  destination: function(req, file, cb) {
    const dir = path4.join(__dirname3, "../../uploads/soportes");
    if (!fs3.existsSync(dir)) {
      fs3.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    const ext = path4.extname(file.originalname);
    cb(null, `cuota_${req.params.id}_${Date.now()}${ext}`);
  }
});
var upload2 = multer2({ storage: storageMulter });
function requireAdminRole(req, res, next) {
  if (req.user && (req.user.role === "admin" || req.user.role === "superadmin")) {
    return next();
  }
  return res.status(403).json({ error: "Acceso denegado: solo administradores" });
}
router5.get("/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments2 = await storage.getPaymentsByUserId(userId);
    res.json(payments2);
  } catch (error) {
    console.error("Error al obtener pagos:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.get("/installments/me", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const installments2 = await storage.getInstallmentsByUserId(userId);
    res.json(installments2);
  } catch (error) {
    console.error("Error al obtener cuotas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.get("/summary", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const payments2 = await storage.getPaymentsByUserId(userId);
    const totalPaid = payments2.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const installments2 = await storage.getInstallmentsByUserId(userId);
    const totalPending = installments2.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    const paidInstallments = installments2.filter((installment) => installment.status === "pagada");
    const totalPaidInstallments = paidInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    const overdueInstallments = installments2.filter((installment) => {
      if (installment.status === "pendiente" && installment.dueDate) {
        return new Date(installment.dueDate) < /* @__PURE__ */ new Date();
      }
      return false;
    });
    const summary = {
      totalPaid,
      totalPending,
      totalPaidInstallments,
      overdueCount: overdueInstallments.length,
      totalOverdue: overdueInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0),
      paymentsCount: payments2.length,
      installmentsCount: installments2.length
    };
    res.json(summary);
  } catch (error) {
    console.error("Error al obtener resumen financiero:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.post("/installments/:id/support", authenticateToken, upload2.single("support"), async (req, res) => {
  try {
    const installmentId = Number(req.params.id);
    const userId = req.user.id;
    const observations = req.body.observations || "";
    console.log("[DEBUG] Subida de soporte iniciada:", {
      installmentId,
      userId,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body
    });
    const installment = await storage.getInstallment(installmentId);
    if (!installment) {
      console.log("[DEBUG] Cuota no encontrada:", installmentId);
      return res.status(404).json({ error: "Cuota no encontrada" });
    }
    if (installment.userId !== userId) {
      console.log("[DEBUG] Usuario no autorizado:", { userId, installmentUserId: installment.userId });
      return res.status(403).json({ error: "No tienes permiso para modificar esta cuota" });
    }
    if (!req.file) {
      console.log("[DEBUG] No se recibi\xF3 archivo en la petici\xF3n");
      return res.status(400).json({ error: "No se recibi\xF3 ning\xFAn archivo" });
    }
    const soportePath = `/uploads/soportes/${req.file.filename}`;
    await storage.updateInstallment(installmentId, { support: soportePath });
    if (observations.trim()) {
      await storage.createInstallmentObservation({
        userId,
        installmentId,
        observation: observations.trim(),
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    return res.json({
      message: "Soporte subido correctamente",
      support: soportePath,
      observations: observations.trim() ? "Observaciones guardadas" : null
    });
  } catch (error) {
    console.error("Error al subir soporte de pago:", error);
    res.status(500).json({ error: "Error al subir el soporte de pago" });
  }
});
router5.get("/installments/:userId/admin", authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const installments2 = await storage.getInstallmentsByUserId(userId);
    const observations = await storage.getInstallmentObservationsByUserId(userId);
    const obsByInstallment = {};
    observations.forEach((obs) => {
      if (!obsByInstallment[obs.installmentId]) obsByInstallment[obs.installmentId] = [];
      obsByInstallment[obs.installmentId].push({
        id: obs.id,
        observation: obs.observation,
        createdAt: obs.createdAt
      });
    });
    const result = installments2.map((inst) => ({
      ...inst,
      observations: obsByInstallment[inst.id] || []
    }));
    res.json(result);
  } catch (error) {
    console.error("Error al consultar cuotas y observaciones:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.get("/support/:filename", async (req, res) => {
  try {
    let user;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const jwt3 = await import("jsonwebtoken");
        const decoded = jwt3.default.verify(token, process.env.JWT_SECRET || "tu_clave_secreta_muy_segura");
        user = decoded;
      } catch (error) {
        console.log("[DEBUG] Token del header inv\xE1lido:", error);
      }
    }
    if (!user) {
      const token = req.query.token;
      if (token) {
        try {
          const jwt3 = await import("jsonwebtoken");
          const decoded = jwt3.default.verify(token, process.env.JWT_SECRET || "tu_clave_secreta_muy_segura");
          user = decoded;
        } catch (error) {
          console.log("[DEBUG] Token del query inv\xE1lido:", error);
        }
      }
    }
    if (!user) {
      console.log("[DEBUG] No se proporcion\xF3 token v\xE1lido");
      return res.status(401).json({ error: "Token de autenticaci\xF3n requerido" });
    }
    req.user = user;
    const filename = req.params.filename;
    const userId = req.user.id;
    const userRole = req.user.role;
    console.log(`[DEBUG] Solicitud de archivo:`, filename);
    if (!filename || filename.includes("..") || filename.includes("/")) {
      console.log(`[DEBUG] Nombre de archivo inv\xE1lido:`, filename);
      return res.status(400).json({ error: "Nombre de archivo inv\xE1lido" });
    }
    const filePath = path4.join(__dirname3, "../../uploads/soportes", filename);
    console.log(`[DEBUG] Ruta absoluta buscada:`, filePath);
    if (!fs3.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo NO encontrado en:`, filePath);
      return res.status(404).json({ error: "Archivo no encontrado" });
    } else {
      console.log(`[DEBUG] Archivo encontrado en:`, filePath);
    }
    if (userRole === "admin" || userRole === "superadmin") {
    } else {
      const installments2 = await storage.getInstallmentsByUserId(userId);
      const installmentWithFile = installments2.find(
        (inst) => inst.support && inst.support.includes(filename)
      );
      if (!installmentWithFile) {
        return res.status(403).json({ error: "No tienes permisos para ver este archivo" });
      }
    }
    const stats = fs3.statSync(filePath);
    const ext = path4.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    let disposition = "inline";
    if (ext === ".pdf") {
      contentType = "application/pdf";
      disposition = "inline";
    } else if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
      contentType = `image/${ext.slice(1)}`;
      disposition = "inline";
    } else if (ext === ".txt") {
      contentType = "text/plain";
      disposition = "inline";
    }
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `${disposition}; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    console.log(`Acceso a archivo: ${filename} por usuario ${userId} (${userRole})`);
    const fileStream = fs3.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al servir archivo de soporte:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.get("/support-iframe/:filename", async (req, res) => {
  try {
    const filename = req.params.filename;
    const token = req.query.token;
    console.log(`[DEBUG] Support-iframe request:`, {
      filename,
      hasToken: !!token,
      tokenLength: token?.length
    });
    if (!token) {
      console.log(`[DEBUG] No token provided`);
      return res.status(401).json({ error: "Token requerido" });
    }
    let user;
    try {
      const jwt3 = await import("jsonwebtoken");
      const decoded = jwt3.default.verify(token, process.env.JWT_SECRET || "tu_clave_secreta_muy_segura");
      user = decoded;
      console.log(`[DEBUG] Token v\xE1lido para usuario:`, user);
    } catch (error) {
      console.log(`[DEBUG] Token inv\xE1lido:`, error);
      return res.status(401).json({ error: "Token inv\xE1lido" });
    }
    if (!filename || filename.includes("..") || filename.includes("/")) {
      console.log(`[DEBUG] Nombre de archivo inv\xE1lido:`, filename);
      return res.status(400).json({ error: "Nombre de archivo inv\xE1lido" });
    }
    const filePath = path4.join(__dirname3, "../../uploads/soportes", filename);
    console.log(`[DEBUG] Ruta del archivo:`, filePath);
    if (!fs3.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo no encontrado:`, filePath);
      return res.status(404).json({ error: "Archivo no encontrado" });
    }
    console.log(`[DEBUG] Archivo encontrado, enviando...`);
    const stats = fs3.statSync(filePath);
    const ext = path4.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".pdf") {
      contentType = "application/pdf";
    } else if ([".jpg", ".jpeg"].includes(ext)) {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    } else if (ext === ".txt") {
      contentType = "text/plain";
    }
    console.log(`[DEBUG] Enviando archivo:`, {
      contentType,
      fileSize: stats.size,
      filename
    });
    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", stats.size);
    res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
    res.setHeader("Cache-Control", "private, max-age=3600");
    const fileStream = fs3.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error al servir archivo de soporte en iframe:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
var payments_default = router5;

// server/routes/auth.ts
import { Router as Router6 } from "express";

// server/auth.ts
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
import { z as z3 } from "zod";
var JWT_SECRET = process.env.JWT_SECRET || "tu_clave_secreta_muy_segura";
var JWT_EXPIRES_IN = "24h";
var generateToken = (user) => {
  return jwt2.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
var hashPassword2 = async (password) => {
  const salt = await bcrypt2.genSalt(10);
  return bcrypt2.hash(password, salt);
};
var comparePasswords = async (password, hash) => {
  return bcrypt2.compare(password, hash);
};
var registerSchema = z3.object({
  username: z3.string().min(3).max(50),
  email: z3.string().email(),
  password: z3.string().min(6),
  role: z3.enum(["estudiante", "admin", "superuser"]).optional()
});
var loginSchema2 = z3.object({
  username: z3.string(),
  password: z3.string()
});
function setupAuth(app2) {
  app2.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema2.parse(req.body);
      console.log("=== INICIO DE PROCESO DE AUTENTICACI\xD3N ===");
      console.log("Intento de inicio de sesi\xF3n para usuario:", username);
      const user = await storage.getUserByUsername(username);
      if (!user) {
        console.log("Usuario no encontrado:", username);
        return res.status(401).json({ error: "Usuario no encontrado" });
      }
      const passwordMatch = await comparePasswords(password, user.password);
      if (!passwordMatch) {
        console.log("Contrase\xF1a incorrecta para usuario:", username);
        return res.status(401).json({ error: "Contrase\xF1a incorrecta" });
      }
      console.log("Inicio de sesi\xF3n exitoso para usuario:", username);
      const token = generateToken(user);
      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        token
      });
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Datos de inicio de sesi\xF3n inv\xE1lidos", details: error.errors });
      }
      console.error("Error en inicio de sesi\xF3n:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  });
  app2.post("/api/register", async (req, res) => {
    try {
      const { username, email, password, role } = registerSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya est\xE1 en uso" });
      }
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "El email ya est\xE1 en uso" });
      }
      const hashedPassword = await hashPassword2(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: role || "estudiante",
        isActive: true,
        permissions: {}
      });
      const token = generateToken(user);
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z3.ZodError) {
        return res.status(400).json({ error: "Datos de registro inv\xE1lidos", details: error.errors });
      }
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    res.json({ message: "Sesi\xF3n cerrada exitosamente" });
  });
  app2.get("/api/me", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      const decoded = jwt2.verify(token, JWT_SECRET);
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("Error al obtener informaci\xF3n del usuario:", error);
      res.status(401).json({ error: "Token inv\xE1lido" });
    }
  });
  app2.post("/api/change-password", async (req, res) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      const decoded = jwt2.verify(token, JWT_SECRET);
      const { currentPassword, newPassword } = req.body;
      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const isValidPassword = await comparePasswords(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Contrase\xF1a actual incorrecta" });
      }
      const hashedPassword = await hashPassword2(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });
      res.json({ message: "Contrase\xF1a actualizada exitosamente" });
    } catch (error) {
      console.error("Error al cambiar contrase\xF1a:", error);
      res.status(500).json({ error: "Error al cambiar contrase\xF1a" });
    }
  });
  app2.get("/api/user", async (req, res) => {
    try {
      console.log("Headers recibidos:", req.headers);
      const authHeader = req.headers.authorization;
      console.log("Authorization header:", authHeader);
      const token = authHeader?.split(" ")[1];
      console.log("Token extra\xEDdo:", token ? token.substring(0, 20) + "..." : "No token");
      if (!token) {
        console.log("No se proporcion\xF3 token");
        return res.status(401).json({ error: "Token no proporcionado" });
      }
      const decoded = jwt2.verify(token, JWT_SECRET);
      console.log("Token decodificado:", decoded);
      const user = await storage.getUser(decoded.id);
      console.log("Usuario encontrado:", user ? { id: user.id, username: user.username, role: user.role } : "No encontrado");
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      const response = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      console.log("Enviando respuesta:", response);
      res.json(response);
    } catch (error) {
      console.error("Error al obtener informaci\xF3n del usuario:", error);
      res.status(401).json({ error: "Token inv\xE1lido" });
    }
  });
}

// server/routes/auth.ts
import { z as z4 } from "zod";
var router6 = Router6();
var loginSchema3 = z4.object({
  username: z4.string().min(1, "El nombre de usuario es requerido"),
  password: z4.string().min(1, "La contrase\xF1a es requerida")
});
var registerSchema2 = z4.object({
  username: z4.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z4.string().email("Email inv\xE1lido"),
  password: z4.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
  role: z4.enum(["estudiante", "admin", "superuser"]).optional()
});
router6.post("/login", async (req, res) => {
  try {
    const { username, password } = loginSchema3.parse(req.body);
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Contrase\xF1a incorrecta" });
    }
    const token = generateToken(user);
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router6.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = registerSchema2.parse(req.body);
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "El nombre de usuario ya est\xE1 en uso" });
    }
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "El email ya est\xE1 en uso" });
    }
    const hashedPassword = await hashPassword2(password);
    const user = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      role: role || "estudiante",
      isActive: true,
      permissions: {}
    });
    const token = generateToken(user);
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    if (error instanceof z4.ZodError) {
      return res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router6.post("/logout", (_req, res) => {
  res.json({ message: "Sesi\xF3n cerrada exitosamente" });
});
router6.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    const decoded = __require("jsonwebtoken").verify(token, process.env.JWT_SECRET || "tu_clave_secreta_muy_segura");
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: "Token inv\xE1lido" });
  }
});
var auth_default = router6;

// server/routes/profiles.ts
import { Router as Router7 } from "express";
import { eq as eq6, sql as sql2 } from "drizzle-orm";
import { desc as desc2 } from "drizzle-orm";
var router7 = Router7();
router7.get("/", authenticateToken, async (req, res) => {
  try {
    const allProfiles = await db_default.select().from(profiles);
    const documentCounts = await db_default.select({
      userId: documents.userId,
      count: sql2`count(*)::int`
    }).from(documents).groupBy(documents.userId);
    const requestCounts = await db_default.select({
      userId: requests.userId,
      count: sql2`count(*)::int`
    }).from(requests).where(sql2`status IN ('pendiente', 'en_proceso')`).groupBy(requests.userId);
    const profilesWithCounts = allProfiles.map((profile) => {
      const docCount = documentCounts.find((d) => d.userId === profile.id)?.count || 0;
      const reqCount = requestCounts.find((r) => r.userId === profile.id)?.count || 0;
      return {
        ...profile,
        documentCount: docCount,
        pendingRequestCount: reqCount
      };
    });
    res.json(profilesWithCounts);
  } catch (error) {
    console.error("Error al obtener perfiles:", error);
    res.status(500).json({ error: "Error al obtener perfiles" });
  }
});
router7.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de perfil inv\xE1lido" });
    }
    const [profile] = await db_default.select().from(profiles).where(eq6(profiles.id, id));
    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    const [{ count: documentCount }] = await db_default.select({
      count: sql2`count(*)::int`
    }).from(documents).where(eq6(documents.userId, id));
    const [{ count: pendingRequestCount }] = await db_default.select({
      count: sql2`count(*)::int`
    }).from(requests).where(sql2`${requests.userId} = ${id} AND status IN ('pendiente', 'en_proceso')`);
    res.json({
      ...profile,
      documentCount,
      pendingRequestCount
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
});
router7.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de perfil inv\xE1lido" });
    }
    const updates = req.body;
    const [existingProfile] = await db_default.select().from(profiles).where(eq6(profiles.id, id));
    if (!existingProfile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    const [updatedProfile] = await db_default.update(profiles).set(updates).where(eq6(profiles.id, id)).returning();
    res.json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});
router7.put("/:userId/stage", authenticateToken, requireRole(["admin", "superuser"]), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inv\xE1lido" });
    }
    const result = updateEnrollmentStageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Datos inv\xE1lidos",
        details: result.error.issues
      });
    }
    const { enrollmentStage, comments, validationNotes } = result.data;
    const [existingProfile] = await db_default.select().from(profiles).where(eq6(profiles.userId, userId));
    if (!existingProfile) {
      return res.status(404).json({ error: "Perfil de estudiante no encontrado" });
    }
    const [documentsCount] = await db_default.select({ count: sql2`count(*)::int` }).from(documents).where(eq6(documents.userId, userId));
    const [pendingRequestsCount] = await db_default.select({ count: sql2`count(*)::int` }).from(requests).where(sql2`${requests.userId} = ${userId} AND status IN ('pendiente', 'en_proceso')`);
    const validationData = {
      currentStage: existingProfile.enrollmentStage,
      newStage: enrollmentStage,
      userId,
      documentsCount: documentsCount.count,
      pendingRequestsCount: pendingRequestsCount.count
    };
    const validationResult = validateStageChangeSchema.safeParse(validationData);
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Cambio de etapa no v\xE1lido",
        details: validationResult.error.issues,
        validationData
      });
    }
    await db_default.insert(enrollmentStageHistory).values({
      userId,
      previousStage: existingProfile.enrollmentStage,
      newStage: enrollmentStage,
      changedBy: req.user.id,
      comments: comments || null,
      validationStatus: "approved",
      validationNotes: validationNotes || null
    });
    const [updatedProfile] = await db_default.update(profiles).set({ enrollmentStage }).where(eq6(profiles.userId, userId)).returning();
    await createEnrollmentStageNotification(userId, enrollmentStage, comments);
    console.log(`Etapa de matr\xEDcula actualizada para usuario ${userId}: ${existingProfile.enrollmentStage} -> ${enrollmentStage}`);
    res.json({
      message: "Etapa de matr\xEDcula actualizada exitosamente",
      profile: updatedProfile,
      validationData
    });
  } catch (error) {
    console.error("Error al actualizar etapa de matr\xEDcula:", error);
    res.status(500).json({ error: "Error al actualizar la etapa de matr\xEDcula" });
  }
});
router7.get("/:userId/stage-history", authenticateToken, requireRole(["admin", "superuser"]), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inv\xE1lido" });
    }
    const history = await db_default.select({
      id: enrollmentStageHistory.id,
      previousStage: enrollmentStageHistory.previousStage,
      newStage: enrollmentStageHistory.newStage,
      comments: enrollmentStageHistory.comments,
      validationStatus: enrollmentStageHistory.validationStatus,
      validationNotes: enrollmentStageHistory.validationNotes,
      createdAt: enrollmentStageHistory.createdAt,
      changedBy: users.username,
      changedByRole: users.role
    }).from(enrollmentStageHistory).leftJoin(users, eq6(enrollmentStageHistory.changedBy, users.id)).where(eq6(enrollmentStageHistory.userId, userId)).orderBy(desc2(enrollmentStageHistory.createdAt));
    res.json(history);
  } catch (error) {
    console.error("Error al obtener historial de etapas:", error);
    res.status(500).json({ error: "Error al obtener el historial de etapas" });
  }
});
var profiles_default = router7;

// server/index.ts
var app = express2();
var allowedOrigins = process.env.NODE_ENV === "production" ? [process.env.FRONTEND_URL || "https://tu-dominio.com"] : ["http://localhost:3000"];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: true }));
setupAuth(app);
app.use("/api/auth", auth_default);
app.use("/api/requests", requests_default);
app.use("/api/universities", universities_default);
app.use("/api/university-data", university_data_default);
app.use("/api/profiles", profiles_default);
app.use("/api/payments", payments_default);
app.use("/api/documents", (req, res, next) => {
  if (req.headers["content-type"]?.includes("multipart/form-data")) {
    return next();
  }
  next();
}, documents_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3e3;
  server.listen({
    port,
    host: "localhost"
  }, () => {
    log(`serving on port ${port}`);
  });
})();
