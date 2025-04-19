import { pgTable, text, uuid, timestamp, varchar, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table extends the built-in auth.users table in Supabase
// This is managed by Supabase Auth and referenced by other tables

// Profiles table - stores user profile information
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  documentType: text("document_type").notNull(),
  documentNumber: text("document_number").notNull(),
  birthDate: timestamp("birth_date").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Documents table - stores uploaded documents
export const documents = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  type: text("type").notNull(),  // "cedula", "diploma", "acta", "foto", "recibo", "formulario"
  path: text("path").notNull(),  // Storage path in Supabase
  uploadedAt: timestamp("uploaded_at").defaultNow()
});

// Requests table - stores student requests
export const requests = pgTable("requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => profiles.id),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pendiente"), // "pendiente", "en_proceso", "completada", "rechazada"
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow()
});

// Insert schemas
export const insertProfileSchema = createInsertSchema(profiles);
export const insertDocumentSchema = createInsertSchema(documents);
export const insertRequestSchema = createInsertSchema(requests);

// Additional validation schemas
export const registerUserSchema = z.object({
  fullName: z.string().min(3, "Nombre completo es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  documentType: z.string().min(1, "Tipo de documento es requerido"),
  documentNumber: z.string().min(5, "Número de documento es requerido"),
  birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Fecha de nacimiento inválida",
  }),
  phone: z.string().min(7, "Teléfono es requerido"),
  city: z.string().min(2, "Ciudad es requerida"),
  address: z.string().min(5, "Dirección es requerida"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(1, "Contraseña es requerida")
});

export const createUserSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(["estudiante", "admin", "superuser"])
});

// Type definitions
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Request = typeof requests.$inferSelect;
export type InsertRequest = z.infer<typeof insertRequestSchema>;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
