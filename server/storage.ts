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
  programs,
  payments,
  installments,
  installmentObservations,
  allies,
  type Ally,
  type InsertAlly,
  enrollmentStageHistory
} from "../shared/schema.js";
import { eq, and, or, sql, desc, count, inArray } from "drizzle-orm";
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
 * Instancia de almacenamiento que maneja todas las operaciones de base de datos
 */
export const storage = {
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
    console.log('🔄 Iniciando eliminación de usuario:', id);
    
    try {
      // Eliminar en orden para respetar las restricciones de clave foránea
      
      // 1. Eliminar observaciones de cuotas
      console.log('🗑️ Eliminando observaciones de cuotas...');
      await db.delete(installmentObservations).where(eq(installmentObservations.userId, id));
      
      // 2. Eliminar cuotas
      console.log('🗑️ Eliminando cuotas...');
      await db.delete(installments).where(eq(installments.userId, id));
      
      // 3. Eliminar pagos
      console.log('🗑️ Eliminando pagos...');
      await db.delete(payments).where(eq(payments.userId, id));
      
      // 4. Eliminar datos universitarios
      console.log('🗑️ Eliminando datos universitarios...');
      await db.delete(universityData).where(eq(universityData.userId, id));
      
      // 5. Eliminar documentos
      console.log('🗑️ Eliminando documentos...');
      await db.delete(documents).where(eq(documents.userId, id));
      
      // 6. Eliminar solicitudes
      console.log('🗑️ Eliminando solicitudes...');
      await db.delete(requests).where(eq(requests.userId, id));
      
      // 7. Eliminar historial de etapas de matrícula
      console.log('🗑️ Eliminando historial de etapas...');
      await db.delete(enrollmentStageHistory).where(eq(enrollmentStageHistory.userId, id));
      
      // 8. Eliminar perfil
      console.log('🗑️ Eliminando perfil...');
      await db.delete(profiles).where(eq(profiles.userId, id));
      
      // 9. Finalmente eliminar el usuario
      console.log('🗑️ Eliminando usuario...');
      const result = await db.delete(users).where(eq(users.id, id));
      
      console.log('✅ Usuario y todos sus datos eliminados exitosamente');
      return result.length > 0;
      
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      throw error;
    }
  },

  /**
   * Lista usuarios con filtros opcionales
   * @param filters - Filtros para la búsqueda
   * @returns Lista de usuarios
   */
  async listUsers(filters?: { role?: string; isActive?: boolean; allyId?: number; universityId?: number }): Promise<User[]> {
    let query = db.select().from(users);
    
    if (filters) {
      const conditions = [];
      if (filters.role) conditions.push(eq(users.role, filters.role));
      if (filters.isActive !== undefined) conditions.push(eq(users.isActive, filters.isActive));
      if (filters.allyId) conditions.push(eq(users.allyId, filters.allyId));
      if (filters.universityId) conditions.push(eq(users.universityId, filters.universityId));
      
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
  async getUserPermissions(userId: number): Promise<Record<string, boolean>> {
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
  async updateUserPermissions(userId: number, permissions: Record<string, boolean>): Promise<User> {
    const [user] = await db.update(users)
      .set({ permissions, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  },

  /**
   * Inicializa los roles por defecto
   */
  async initializeDefaultRoles(): Promise<void> {
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
   * Operaciones de Validación de Documentos
   */

  /**
   * Obtiene documentos pendientes de validación
   * @returns Lista de documentos pendientes con información del estudiante
   */
  async getPendingDocumentsForValidation(): Promise<any[]> {
    const result = await db
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        status: documents.status,
        userId: documents.userId,
        createdAt: documents.createdAt,
        observations: documents.observations,
        rejectionReason: documents.rejectionReason,
        studentName: profiles.fullName,
        studentEmail: profiles.email
      })
      .from(documents)
      .leftJoin(profiles, eq(documents.userId, profiles.userId))
      .where(eq(documents.status, 'pendiente'))
      .orderBy(desc(documents.createdAt));

    return result;
  },

  /**
   * Obtiene historial de validaciones de documentos por estudiante
   * @param studentId - ID del estudiante
   * @returns Historial de validaciones
   */
  async getDocumentValidationHistory(studentId: number): Promise<any[]> {
    const result = await db
      .select({
        id: documents.id,
        name: documents.name,
        type: documents.type,
        status: documents.status,
        createdAt: documents.createdAt,
        reviewedAt: documents.reviewedAt,
        observations: documents.observations,
        rejectionReason: documents.rejectionReason,
        reviewedBy: documents.reviewedBy
      })
      .from(documents)
      .where(eq(documents.userId, studentId))
      .orderBy(desc(documents.reviewedAt || documents.createdAt));

    return result;
  },

  /**
   * Operaciones de Validación de Pagos
   */

  /**
   * Obtiene pagos pendientes de validación
   * @returns Lista de pagos pendientes con información del estudiante
   */
  async getPendingPaymentsForValidation(): Promise<any[]> {
    const result = await db
      .select({
        id: installments.id,
        installmentNumber: installments.installmentNumber,
        amount: installments.amount,
        status: installments.status,
        userId: installments.userId,
        dueDate: installments.dueDate,
        support: installments.support,
        createdAt: installments.createdAt,
        studentName: profiles.fullName,
        studentEmail: profiles.email
      })
      .from(installments)
      .leftJoin(profiles, eq(installments.userId, profiles.userId))
      .where(eq(installments.status, 'pendiente'))
      .orderBy(desc(installments.createdAt));

    return result;
  },

  /**
   * Valida o rechaza un pago
   * @param paymentId - ID del pago
   * @param status - Nuevo estado
   * @param rejectionReason - Motivo de rechazo (opcional)
   * @returns Pago actualizado
   */
  async validatePayment(paymentId: number, status: string, rejectionReason?: string): Promise<any> {
    const [updatedPayment] = await db
      .update(installments)
      .set({ 
        status,
        updatedAt: new Date(),
        ...(rejectionReason && { observations: rejectionReason })
      })
      .where(eq(installments.id, paymentId))
      .returning();

    return updatedPayment;
  },

  /**
   * Operaciones de Reportes
   */

  /**
   * Obtiene datos para reportes
   * @param filters - Filtros opcionales
   * @returns Datos de reporte
   */
  async getReportData(filters?: { dateFrom?: string; dateTo?: string; career?: string }): Promise<any> {
    // Obtener estadísticas básicas
    const totalStudents = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.role, 'estudiante'));
    const activeStudents = await db.select({ count: sql`count(*)` }).from(users).where(and(eq(users.role, 'estudiante'), eq(users.isActive, true)));
    
    // Obtener estadísticas de documentos
    const documentStats = await db.select({
      pending: sql`count(*) filter (where status = 'pendiente')`,
      validated: sql`count(*) filter (where status = 'aprobado')`,
      rejected: sql`count(*) filter (where status = 'rechazado')`
    }).from(documents);

    // Obtener estadísticas de pagos
    const paymentStats = await db.select({
      pending: sql`count(*) filter (where status = 'pendiente')`,
      validated: sql`count(*) filter (where status = 'pagada')`
    }).from(installments);

    // Obtener estadísticas de solicitudes
    const requestStats = await db.select({
      pending: sql`count(*) filter (where status = 'pendiente')`,
      completed: sql`count(*) filter (where status = 'completada')`
    }).from(requests);

    // Obtener distribución por etapas de matrícula
    const enrollmentStages = await db.select({
      stage: profiles.enrollmentStage,
      count: sql`count(*)`
    }).from(profiles).groupBy(profiles.enrollmentStage);

    return {
      totalStudents: totalStudents[0]?.count || 0,
      activeStudents: activeStudents[0]?.count || 0,
      documents: documentStats[0] || { pending: 0, validated: 0, rejected: 0 },
      payments: paymentStats[0] || { pending: 0, validated: 0 },
      requests: requestStats[0] || { pending: 0, completed: 0 },
      enrollmentStages: enrollmentStages.reduce((acc, stage) => {
        acc[stage.stage] = stage.count;
        return acc;
      }, {} as Record<string, number>)
    };
  },

  /**
   * Operaciones de Solicitudes
   */

  /**
   * Obtiene todas las solicitudes con información del usuario
   * @returns Lista de solicitudes con información del usuario
   */
  async getAllRequests(): Promise<any[]> {
    const result = await db
      .select({
        id: requests.id,
        userId: requests.userId,
        requestType: requests.requestType,
        subject: requests.subject,
        message: requests.message,
        status: requests.status,
        response: requests.response,
        createdAt: requests.createdAt,
        updatedAt: requests.updatedAt,
        respondedAt: requests.respondedAt,
        respondedBy: requests.respondedBy,
        user: {
          id: users.id,
          username: users.username,
          email: users.email
        }
      })
      .from(requests)
      .leftJoin(users, eq(requests.userId, users.id))
      .orderBy(desc(requests.createdAt));
    
    return result.map(row => ({
      ...row,
      userName: row.user?.username || 'Usuario',
      userEmail: row.user?.email || 'usuario@ejemplo.com',
      user: undefined // Remover el objeto user anidado
    }));
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
      .where(eq(requests.userId, userId))
      .orderBy(desc(requests.createdAt));
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
   * Obtiene todos los documentos del sistema
   * @returns Lista de todos los documentos
   */
  async getAllDocuments(): Promise<any[]> {
    return await db.select().from(documents);
  },

  /**
   * Obtiene documentos con información de estudiantes
   * @param allyId - ID del aliado para filtrar (opcional)
   * @returns Lista de documentos con información de estudiantes
   */
  async getDocumentsWithStudents(allyId?: number): Promise<any[]> {
    try {
      // Consulta base para documentos
      let documentsQuery = db.select().from(documents);
      
      // Si se proporciona allyId, filtrar documentos por aliado
      if (allyId) {
        // Primero obtener los IDs de usuarios que pertenecen al aliado
        const allyUsers = await db
          .select({ id: users.id })
          .from(users)
          .where(and(eq(users.role, 'estudiante'), eq(users.allyId, allyId)));
        
        const allyUserIds = allyUsers.map(user => user.id);
        
        if (allyUserIds.length === 0) {
          return []; // No hay usuarios para este aliado
        }
        
        // Filtrar documentos por los IDs de usuarios del aliado
        documentsQuery = documentsQuery.where(inArray(documents.userId, allyUserIds));
      }
      
      const result = await documentsQuery.orderBy(desc(documents.uploadedAt));
      
      // Obtener información de perfiles por separado
      const documentsWithProfiles = await Promise.all(
        result.map(async (doc) => {
          const profile = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, doc.userId))
            .limit(1);
          
          return {
            ...doc,
            student: profile[0] ? {
              id: profile[0].id,
              fullName: profile[0].fullName,
              documentNumber: profile[0].documentNumber,
              city: profile[0].city,
              enrollmentStage: profile[0].enrollmentStage
            } : null
          };
        })
      );
      
      return documentsWithProfiles;
    } catch (error) {
      console.error('Error en getDocumentsWithStudents:', error);
      return [];
    }
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
   * Actualiza un documento existente
   * @param id - ID del documento
   * @param updates - Datos a actualizar
   * @returns Documento actualizado
   */
  async updateDocument(id: number, updates: any): Promise<any | null> {
    const [document] = await db
      .update(documents)
      .set(updates)
      .where(eq(documents.id, id))
      .returning();
    return document || null;
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
  async getAllUsersWithProfiles(filters?: { role?: string; isActive?: boolean; allyId?: number; universityId?: number }) {
    console.log('=== getAllUsersWithProfiles ===');
    console.log('Filtros recibidos:', filters);
    
    let query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        allyId: users.allyId,
        universityId: users.universityId,
        profile: {
          id: profiles.id,
          userId: profiles.userId,
          fullName: profiles.fullName,
          documentType: profiles.documentType,
          documentNumber: profiles.documentNumber,
          birthDate: profiles.birthDate,
          birthPlace: profiles.birthPlace,
          personalEmail: profiles.personalEmail,
          icfesAc: profiles.icfesAc,
          phone: profiles.phone,
          city: profiles.city,
          address: profiles.address,
          neighborhood: profiles.neighborhood,
          locality: profiles.locality,
          socialStratum: profiles.socialStratum,
          bloodType: profiles.bloodType,
          conflictVictim: profiles.conflictVictim,
          maritalStatus: profiles.maritalStatus,
          enrollmentStage: profiles.enrollmentStage,
          createdAt: profiles.createdAt
        }
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .orderBy(desc(users.createdAt));

    // Aplicar filtros si se proporcionan
    if (filters) {
      const conditions = [];
      if (filters.role) conditions.push(eq(users.role, filters.role));
      if (filters.isActive !== undefined) conditions.push(eq(users.isActive, filters.isActive));
      if (filters.allyId) conditions.push(eq(users.allyId, filters.allyId));
      if (filters.universityId) conditions.push(eq(users.universityId, filters.universityId));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
        console.log('Filtros aplicados:', conditions.length);
      }
    }
    
    const result = await query;
    
    console.log(`Usuarios obtenidos: ${result.length}`);
    console.log('=== FIN getAllUsersWithProfiles ===');
    
    return result.map(row => ({
      ...row,
      profile: row.profile || null,
      // Aplanar los datos del perfil para facilitar el acceso
      fullName: row.profile?.fullName || null,
      personalEmail: row.profile?.personalEmail || null,
      documentType: row.profile?.documentType || null,
      documentNumber: row.profile?.documentNumber || null,
      birthDate: row.profile?.birthDate || null,
      birthPlace: row.profile?.birthPlace || null,
      phone: row.profile?.phone || null,
      address: row.profile?.address || null,
      city: row.profile?.city || null,
      neighborhood: row.profile?.neighborhood || null,
      locality: row.profile?.locality || null,
      socialStratum: row.profile?.socialStratum || null,
      bloodType: row.profile?.bloodType || null,
      conflictVictim: row.profile?.conflictVictim || null,
      maritalStatus: row.profile?.maritalStatus || null,
      enrollmentStage: row.profile?.enrollmentStage || null
    }));
  },

  /**
   * Obtiene la lista de todos los estudiantes con documentos
   * @param allyId - ID del aliado para filtrar (opcional)
   * @returns Lista de estudiantes con documentos
   */
  async getAllStudentsWithDocuments(allyId?: number) {
    let query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        allyId: users.allyId,
        profile: {
          id: profiles.id,
          userId: profiles.userId,
          fullName: profiles.fullName,
          documentType: profiles.documentType,
          documentNumber: profiles.documentNumber,
          birthDate: profiles.birthDate,
          birthPlace: profiles.birthPlace,
          personalEmail: profiles.personalEmail,
          icfesAc: profiles.icfesAc,
          phone: profiles.phone,
          city: profiles.city,
          address: profiles.address,
          neighborhood: profiles.neighborhood,
          locality: profiles.locality,
          socialStratum: profiles.socialStratum,
          bloodType: profiles.bloodType,
          conflictVictim: profiles.conflictVictim,
          maritalStatus: profiles.maritalStatus,
          enrollmentStage: profiles.enrollmentStage,
          createdAt: profiles.createdAt
        },
        documentsCount: count(documents.id)
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(documents, eq(users.id, documents.userId))
      .where(eq(users.role, 'estudiante'))
      .groupBy(users.id, profiles.id)
      .orderBy(desc(users.createdAt));

    // Aplicar filtro por aliado si se proporciona
    if (allyId) {
      query = query.where(and(eq(users.role, 'estudiante'), eq(users.allyId, allyId)));
    }
    
    const result = await query;
    
    return result.map(row => ({
      ...row,
      profile: row.profile || null,
      documentsCount: Number(row.documentsCount)
    }));
  },

  /**
   * Obtiene la lista de todos los estudiantes con documentos filtrados por universidad
   * @param universityId - ID de la universidad para filtrar
   * @returns Lista de estudiantes con documentos de la universidad específica
   */
  async getAllStudentsWithDocumentsByUniversity(universityId: number) {
    let query = db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        allyId: users.allyId,
        universityId: users.universityId,
        profile: {
          id: profiles.id,
          userId: profiles.userId,
          fullName: profiles.fullName,
          documentType: profiles.documentType,
          documentNumber: profiles.documentNumber,
          birthDate: profiles.birthDate,
          birthPlace: profiles.birthPlace,
          personalEmail: profiles.personalEmail,
          icfesAc: profiles.icfesAc,
          phone: profiles.phone,
          city: profiles.city,
          address: profiles.address,
          neighborhood: profiles.neighborhood,
          locality: profiles.locality,
          socialStratum: profiles.socialStratum,
          bloodType: profiles.bloodType,
          conflictVictim: profiles.conflictVictim,
          maritalStatus: profiles.maritalStatus,
          enrollmentStage: profiles.enrollmentStage,
          createdAt: profiles.createdAt
        },
        documentsCount: count(documents.id)
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.userId))
      .leftJoin(documents, eq(users.id, documents.userId))
      .where(and(eq(users.role, 'estudiante'), eq(users.universityId, universityId)))
      .groupBy(users.id, profiles.id)
      .orderBy(desc(users.createdAt));
    
    const result = await query;
    
    return result.map(row => ({
      ...row,
      profile: row.profile || null,
      documentsCount: Number(row.documentsCount)
    }));
  },

  /**
   * Obtiene documentos con información de estudiantes filtrados por universidad
   * @param universityId - ID de la universidad para filtrar
   * @returns Lista de documentos con información de estudiantes de la universidad específica
   */
  async getDocumentsWithStudentsByUniversity(universityId: number): Promise<any[]> {
    try {
      // Primero obtener los IDs de usuarios que pertenecen a la universidad
      const universityUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.role, 'estudiante'), eq(users.universityId, universityId)));
      
      const universityUserIds = universityUsers.map(user => user.id);
      
      if (universityUserIds.length === 0) {
        return []; // No hay usuarios para esta universidad
      }
      
      // Filtrar documentos por los IDs de usuarios de la universidad
      const result = await db
        .select()
        .from(documents)
        .where(inArray(documents.userId, universityUserIds))
        .orderBy(desc(documents.uploadedAt));
      
      // Obtener información de perfiles por separado
      const documentsWithProfiles = await Promise.all(
        result.map(async (doc) => {
          const profile = await db
            .select()
            .from(profiles)
            .where(eq(profiles.userId, doc.userId))
            .limit(1);
          
          return {
            ...doc,
            student: profile[0] ? {
              id: profile[0].id,
              fullName: profile[0].fullName,
              documentNumber: profile[0].documentNumber,
              city: profile[0].city,
              enrollmentStage: profile[0].enrollmentStage
            } : null
          };
        })
      );
      
      return documentsWithProfiles;
    } catch (error) {
      console.error('Error en getDocumentsWithStudentsByUniversity:', error);
      return [];
    }
  },

  /**
   * Operaciones de Pagos
   */

  /**
   * Obtiene los pagos de un usuario específico
   * @param userId - ID del usuario
   * @returns Lista de pagos del usuario
   */
  async getPaymentsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  },

  /**
   * Obtiene todos los pagos del sistema
   * @returns Lista de todos los pagos
   */
  async getAllPayments(): Promise<any[]> {
    return await db.select().from(payments);
  },

  /**
   * Obtiene un pago específico
   * @param id - ID del pago
   * @returns Pago encontrado o null
   */
  async getPayment(id: number): Promise<any | null> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment || null;
  },

  /**
   * Crea un nuevo pago
   * @param paymentData - Datos del pago
   * @returns Pago creado
   */
  async createPayment(paymentData: any): Promise<any> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  },

  /**
   * Actualiza un pago
   * @param id - ID del pago
   * @param updates - Datos a actualizar
   * @returns Pago actualizado
   */
  async updatePayment(id: number, updates: any): Promise<any | null> {
    const [payment] = await db.update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
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
  async getInstallmentsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(installments).where(eq(installments.userId, userId)).orderBy(installments.installmentNumber);
  },

  /**
   * Obtiene una cuota específica
   * @param id - ID de la cuota
   * @returns Cuota encontrada o null
   */
  async getInstallment(id: number): Promise<any | null> {
    const [installment] = await db.select().from(installments).where(eq(installments.id, id));
    return installment || null;
  },

  /**
   * Crea una nueva cuota
   * @param installmentData - Datos de la cuota
   * @returns Cuota creada
   */
  async createInstallment(installmentData: any): Promise<any> {
    const [installment] = await db.insert(installments).values(installmentData).returning();
    return installment;
  },

  /**
   * Actualiza una cuota
   * @param id - ID de la cuota
   * @param updates - Datos a actualizar
   * @returns Cuota actualizada
   */
  async updateInstallment(id: number, updates: any): Promise<any | null> {
    const [installment] = await db.update(installments)
      .set(updates)
      .where(eq(installments.id, id))
      .returning();
    return installment || null;
  },

  /**
   * Obtiene las observaciones de cuotas de un usuario
   * @param userId - ID del usuario
   * @returns Lista de observaciones de cuotas
   */
  async getInstallmentObservationsByUserId(userId: number): Promise<any[]> {
    return await db.select().from(installmentObservations).where(eq(installmentObservations.userId, userId)).orderBy(desc(installmentObservations.createdAt));
  },

  /**
   * Crea una nueva observación de cuota
   * @param observationData - Datos de la observación
   * @returns Observación creada
   */
  async createInstallmentObservation(observationData: any): Promise<any> {
    const [observation] = await db.insert(installmentObservations).values(observationData).returning();
    return observation;
  },

  /**
   * Operaciones de Aliados
   */

  /**
   * Obtiene la lista de aliados
   * @returns Lista de aliados
   */
  async getAllAllies(): Promise<Ally[]> {
    return await db.select().from(allies);
  },

  /**
   * Obtiene un aliado por su ID
   * @param id - ID del aliado
   * @returns Aliado encontrado o null
   */
  async getAlly(id: number): Promise<Ally | null> {
    const [ally] = await db.select().from(allies).where(eq(allies.id, id));
    return ally || null;
  },

  /**
   * Crea un nuevo aliado
   * @param allyData - Datos del aliado
   * @returns Aliado creado
   */
  async createAlly(allyData: InsertAlly): Promise<Ally> {
    const [ally] = await db.insert(allies).values(allyData).returning();
    return ally;
  },

  /**
   * Actualiza un aliado
   * @param id - ID del aliado
   * @param updates - Datos a actualizar
   * @returns Aliado actualizado
   */
  async updateAlly(id: number, updates: Partial<Ally>): Promise<Ally | null> {
    const [ally] = await db.update(allies)
      .set(updates)
      .where(eq(allies.id, id))
      .returning();
    return ally || null;
  },

  /**
   * Elimina un aliado
   * @param id - ID del aliado
   */
  async deleteAlly(id: number): Promise<void> {
    await db.delete(allies).where(eq(allies.id, id));
  }
};
