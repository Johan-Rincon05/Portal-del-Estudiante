var __defProp = Object.defineProperty;
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
  documents: () => documents,
  insertDocumentSchema: () => insertDocumentSchema,
  insertInstallmentObservationSchema: () => insertInstallmentObservationSchema,
  insertInstallmentSchema: () => insertInstallmentSchema,
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
  payments: () => payments,
  profiles: () => profiles,
  programs: () => programs,
  registerUserSchema: () => registerUserSchema,
  requests: () => requests,
  roles: () => roles,
  universities: () => universities,
  universityData: () => universityData,
  universityDataFormSchema: () => universityDataFormSchema,
  updateRequestSchema: () => updateRequestSchema,
  users: () => users
});
import { pgTable, text, timestamp, varchar, integer, serial, boolean, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
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
  documentsStatus: text("documents_status")
});
var installments = pgTable("installments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  installmentNumber: integer("installment_number").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  support: text("support"),
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
  type: text("type").notNull(),
  // "cedula", "diploma", "acta", "foto", "recibo", "formulario"
  name: text("name").notNull(),
  // Nombre del documento
  path: text("path").notNull(),
  // Storage path
  uploadedAt: timestamp("uploaded_at").defaultNow()
});
var requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"),
  response: text("response"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }),
  respondedAt: timestamp("responded_at", { mode: "date" }),
  respondedBy: integer("responded_by")
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
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { eq, and, or, desc, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/portal_estudiante";
var client = postgres(connectionString);
var db = drizzle(client);
var PgSessionStore = connectPgSimple(session);
var storage = {
  /**
   * Almacenamiento de sesiones
   */
  sessionStore: new PgSessionStore({
    createTableIfMissing: true
  }),
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
    return db.select().from(roles);
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
    return {
      ...DEFAULT_ROLES[user.role]?.permissions,
      ...user.permissions
    };
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
   * Inicializa los roles por defecto en el sistema
   */
  async initializeDefaultRoles() {
    for (const [roleName, roleData] of Object.entries(DEFAULT_ROLES)) {
      const existingRole = await this.getRole(roleName);
      if (!existingRole) {
        await this.createRole({
          name: roleName,
          description: roleData.description,
          permissions: roleData.permissions
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
  }
};

// server/routes/documents.ts
import { Router } from "express";
import { z as z3 } from "zod";

// server/middleware/auth.ts
import jwt from "jsonwebtoken";
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Token de autenticaci\xF3n no proporcionado" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inv\xE1lido o expirado" });
  }
};

// server/schema.ts
import { z as z2 } from "zod";
var documentSchema = z2.object({
  id: z2.string().uuid().optional(),
  userId: z2.string().uuid(),
  name: z2.string().min(1, "El nombre es requerido").max(255),
  type: z2.string().min(1, "El tipo es requerido").max(50),
  size: z2.number().positive("El tama\xF1o debe ser mayor a 0"),
  url: z2.string().url("URL inv\xE1lida"),
  createdAt: z2.date().optional(),
  updatedAt: z2.date().optional()
});

// server/routes/documents.ts
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

// server/s3.ts
import { S3Client } from "@aws-sdk/client-s3";
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
  throw new Error("Las credenciales de AWS no est\xE1n definidas en las variables de entorno");
}
var s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// server/routes/documents.ts
var router = Router();
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
router.post("/", authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const document = documentSchema.parse(req.body);
    const createdDocument = await storage.createDocument({
      ...document,
      userId: req.user.id
    });
    res.status(201).json(createdDocument);
  } catch (error) {
    if (error instanceof z3.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error("Error al crear documento:", error);
      res.status(500).json({ error: "Error al crear documento" });
    }
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
router.get("/:id/url", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ error: "Invalid document ID" });
  }
  const doc = await storage.getDocument(id);
  if (doc === null) {
    return res.status(404).send({ error: "Document not found" });
  }
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.url
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.send({ url });
});
router.get("/:id/download", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ error: "Invalid document ID" });
  }
  const doc = await storage.getDocument(id);
  if (doc === null) {
    return res.status(404).send({ error: "Document not found" });
  }
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.url
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  res.send({ url });
});
var documents_default = router;

// server/routes/requests.ts
import { Router as Router2 } from "express";
import { z as z4 } from "zod";
var router2 = Router2();
var responseSchema = z4.object({
  response: z4.string().min(1, "La respuesta es requerida"),
  status: z4.enum(["en_proceso", "completada", "rechazada"])
});
router2.get("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
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
router2.post("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "No autenticado" });
    }
    const request = await storage.createRequest({
      ...req.body,
      userId: req.user.id,
      status: "pendiente"
    });
    res.status(201).json(request);
  } catch (error) {
    console.error("Error al crear solicitud:", error);
    res.status(500).json({ error: "Error al crear la solicitud" });
  }
});
router2.put("/:id/respond", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
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
    const updatedRequest = await storage.updateRequest(parseInt(id), {
      response,
      status,
      respondedAt: /* @__PURE__ */ new Date(),
      respondedBy: req.user.id
    });
    if (!updatedRequest) {
      return res.status(404).json({ error: "Solicitud no encontrada" });
    }
    res.json(updatedRequest);
  } catch (error) {
    console.error("Error al responder solicitud:", error);
    res.status(500).json({ error: "Error al responder la solicitud" });
  }
});
router2.get("/active-count", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
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
      if (!req.isAuthenticated() || req.user?.role !== "admin" && req.user?.role !== "superuser") {
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
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [react()],
  root: "client",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "dist/client"),
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
      "/api": "http://localhost:5000"
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
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/routes/universities.ts
import { Router as Router3 } from "express";

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

// server/routes/universities.ts
import { eq as eq2 } from "drizzle-orm";
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
    const universityPrograms = await db2.select().from(programs).where(eq2(programs.universityId, parseInt(universityId)));
    res.json(universityPrograms);
  } catch (error) {
    console.error("Error al obtener programas:", error);
    res.status(500).json({ error: "Error al obtener los programas" });
  }
});
var universities_default = router3;

