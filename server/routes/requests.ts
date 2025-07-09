/**
 * Rutas de gestión de solicitudes
 * Este archivo maneja todas las operaciones relacionadas con las solicitudes
 * de los estudiantes en el Portal del Estudiante.
 */

import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { eq, and } from 'drizzle-orm';
import { requests, users } from '../../shared/schema.js';
import { db } from '../db.js';
import { 
  createRequestSubmittedNotification,
  createRequestResponseNotification,
  createAdminRequestNotification 
} from '../utils/notifications.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * Esquema de validación para la respuesta a una solicitud
 */
const responseSchema = z.object({
  response: z.string().min(1, "La respuesta es requerida"),
  status: z.enum(["en_proceso", "completada", "rechazada"])
});

/**
 * Obtener todas las solicitudes
 * GET /
 * @requires Autenticación
 * @returns Lista de solicitudes (todas para admin, propias para estudiante)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = req.user;
    let userRequests;

    if (user.role === 'admin') {
      // Los administradores pueden ver todas las solicitudes
      userRequests = await storage.getAllRequests();
    } else {
      // Los estudiantes solo ven sus propias solicitudes
      userRequests = await storage.getRequestsByUserId(user.id);
    }

    res.json(userRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

// Crear una nueva solicitud
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const request = await storage.createRequest({
      ...req.body,
      userId: req.user.id,
      status: 'pendiente'
    });

    // Crear notificación para el estudiante
    await createRequestSubmittedNotification(
      req.user.id,
      req.body.subject
    );

    // Obtener administradores para notificarles
    const adminUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(
        eq(users.role, 'admin'),
        eq(users.isActive, true)
      ));

    const adminUserIds = adminUsers.map(admin => admin.id);

    // Crear notificaciones para administradores
    if (adminUserIds.length > 0) {
      await createAdminRequestNotification(
        adminUserIds,
        req.user.username || 'Estudiante',
        req.body.subject
      );
    }

    res.status(201).json(request);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
});

// Responder a una solicitud (solo admin)
router.put('/:id/respond', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { id } = req.params;
    const result = responseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { response, status } = result.data;

    // Obtener la solicitud antes de actualizarla para tener el userId
    const [existingRequest] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, parseInt(id)));

    if (!existingRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    const updatedRequest = await storage.updateRequest(parseInt(id), {
      response,
      status,
      respondedAt: new Date(),
      respondedBy: req.user.id
    });

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Crear notificación para el estudiante
    await createRequestResponseNotification(
      existingRequest.userId,
      existingRequest.subject,
      status
    );

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error al responder solicitud:', error);
    res.status(500).json({ error: 'Error al responder la solicitud' });
  }
});

/**
 * Obtener el conteo de solicitudes activas
 * GET /active-count
 * @requires Autenticación
 * @returns Número de solicitudes activas del usuario
 */
router.get('/active-count', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const count = await storage.getActiveRequestsCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener el conteo de solicitudes' });
  }
});

export default router; 