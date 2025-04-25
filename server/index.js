// server/index.ts
import "dotenv/config";
import express2 from "express";
import cors from "cors";

// server/routes.ts
import { createServer } from "http";
import dotenv from "dotenv";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import bcrypt from "bcrypt";
import { scrypt } from "crypto";
import { promisify } from "util";

// shared/schema.ts
import { pgTable, text, timestamp, varchar, integer, serial, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("estudiante"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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

// server/storage.ts
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { eq, and, or } from "drizzle-orm";

// server/db.ts
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
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
var db = drizzle(pool);
var db_default = db;

// server/storage.ts
var MemoryStore = createMemoryStore(session);
var PgSessionStore = connectPgSimple(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PgSessionStore({
      createTableIfMissing: true
    });
  }
  // User methods
  async getUser(id) {
    const [user] = await db_default.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db_default.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db_default.insert(users).values({
      ...insertUser,
      role: insertUser.role || "estudiante"
    }).returning();
    return user;
  }
  // Request methods
  async getAllRequests() {
    return await db_default.select().from(requests).orderBy(requests.createdAt);
  }
  async getRequestsByUserId(userId) {
    return await db_default.select().from(requests).where(eq(requests.userId, userId));
  }
  async createRequest(insertRequest) {
    const [request] = await db_default.insert(requests).values(insertRequest).returning();
    return request;
  }
  async updateRequest(id, updateData) {
    const [request] = await db_default.update(requests).set(updateData).where(eq(requests.id, id)).returning();
    return request;
  }
  async getActiveRequestsCount(userId) {
    const activeRequests = await db_default.select().from(requests).where(
      and(
        eq(requests.userId, userId),
        or(
          eq(requests.status, "pendiente"),
          eq(requests.status, "en_proceso")
        )
      )
    );
    return activeRequests.length;
  }
  async getAllStudentsWithDocuments() {
    const studentsWithDocs = await db_default.select({
      id: users.id,
      username: users.username,
      role: users.role,
      fullName: profiles.fullName,
      documentNumber: profiles.documentNumber,
      document: documents
    }).from(users).leftJoin(profiles, eq(users.id, profiles.userId)).leftJoin(documents, eq(users.id, documents.userId)).where(eq(users.role, "student"));
    const studentsMap = /* @__PURE__ */ new Map();
    for (const row of studentsWithDocs) {
      const { document: doc, ...student } = row;
      if (!studentsMap.has(student.id)) {
        studentsMap.set(student.id, {
          ...student,
          documents: doc ? [doc] : []
        });
      } else if (doc) {
        studentsMap.get(student.id).documents.push(doc);
      }
    }
    return Array.from(studentsMap.values());
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
async function comparePasswords(supplied, stored) {
  try {
    if (stored.includes(".")) {
      const [hash, salt] = stored.split(".");
      const buf = await scryptAsync(supplied, salt, 64);
      return buf.toString("hex") === hash;
    }
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    console.error("Error al comparar contrase\xF1as:", error);
    return false;
  }
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.JWT_SECRET || "tu_clave_secreta_jwt",
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: "sessionId",
    cookie: {
      maxAge: 24 * 60 * 60 * 1e3,
      // 24 horas
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/"
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log("Intento de inicio de sesi\xF3n para usuario:", username);
        const user = await storage.getUserByUsername(username);
        if (!user) {
          console.log("Usuario no encontrado:", username);
          return done(null, false, { message: "Usuario no encontrado" });
        }
        const passwordMatch = await comparePasswords(password, user.password);
        console.log("Resultado de comparaci\xF3n de contrase\xF1a:", passwordMatch);
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
    console.log("Serializando usuario:", user.id);
    done(null, user.id);
  });
  passport.deserializeUser(async (id, done) => {
    try {
      console.log("Deserializando usuario:", id);
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      console.error("Error al deserializar usuario:", error);
      done(error);
    }
  });
  app2.post("/api/login", (req, res, next) => {
    console.log("Intento de inicio de sesi\xF3n:", req.body);
    if (!req.body || !req.body.username || !req.body.password) {
      return res.status(400).json({
        error: "Se requieren usuario y contrase\xF1a"
      });
    }
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        console.error("Error de autenticaci\xF3n:", err);
        return res.status(500).json({
          error: "Error interno del servidor"
        });
      }
      if (!user) {
        console.log("Autenticaci\xF3n fallida:", info?.message);
        return res.status(401).json({
          error: info?.message || "Credenciales inv\xE1lidas"
        });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error al iniciar sesi\xF3n:", loginErr);
          return res.status(500).json({
            error: "Error al iniciar sesi\xF3n"
          });
        }
        console.log("Inicio de sesi\xF3n exitoso para usuario:", user.username);
        res.json({
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    })(req, res, next);
  });
  app2.post("/api/register", async (req, res) => {
    try {
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({
          error: "Se requieren usuario y contrase\xF1a"
        });
      }
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({
          error: "El nombre de usuario ya existe"
        });
      }
      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });
      req.login(user, (err) => {
        if (err) {
          console.error("Error al iniciar sesi\xF3n despu\xE9s del registro:", err);
          return res.status(500).json({
            error: "Error al iniciar sesi\xF3n"
          });
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({
        error: "Error al registrar el usuario"
      });
    }
  });
  app2.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Error al cerrar sesi\xF3n:", err);
        return res.status(500).json({
          error: "Error al cerrar sesi\xF3n"
        });
      }
      res.json({ message: "Sesi\xF3n cerrada exitosamente" });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        error: "No autenticado"
      });
    }
    res.json(req.user);
  });
}

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
    const { rows } = await pool.query(
      "SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener documentos:", error);
    res.status(500).json({ error: "Error al obtener documentos" });
  }
});
router.post("/", authenticateToken, async (req, res) => {
  try {
    const document = documentSchema.parse(req.body);
    const { rows } = await pool.query(
      "INSERT INTO documents (user_id, name, type, size, url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.id, document.name, document.type, document.size, document.url]
    );
    res.status(201).json(rows[0]);
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
    const { rows } = await pool.query(
      "DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *",
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) {
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
  const doc = await pool.query(
    "SELECT * FROM documents WHERE id = $1",
    [id]
  );
  if (doc.rows.length === 0) {
    return res.status(404).send({ error: "Document not found" });
  }
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.rows[0].url
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.send({ url });
});
router.get("/:id/download", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).send({ error: "Invalid document ID" });
  }
  const doc = await pool.query(
    "SELECT * FROM documents WHERE id = $1",
    [id]
  );
  if (doc.rows.length === 0) {
    return res.status(404).send({ error: "Document not found" });
  }
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.rows[0].url
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
    const count = await storage.getActiveRequestsCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error("Error al obtener conteo de solicitudes:", error);
    res.status(500).json({ error: "Error al obtener el conteo de solicitudes" });
  }
});
var requests_default = router2;