// server/routes/university-data.ts
import { Router as Router4 } from "express";
import { eq as eq3 } from "drizzle-orm";
var router4 = Router4();
router4.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await db2.select().from(universityData).where(eq3(universityData.userId, parseInt(userId))).limit(1);
    res.json(data[0] || null);
  } catch (error) {
    console.error("Error al obtener datos universitarios:", error);
    res.status(500).json({ error: "Error al obtener los datos universitarios" });
  }
});
router4.post("/", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const existingData = await db2.select().from(universityData).where(eq3(universityData.userId, userId)).limit(1);
    let result;
    if (existingData.length > 0) {
      result = await db2.update(universityData).set(data).where(eq3(universityData.userId, userId)).returning();
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

// server/routes/auth.ts
import { Router as Router5 } from "express";
import passport2 from "passport";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
import { z as z5 } from "zod";
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
var registerSchema = z5.object({
  username: z5.string().min(3).max(50),
  email: z5.string().email(),
  password: z5.string().min(6),
  role: z5.enum(["estudiante", "admin", "superuser"]).optional()
});
var loginSchema2 = z5.object({
  username: z5.string(),
  password: z5.string()
});
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.JWT_SECRET || "tu_clave_secreta_jwt",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: "sessionId",
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 horas
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  app2.use((req, res, next) => {
    console.log("Estado de la sesi\xF3n:", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      user: req.user
    });
    next();
  });
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("=== INICIO DE PROCESO DE AUTENTICACI\xD3N ===");
        console.log("Intento de inicio de sesi\xF3n para usuario:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("Usuario no encontrado:", username);
          return done(null, false, { message: "Usuario no encontrado" });
        }
        const passwordMatch = await comparePasswords(password, user.password);
        if (!passwordMatch) {
          console.log("Contrase\xF1a incorrecta para usuario:", username);
          return done(null, false, { message: "Contrase\xF1a incorrecta" });
        }
        console.log("Inicio de sesi\xF3n exitoso para usuario:", username);
        return done(null, user);
      } catch (error) {
        console.error("Error en la estrategia de autenticaci\xF3n:", error);
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Credenciales inv\xE1lidas" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Error al iniciar sesi\xF3n" });
        }
        const token = generateToken(user);
        res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          token
          // Incluir el token en la respuesta
        });
      });
    })(req, res, next);
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
      if (error instanceof z5.ZodError) {
        return res.status(400).json({ error: "Datos de registro inv\xE1lidos", details: error.errors });
      }
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Error al cerrar sesi\xF3n" });
      }
      res.json({ message: "Sesi\xF3n cerrada exitosamente" });
    });
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
import { z as z6 } from "zod";
var router5 = Router5();
var loginSchema3 = z6.object({
  username: z6.string().min(1, "El nombre de usuario es requerido"),
  password: z6.string().min(1, "La contrase\xF1a es requerida")
});
var registerSchema2 = z6.object({
  username: z6.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
  email: z6.string().email("Email inv\xE1lido"),
  password: z6.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
  role: z6.enum(["estudiante", "admin", "superuser"]).optional()
});
router5.post("/login", (req, res, next) => {
  try {
    const { username, password } = loginSchema3.parse(req.body);
    passport2.authenticate("local", (err, user, info) => {
      if (err) {
        return res.status(500).json({ error: "Error interno del servidor" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Credenciales inv\xE1lidas" });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: "Error al iniciar sesi\xF3n" });
        }
        const token = generateToken(user);
        res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          token
        });
      });
    })(req, res, next);
  } catch (error) {
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.post("/register", async (req, res) => {
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
    if (error instanceof z6.ZodError) {
      return res.status(400).json({ error: "Datos inv\xE1lidos", details: error.errors });
    }
    res.status(500).json({ error: "Error interno del servidor" });
  }
});
router5.post("/logout", (req, res) => {
  req.logout(() => {
    res.json({ message: "Sesi\xF3n cerrada exitosamente" });
  });
});
router5.get("/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "No autenticado" });
  }
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  });
});
var auth_default = router5;

// server/routes/profiles.ts
import { Router as Router6 } from "express";
import { eq as eq4, sql as sql2 } from "drizzle-orm";
var router6 = Router6();
router6.get("/", authenticateToken, async (req, res) => {
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
router6.get("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de perfil inv\xE1lido" });
    }
    const [profile] = await db_default.select().from(profiles).where(eq4(profiles.id, id));
    if (!profile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    const [{ count: documentCount }] = await db_default.select({
      count: sql2`count(*)::int`
    }).from(documents).where(eq4(documents.userId, id));
    const [{ count: pendingRequestCount }] = await db_default.select({
      count: sql2`count(*)::int`
    }).from(requests).where(eq4(requests.userId, id)).where(sql2`status IN ('pendiente', 'en_proceso')`);
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
router6.put("/:id", authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "ID de perfil inv\xE1lido" });
    }
    const updates = req.body;
    const [existingProfile] = await db_default.select().from(profiles).where(eq4(profiles.id, id));
    if (!existingProfile) {
      return res.status(404).json({ error: "Perfil no encontrado" });
    }
    const [updatedProfile] = await db_default.update(profiles).set(updates).where(eq4(profiles.id, id)).returning();
    res.json(updatedProfile);
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});
var profiles_default = router6;

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
app.use("/api/documents", documents_default);
app.use("/api/universities", universities_default);
app.use("/api/university-data", university_data_default);
app.use("/api/profiles", profiles_default);
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
