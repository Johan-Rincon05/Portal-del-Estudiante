/**
 * Rutas de gestión de perfiles
 * Este archivo maneja todas las operaciones relacionadas con los perfiles
 * de usuario en el Portal del Estudiante.
 */

import { Router } from 'express';
import { eq, sql, and, ne } from 'drizzle-orm';
import { profiles, documents, requests, enrollmentStageHistory, users } from '../../shared/schema.js';
import { updateEnrollmentStageSchema, validateStageChangeSchema } from '../../shared/schema.js';
import { db } from '../db.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { z } from 'zod';
import { createEnrollmentStageNotification } from '../utils/notifications.js';
import { desc } from 'drizzle-orm';

const router = Router();

/**
 * Obtener todos los perfiles
 * GET /
 * @requires Autenticación
 * @returns Lista de perfiles con conteos de documentos y solicitudes pendientes
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Obtener todos los perfiles
    const allProfiles = await db.select().from(profiles);

    // Obtener conteos de documentos por usuario
    const documentCounts = await db
      .select({
        userId: documents.userId,
        count: sql`count(*)::int`
      })
      .from(documents)
      .groupBy(documents.userId);

    // Obtener conteos de solicitudes pendientes por usuario
    const requestCounts = await db
      .select({
        userId: requests.userId,
        count: sql`count(*)::int`
      })
      .from(requests)
      .where(sql`status IN ('pendiente', 'en_proceso')`)
      .groupBy(requests.userId);

    // Combinar la información
    const profilesWithCounts = allProfiles.map(profile => {
      const docCount = documentCounts.find(d => d.userId === profile.id)?.count || 0;
      const reqCount = requestCounts.find(r => r.userId === profile.id)?.count || 0;

      return {
        ...profile,
        documentCount: docCount,
        pendingRequestCount: reqCount
      };
    });

    res.json(profilesWithCounts);
  } catch (error) {
    console.error('Error al obtener perfiles:', error);
    res.status(500).json({ error: 'Error al obtener perfiles' });
  }
});

// GET /api/profiles/:id - Obtener un perfil específico por userId
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Obtener el perfil por userId
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Obtener conteo de documentos
    const [{ count: documentCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(documents)
      .where(eq(documents.userId, userId));

    // Obtener conteo de solicitudes pendientes
    const [{ count: pendingRequestCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(requests)
      .where(sql`${requests.userId} = ${userId} AND status IN ('pendiente', 'en_proceso')`);

    res.json({
      ...profile,
      documentCount,
      pendingRequestCount
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// PUT /api/profiles/:id - Actualizar un perfil por userId
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }
    
    const updates = req.body;

    console.log('=== ACTUALIZACIÓN DE PERFIL ===');
    console.log('ID de usuario:', userId);
    console.log('Datos recibidos para actualización:', updates);

    // Verificar que el usuario existe
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', user.username);

    // Función para validar duplicados de documento y nombre dentro del mismo rol
    const validateDuplicates = async (updates: any) => {
      const errors: string[] = [];
      
      // Validar duplicado de número de documento
      if (updates.documentNumber && updates.documentType) {
        console.log('🔍 Validando duplicado de documento:', updates.documentNumber, 'tipo:', updates.documentType);
        
        const existingDocument = await db
          .select({
            userId: profiles.userId,
            fullName: profiles.fullName,
            documentNumber: profiles.documentNumber,
            documentType: profiles.documentType
          })
          .from(profiles)
          .innerJoin(users, eq(profiles.userId, users.id))
          .where(
            and(
              eq(profiles.documentNumber, updates.documentNumber),
              eq(profiles.documentType, updates.documentType),
              eq(users.role, user.role),
              ne(profiles.userId, userId) // Excluir el usuario actual
            )
          )
          .limit(1);
        
        if (existingDocument.length > 0) {
          const duplicate = existingDocument[0];
          errors.push(`Ya existe un usuario con rol '${user.role}' que tiene el documento ${updates.documentType} número ${updates.documentNumber} (usuario: ${duplicate.fullName})`);
          console.log('❌ Duplicado de documento encontrado:', duplicate);
        } else {
          console.log('✅ No se encontraron duplicados de documento');
        }
      }
      
      // Validar duplicado de nombre completo
      if (updates.fullName) {
        console.log('🔍 Validando duplicado de nombre:', updates.fullName);
        
        const existingName = await db
          .select({
            userId: profiles.userId,
            fullName: profiles.fullName,
            documentNumber: profiles.documentNumber
          })
          .from(profiles)
          .innerJoin(users, eq(profiles.userId, users.id))
          .where(
            and(
              eq(profiles.fullName, updates.fullName),
              eq(users.role, user.role),
              ne(profiles.userId, userId) // Excluir el usuario actual
            )
          )
          .limit(1);
        
        if (existingName.length > 0) {
          const duplicate = existingName[0];
          errors.push(`Ya existe un usuario con rol '${user.role}' que tiene el nombre '${updates.fullName}' (documento: ${duplicate.documentNumber})`);
          console.log('❌ Duplicado de nombre encontrado:', duplicate);
        } else {
          console.log('✅ No se encontraron duplicados de nombre');
        }
      }
      
      return errors;
    };

    // Verificar que el perfil existe, si no, crearlo
    let [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (!existingProfile) {
      console.log('⚠️ Perfil no encontrado, creando uno nuevo...');
      const [newProfile] = await db
        .insert(profiles)
        .values({
          userId: userId,
          fullName: '',
          email: user.email,
          documentType: null,
          documentNumber: null,
          birthDate: null,
          birthPlace: null,
          personalEmail: null,
          icfesAc: null,
          phone: null,
          city: null,
          address: null,
          neighborhood: null,
          locality: null,
          socialStratum: null,
          bloodType: null,
          conflictVictim: false,
          maritalStatus: null,
          enrollmentStage: 'suscrito'
        })
        .returning();
      
      existingProfile = newProfile;
      console.log('✅ Perfil creado:', existingProfile);
    } else {
      console.log('✅ Perfil existente encontrado:', existingProfile);
    }

    // Limpieza y validación de datos
    const cleanUpdates: any = {};
    
    for (const [key, value] of Object.entries(updates)) {
      console.log(`Procesando campo: ${key} = ${value} (tipo: ${typeof value})`);
      
      // Saltar campos que no existen en el esquema
      if (!(key in existingProfile)) {
        console.log(`⚠️ Campo ignorado (no existe en esquema): ${key}`);
        continue;
      }

      // Manejar valores vacíos
      if (value === '' || value === null || value === undefined) {
        console.log(`⚠️ Campo vacío ignorado: ${key}`);
        continue;
      }

      // Manejar fechas
      if (key === 'birthDate' && typeof value === 'string') {
        const dateValue = new Date(value);
        if (!isNaN(dateValue.getTime())) {
          cleanUpdates[key] = dateValue;
          console.log(`✅ Fecha procesada: ${key} = ${dateValue}`);
        } else {
          console.log(`❌ Fecha inválida ignorada: ${key} = ${value}`);
        }
        continue;
      }

      // Manejar booleanos
      if (key === 'conflictVictim') {
        if (typeof value === 'string') {
          const boolValue = value.toLowerCase() === 'true' || value === '1' || value.toLowerCase() === 'si' || value.toLowerCase() === 'yes';
          cleanUpdates[key] = boolValue;
          console.log(`✅ Booleano procesado: ${key} = ${boolValue} (de: ${value})`);
        } else if (typeof value === 'boolean') {
          cleanUpdates[key] = value;
          console.log(`✅ Booleano directo: ${key} = ${value}`);
        }
        continue;
      }

      // Manejar números
      if (['socialStratum'].includes(key) && typeof value === 'string') {
        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
          cleanUpdates[key] = numValue;
          console.log(`✅ Número procesado: ${key} = ${numValue}`);
        } else {
          console.log(`❌ Número inválido ignorado: ${key} = ${value}`);
        }
        continue;
      }

      // Para el resto, mantener como string
      if (typeof value === 'string') {
        cleanUpdates[key] = value.trim();
        console.log(`✅ String procesado: ${key} = "${value.trim()}"`);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        cleanUpdates[key] = value;
        console.log(`✅ Tipo directo: ${key} = ${value} (${typeof value})`);
      } else {
        console.log(`❌ Tipo de dato no soportado ignorado: ${key} = ${value} (${typeof value})`);
      }
    }

    console.log('📋 Datos limpios para actualización:', cleanUpdates);

    // Si no hay datos válidos para actualizar, retornar el perfil actual
    if (Object.keys(cleanUpdates).length === 0) {
      console.log('⚠️ No hay datos válidos para actualizar');
      return res.json(existingProfile);
    }

    // Validar duplicados antes de actualizar
    console.log('🔍 Iniciando validación de duplicados...');
    const duplicateErrors = await validateDuplicates(cleanUpdates);
    
    if (duplicateErrors.length > 0) {
      console.log('❌ Errores de validación encontrados:', duplicateErrors);
      return res.status(400).json({ 
        error: 'Datos duplicados encontrados', 
        details: duplicateErrors 
      });
    }
    
    console.log('✅ Validación de duplicados exitosa');

    console.log('🔄 Ejecutando actualización en base de datos...');
    
    // Actualizar el perfil
    const [updatedProfile] = await db
      .update(profiles)
      .set(cleanUpdates)
      .where(eq(profiles.userId, userId))
      .returning();

    console.log('✅ Perfil actualizado exitosamente:', updatedProfile);
    console.log('=== FIN ACTUALIZACIÓN DE PERFIL ===');
    
    res.json(updatedProfile);
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
});

/**
 * Actualizar la etapa de matrícula de un estudiante
 * PUT /:userId/stage
 * @requires Autenticación y rol admin o superuser
 * @body {enrollmentStage, comments, validationNotes} - Nueva etapa, comentarios y notas de validación
 * @returns Perfil actualizado con la nueva etapa
 */
