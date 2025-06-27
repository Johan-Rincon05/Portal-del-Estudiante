/**
 * Rutas para el manejo de notificaciones
 * Permite a los usuarios obtener sus notificaciones y marcarlas como leídas
 */

import express from 'express';
import { db } from '../db.js';
import { notifications } from '../../shared/schema.js';
import { authenticateToken } from '../middleware/auth.js';
import { eq, desc, and } from 'drizzle-orm';

const router = express.Router();

/**
 * GET /api/notifications
 * Obtiene las notificaciones del usuario autenticado
 * Parámetros de query opcionales:
 * - limit: número máximo de notificaciones a devolver (default: 10)
 * - unreadOnly: si es true, solo devuelve notificaciones no leídas
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 10;
    const unreadOnly = req.query.unreadOnly === 'true';

    // Construir la consulta base
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    // Si se solicita solo no leídas, agregar el filtro
    if (unreadOnly) {
      query = db
        .select()
        .from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }

    const userNotifications = await query;

    res.json({
      success: true,
      data: userNotifications,
      count: userNotifications.length
    });

  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener notificaciones'
    });
  }
});

/**
 * GET /api/notifications/unread-count
 * Obtiene el número de notificaciones no leídas del usuario
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await db
      .select({ count: db.fn.count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));

    res.json({
      success: true,
      count: Number(unreadCount[0]?.count || 0)
    });

  } catch (error) {
    console.error('Error al obtener conteo de notificaciones no leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener conteo de notificaciones'
    });
  }
});

/**
 * PATCH /api/notifications/:id/mark-read
 * Marca una notificación específica como leída
 */
router.patch('/:id/mark-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de notificación inválido'
      });
    }

    // Verificar que la notificación pertenece al usuario
    const notification = await db
      .select()
      .from(notifications)
      .where(and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId)
      ))
      .limit(1);

    if (notification.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notificación no encontrada'
      });
    }

    // Marcar como leída
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));

    res.json({
      success: true,
      message: 'Notificación marcada como leída'
    });

  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al marcar notificación como leída'
    });
  }
});

/**
 * PATCH /api/notifications/mark-all-read
 * Marca todas las notificaciones del usuario como leídas
 */
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));

    res.json({
      success: true,
      message: 'Todas las notificaciones han sido marcadas como leídas'
    });

  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al marcar notificaciones como leídas'
    });
  }
});

export default router; 