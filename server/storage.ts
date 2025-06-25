/**
 * Sistema de almacenamiento de datos
 * Este archivo maneja todas las operaciones de base de datos y almacenamiento
 * para el Portal del Estudiante.
 */

import { 
  users,
  profiles, 
  documents,
  requests,
  type User,
  type InsertUser,
  type Request,
  type InsertRequest,
  type UpdateRequest,
  roles,
  type Role,
  type NewRole,
  type NewUser,
  DEFAULT_ROLES,
  universityData,
  universities,
  programs
} from "@shared/schema";
import session from "express-session";
import createMemoryStoreLib from "memorystore";
import connectPgSimple from "connect-pg-simple";
import { eq, and, or, sql, desc, count } from "drizzle-orm";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hashPassword, comparePasswords } from './auth';
import type { Profile } from '../shared/schema';

/**
 * Configuración de la conexión a la base de datos
 */
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);
const db = drizzle(client);

/**
 * Configuración del almacenamiento de sesiones
 */
const PgSessionStore = connectPgSimple(session);

/**
 * Instancia de almacenamiento que maneja todas las operaciones de base de datos
 */
export const storage = {
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
  async createUser(userData: NewUser): Promise<User> {
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
  async getUser(id: number): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  },

  /**
   * Obtiene un usuario por su nombre de usuario
   * @param username - Nombre de usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  },

  /**
   * Obtiene un usuario por su email
   * @param email - Email del usuario
   * @returns Usuario encontrado o undefined
   */
  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  },

  /**
   * Actualiza los datos de un usuario
   * @param id - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Usuario actualizado
   */
  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    const [user] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  },

  /**
   * Elimina un usuario
   * @param id - ID del usuario
   */
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.length > 0;
  },

  /**
   * Lista usuarios con filtros opcionales
   * @param filters - Filtros para la búsqueda
   * @returns Lista de usuarios
   */
  async listUsers(filters?: { role?: string; isActive?: boolean }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters) {
      const conditions = [];
      if (filters.role) conditions.push(eq(users.role, filters.role));
      if (filters.isActive !== undefined) conditions.push(eq(users.isActive, filters.isActive));
      
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
  async createRole(roleData: NewRole): Promise<Role> {
    const [role] = await db.insert(roles).values(roleData).returning();
    return role;
  },

  /**
   * Obtiene un rol por su nombre
   * @param name - Nombre del rol
   * @returns Rol encontrado o undefined
   */
  async getRole(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  },

  /**
   * Actualiza los datos de un rol
   * @param name - Nombre del rol
   * @param roleData - Datos a actualizar
   * @returns Rol actualizado
   */
  async updateRole(name: string, roleData: Partial<Role>): Promise<Role> {
    const [role] = await db
      .update(roles)
      .set({ ...roleData, updatedAt: new Date() })
      .where(eq(roles.name, name))
      .returning();
    return role;
  },

  /**
   * Elimina un rol
   * @param name - Nombre del rol
   */
  async deleteRole(name: string): Promise<void> {
    await db.delete(roles).where(eq(roles.name, name));
  },

  /**
   * Lista todos los roles
   * @returns Lista de roles
   */
  async listRoles(): Promise<Role[]> {
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
  async getUserPermissions(userId: number): Promise<Record<string, boolean>> {
    const user = await this.getUser(userId);
    if (!user) return {};

    // Combinar permisos del usuario con los permisos por defecto de su rol
    return {
      ...DEFAULT_ROLES[user.role as keyof typeof DEFAULT_ROLES]?.permissions,
      ...user.permissions
    };
  },

  /**
   * Actualiza los permisos de un usuario
   * @param userId - ID del usuario
   * @param permissions - Nuevos permisos
   * @returns Usuario actualizado
   */
  async updateUserPermissions(userId: number, permissions: Record<string, boolean>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },

  /**
   * Inicializa los roles por defecto en el sistema
   */
  async initializeDefaultRoles(): Promise<void> {
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
  async getAllRequests(): Promise<Request[]> {
    return await db.select().from(requests).orderBy(requests.createdAt);
  },

  /**
   * Obtiene las solicitudes de un usuario
   * @param userId - ID del usuario
   * @returns Lista de solicitudes del usuario
   */
  async getRequestsByUserId(userId: number): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.userId, userId));
  },

  /**
   * Crea una nueva solicitud
   * @param insertRequest - Datos de la solicitud
   * @returns Solicitud creada
   */
  async createRequest(insertRequest: InsertRequest): Promise<Request> {
    const [request] = await db
      .insert(requests)
      .values(insertRequest)
      .returning();
    return request;
  },

  /**
   * Actualiza una solicitud
   * @param id - ID de la solicitud
   * @param updateData - Datos a actualizar
   * @returns Solicitud actualizada
   */
  async updateRequest(id: number, updateData: Partial<Request>): Promise<Request | undefined> {
    const [request] = await db
      .update(requests)
      .set(updateData)
      .where(eq(requests.id, id))
      .returning();
    return request;
  },

  /**
   * Obtiene el número de solicitudes activas de un usuario
   * @param userId - ID del usuario
   * @returns Número de solicitudes activas
   */
  async getActiveRequestsCount(userId: number): Promise<number> {
    const activeRequests = await db
      .select()
      .from(requests)
      .where(
        and(
          eq(requests.userId, userId),
          or(
            eq(requests.status, 'pendiente'),
            eq(requests.status, 'en_proceso')
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
  async getProfile(userId: number): Promise<Profile | null> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile || null;
  },

  /**
   * Crea un nuevo perfil para un usuario
   * @param profileData - Datos del perfil
   * @returns Perfil creado
   */
  async createProfile(profileData: any): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(profileData).returning();
    return profile;
  },

  /**
   * Actualiza el perfil de un usuario
   * @param userId - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Perfil actualizado
   */
  async updateProfile(userId: number, updates: Partial<Profile>): Promise<Profile | null> {
    const [profile] = await db.update(profiles)
      .set(updates)
      .where(eq(profiles.userId, userId))
      .returning();
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
  async getDocuments(userId: number): Promise<any[]> {
    return await db.select().from(documents).where(eq(documents.userId, userId));
  },

  /**
   * Obtiene un documento específico
   * @param id - ID del documento
   * @returns Documento encontrado o null
   */
  async getDocument(id: number): Promise<any | null> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document || null;
  },

  /**
   * Crea un nuevo documento
   * @param documentData - Datos del documento
   * @returns Documento creado
   */
  async createDocument(documentData: any): Promise<any> {
    const [document] = await db.insert(documents).values(documentData).returning();
    return document;
  },

  /**
   * Elimina un documento
   * @param id - ID del documento
   * @param userId - ID del usuario propietario
   * @returns true si se eliminó correctamente
   */
  async deleteDocument(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(documents)
      .where(and(eq(documents.id, id), eq(documents.userId, userId)));
    return result.length > 0;
  },

  /**
   * Operaciones de Universidades
   */

  /**
   * Obtiene la lista de universidades
   * @returns Lista de universidades
   */
  async getUniversities(): Promise<any[]> {
    return await db.select().from(universities);
  },

  /**
   * Obtiene la lista de programas de una universidad
   * @param universityId - ID de la universidad
   * @returns Lista de programas
   */
  async getPrograms(universityId: number): Promise<any[]> {
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
  async getUniversityData(userId: number): Promise<any | null> {
    const [data] = await db.select().from(universityData).where(eq(universityData.userId, userId));
    return data || null;
  },

  /**
   * Crea nuevos datos universitarios para un usuario
   * @param data - Datos universitarios
   * @returns Datos universitarios creados
   */
  async createUniversityData(data: any): Promise<any> {
    const [newUniversityData] = await db.insert(universityData).values(data).returning();
    return newUniversityData;
  },

  /**
   * Actualiza los datos universitarios de un usuario
   * @param userId - ID del usuario
   * @param updates - Datos a actualizar
   * @returns Datos universitarios actualizados
   */
  async updateUniversityData(userId: number, updates: any): Promise<any | null> {
    const [data] = await db.update(universityData)
      .set(updates)
      .where(eq(universityData.userId, userId))
      .returning();
    return data || null;
  },

  /**
   * Operaciones de Usuarios
   */

  /**
   * Obtiene la lista de todos los usuarios
   * @returns Lista de usuarios
   */
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  },

  /**
   * Obtiene la lista de todos los usuarios con perfiles
   * @returns Lista de usuarios con perfiles
   */
  async getAllUsersWithProfiles() {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        profile: profiles
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));
    
    return result.map(row => ({
      ...row,
      profile: row.profile || null
    }));
  },

  /**
   * Obtiene la lista de todos los estudiantes con documentos
   * @returns Lista de estudiantes con documentos
   */
  async getAllStudentsWithDocuments() {
    const result = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        profile: profiles,
        documentsCount: count(documents.id)
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(documents, eq(users.id, documents.userId))
      .where(eq(users.role, 'estudiante'))
      .groupBy(users.id, profiles.id)
      .orderBy(desc(users.createdAt));
    
    return result.map(row => ({
      ...row,
      profile: row.profile || null,
      documentsCount: Number(row.documentsCount)
    }));
  }
};
