import { pgTable, text, timestamp, varchar, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table - for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("estudiante"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
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
  phone: varchar("phone", { length: 20 }),
  city: text("city"),
  address: text("address"),
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
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"),
  response: text("response"),
  createdAt: timestamp("created_at", { mode: 'date' }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: 'date' }),
  respondedAt: timestamp("responded_at", { mode: 'date' }),
  respondedBy: integer("responded_by")
});

// Relationships are defined through foreign keys above

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, uploadedAt: true });
export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true });

// Additional validation schemas
export const registerUserSchema = z.object({
  username: z.string().min(3, "Nombre de usuario es requerido"),
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

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
