/**
 * Rutas de gestión de perfiles
 * Este archivo maneja todas las operaciones relacionadas con los perfiles
 * de usuario en el Portal del Estudiante.
 */

import { Router } from 'express';
import { eq, sql } from 'drizzle-orm';
import { profiles, documents, requests, enrollmentStageHistory, users } from '@shared/schema';
import { updateEnrollmentStageSchema, validateStageChangeSchema } from '@shared/schema';
import db from '../db';
import { authenticateToken, requireRole } from '../middleware/auth';
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

// GET /api/profiles/:id - Obtener un perfil específico
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de perfil inválido' });
    }

    // Obtener el perfil
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));

    if (!profile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Obtener conteo de documentos
    const [{ count: documentCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(documents)
      .where(eq(documents.userId, id));

    // Obtener conteo de solicitudes pendientes
    const [{ count: pendingRequestCount }] = await db
      .select({
        count: sql`count(*)::int`
      })
      .from(requests)
      .where(sql`${requests.userId} = ${id} AND status IN ('pendiente', 'en_proceso')`);

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

// PUT /api/profiles/:id - Actualizar un perfil
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de perfil inválido' });
    }
    
    const updates = req.body;

    // Verificar que el perfil existe
    const [existingProfile] = await db.select().from(profiles).where(eq(profiles.id, id));
    if (!existingProfile) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    // Actualizar el perfil
    const [updatedProfile] = await db
      .update(profiles)
      .set(updates)
      .where(eq(profiles.id, id))
      .returning();

    res.json(updatedProfile);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
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
router.put('/:userId/stage', authenticateToken, requireRole(['admin', 'superuser']), async (req, res) => {
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
 * @requires Autenticación y rol admin o superuser
 * @returns Historial de cambios de etapa
 */
router.get('/:userId/stage-history', authenticateToken, requireRole(['admin', 'superuser']), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
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