router.put('/:userId/stage', authenticateToken, requireRole(['SuperAdministrativos', 'superuser']), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Validar los datos de entrada
    const result = updateEnrollmentStageSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { enrollmentStage, comments, validationNotes } = result.data;

    // Verificar que el perfil existe
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    if (!existingProfile) {
      return res.status(404).json({ error: 'Perfil de estudiante no encontrado' });
    }

    // Obtener información adicional para validaciones
    const [documentsCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(documents)
      .where(eq(documents.userId, userId));

    const [pendingRequestsCount] = await db
      .select({ count: sql`count(*)::int` })
      .from(requests)
      .where(sql`${requests.userId} = ${userId} AND status IN ('pendiente', 'en_proceso')`);

    // Validar el cambio de etapa
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
        error: 'Cambio de etapa no válido',
        details: validationResult.error.issues,
        validationData
      });
    }

    // Guardar el historial antes del cambio
    await db.insert(enrollmentStageHistory).values({
      userId,
      previousStage: existingProfile.enrollmentStage,
      newStage: enrollmentStage,
      changedBy: req.user!.id,
      comments: comments || null,
      validationStatus: 'approved',
      validationNotes: validationNotes || null
    });

    // Actualizar la etapa de matrícula
    const [updatedProfile] = await db
      .update(profiles)
      .set({ enrollmentStage })
      .where(eq(profiles.userId, userId))
      .returning();

    // Crear notificación para el estudiante
    await createEnrollmentStageNotification(userId, enrollmentStage, comments);

    console.log(`Etapa de matrícula actualizada para usuario ${userId}: ${existingProfile.enrollmentStage} -> ${enrollmentStage}`);

    res.json({
      message: 'Etapa de matrícula actualizada exitosamente',
      profile: updatedProfile,
      validationData
    });
  } catch (error) {
    console.error('Error al actualizar etapa de matrícula:', error);
    res.status(500).json({ error: 'Error al actualizar la etapa de matrícula' });
  }
});