// server/routes.ts
dotenv.config();
async function registerRoutes(app2) {
  setupAuth(app2);
  app2.use("/api/documents", documents_default);
  app2.use("/api/requests", requests_default);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/admin/users", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user?.role !== "admin" && req.user?.role !== "superuser") {
        return res.status(403).json({ error: "Not authorized" });
      }
      const { username, password, role } = req.body;
      if (!username || !password || !role) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const user = await storage.createUser({
        username,
        password,
        role
      });
      res.json({
        message: "User created successfully",
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error("Admin user creation error:", error);
      res.status(500).json({ error: error.message });
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
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  base: "/Portal-del-Estudiante/",
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "client/index.html")
      },
      output: {
        manualChunks: void 0
      }
    }
  },
  publicDir: path.resolve(__dirname, "client", "public")
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
    server: serverOptions,
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
import { eq as eq2 } from "drizzle-orm";
var router3 = Router3();
router3.get("/", async (req, res) => {
  try {
    const allUniversities = await db.select().from(universities);
    res.json(allUniversities);
  } catch (error) {
    console.error("Error al obtener universidades:", error);
    res.status(500).json({ error: "Error al obtener las universidades" });
  }
});
router3.get("/:universityId/programs", async (req, res) => {
  try {
    const { universityId } = req.params;
    const universityPrograms = await db.select().from(programs).where(eq2(programs.universityId, parseInt(universityId)));
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
    const data = await db.select().from(universityData).where(eq3(universityData.userId, parseInt(userId))).limit(1);
    res.json(data[0] || null);
  } catch (error) {
    console.error("Error al obtener datos universitarios:", error);
    res.status(500).json({ error: "Error al obtener los datos universitarios" });
  }
});
router4.post("/", async (req, res) => {
  try {
    const { userId, ...data } = req.body;
    const existingData = await db.select().from(universityData).where(eq3(universityData.userId, userId)).limit(1);
    let result;
    if (existingData.length > 0) {
      result = await db.update(universityData).set(data).where(eq3(universityData.userId, userId)).returning();
    } else {
      result = await db.insert(universityData).values({
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

// server/index.ts
var app = express2();
app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.CLIENT_URL : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
}));
app.use(express2.json());
app.use(express2.urlencoded({ extended: true }));
setupAuth(app);
app.use("/api/requests", requests_default);
app.use("/api/documents", documents_default);
app.use("/api/universities", universities_default);
app.use("/api/university-data", university_data_default);
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
