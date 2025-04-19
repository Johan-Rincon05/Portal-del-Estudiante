import { pgTable, text, uuid, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User-related types for Supabase Auth
export const userRoles = ["estudiante", "admin", "superuser"] as const;
export type UserRole = typeof userRoles[number];

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

// Profile table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  full_name: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  document_type: text("document_type").notNull(),
  document_number: text("document_number").notNull(),
  birth_date: timestamp("birth_date").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  created_at: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  type: text("type").notNull(),
  path: text("path").notNull(),
  uploaded_at: timestamp("uploaded_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  uploaded_at: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Requests table
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"),
  response: text("response"),
  created_at: timestamp("created_at").defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  status: true,
  response: true,
  created_at: true,
});

export const updateRequestSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
  response: z.string().optional(),
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type UpdateRequest = z.infer<typeof updateRequestSchema>;
export type Request = typeof requests.$inferSelect;

// Registration form schema
export const registerSchema = insertProfileSchema.extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  passwordConfirm: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "Las contraseñas no coinciden",
  path: ["passwordConfirm"],
});

export type RegisterData = z.infer<typeof registerSchema>;

// Login form schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Document types
export const documentTypes = [
  { value: "cedula", label: "Cédula" },
  { value: "diploma", label: "Diploma" },
  { value: "acta", label: "Acta" },
  { value: "foto", label: "Foto" },
  { value: "recibo", label: "Recibo" },
  { value: "formulario", label: "Formulario" },
];

// Create admin user schema
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  role: z.enum(userRoles),
});

export type CreateUserData = z.infer<typeof createUserSchema>;

// Update user role schema
export const updateUserRoleSchema = z.object({
  id: z.string(),
  role: z.enum(userRoles),
});

export type UpdateUserRoleData = z.infer<typeof updateUserRoleSchema>;