/**
 * Obtener el historial de cambios de etapa de un estudiante
 * GET /:userId/stage-history
 * @requires Autenticación
 * @returns Historial de cambios de etapa (estudiantes solo pueden ver su propio historial)
 */
router.get('/:userId/stage-history', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar permisos: estudiantes solo pueden ver su propio historial
    if (req.user!.role === 'estudiante' && req.user!.id !== userId) {
      return res.status(403).json({ error: 'Acceso denegado: solo puedes ver tu propio historial' });
    }

    // Obtener el historial con información del administrador que hizo el cambio
    const history = await db
      .select({
        id: enrollmentStageHistory.id,
        previousStage: enrollmentStageHistory.previousStage,
        newStage: enrollmentStageHistory.newStage,
        comments: enrollmentStageHistory.comments,
        validationStatus: enrollmentStageHistory.validationStatus,
        validationNotes: enrollmentStageHistory.validationNotes,
        createdAt: enrollmentStageHistory.createdAt,
        changedBy: users.username,
        changedByRole: users.role
      })
      .from(enrollmentStageHistory)
      .leftJoin(users, eq(enrollmentStageHistory.changedBy, users.id))
      .where(eq(enrollmentStageHistory.userId, userId))
      .orderBy(desc(enrollmentStageHistory.createdAt));

    res.json(history);
  } catch (error) {
    console.error('Error al obtener historial de etapas:', error);
    res.status(500).json({ error: 'Error al obtener el historial de etapas' });
  }
});

export default router; 