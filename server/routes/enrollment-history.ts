import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { getWebSocketManager } from '../utils/websocket';

const router = Router();

// Esquemas de validación
const createStageChangeSchema = z.object({
  userId: z.number(),
  fromStage: z.string(),
  toStage: z.string(),
  reason: z.string().optional(),
  comments: z.string().optional(),
  validatedBy: z.number().optional(),
  validationDate: z.string().optional(),
  documents: z.array(z.number()).optional(),
  requirements: z.array(z.string()).optional()
});

const updateStageChangeSchema = z.object({
  reason: z.string().optional(),
  comments: z.string().optional(),
  validatedBy: z.number().optional(),
  validationDate: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional()
});

// Obtener historial completo de cambios de etapa para un usuario
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Verificar permisos: solo el propio usuario o administradores pueden ver su historial
    const requestingUser = req.user;
    if (requestingUser.id !== userId && 
        requestingUser.role !== 'SuperAdministrativos' && 
        requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para ver este historial' });
    }

    const history = await storage.getEnrollmentStageHistory(userId);
    
    res.json({
      success: true,
      data: history,
      message: 'Historial de cambios de etapa obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener historial de cambios de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el historial de cambios de etapa'
    });
  }
});

// Obtener historial de cambios de etapa con filtros (para administradores)
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    // Verificar que sea administrador
    const requestingUser = req.user;
    if (requestingUser.role !== 'SuperAdministrativos' && requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para acceder a esta información' });
    }

    const { 
      userId, 
      stage, 
      status, 
      dateFrom, 
      dateTo, 
      limit = 50, 
      offset = 0 
    } = req.query;

    const filters = {
      userId: userId ? parseInt(userId as string) : undefined,
      stage: stage as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    };

    const history = await storage.getEnrollmentStageHistoryWithFilters(filters);
    
    res.json({
      success: true,
      data: history,
      message: 'Historial de cambios de etapa obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener historial de cambios de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el historial de cambios de etapa'
    });
  }
});

// Crear un nuevo cambio de etapa
router.post('/', authenticateToken, async (req, res) => {
  try {
    const requestingUser = req.user;
    
    // Solo administradores pueden crear cambios de etapa
    if (requestingUser.role !== 'SuperAdministrativos' && requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para crear cambios de etapa' });
    }

    const validatedData = createStageChangeSchema.parse(req.body);
    
    // Agregar información del administrador que crea el cambio
    const stageChangeData = {
      ...validatedData,
      createdBy: requestingUser.id,
      createdAt: new Date(),
      status: 'pending'
    };

    const newStageChange = await storage.createEnrollmentStageChange(stageChangeData);
    
    // Enviar notificación al usuario
    const ws = getWebSocketManager();
    ws.sendNotificationToUser(validatedData.userId, {
      id: `stage-change-${newStageChange.id}`,
      type: 'system',
      title: 'Cambio de Etapa de Matrícula',
      message: `Tu etapa de matrícula ha cambiado de "${validatedData.fromStage}" a "${validatedData.toStage}"`,
      userId: validatedData.userId,
      data: {
        fromStage: validatedData.fromStage,
        toStage: validatedData.toStage,
        reason: validatedData.reason,
        comments: validatedData.comments
      },
      createdAt: new Date(),
      read: false
    });

    res.status(201).json({
      success: true,
      data: newStageChange,
      message: 'Cambio de etapa creado exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    console.error('Error al crear cambio de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo crear el cambio de etapa'
    });
  }
});

// Actualizar un cambio de etapa
router.put('/:changeId', authenticateToken, async (req, res) => {
  try {
    const requestingUser = req.user;
    const changeId = parseInt(req.params.changeId);
    
    // Solo administradores pueden actualizar cambios de etapa
    if (requestingUser.role !== 'SuperAdministrativos' && requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para actualizar cambios de etapa' });
    }

    const validatedData = updateStageChangeSchema.parse(req.body);
    
    // Obtener el cambio de etapa actual
    const currentChange = await storage.getEnrollmentStageChange(changeId);
    if (!currentChange) {
      return res.status(404).json({ error: 'Cambio de etapa no encontrado' });
    }

    const updatedChange = await storage.updateEnrollmentStageChange(changeId, {
      ...validatedData,
      updatedBy: requestingUser.id,
      updatedAt: new Date()
    });

    // Si el estado cambió a aprobado, enviar notificación
    if (validatedData.status === 'approved') {
      const ws = getWebSocketManager();
      ws.sendNotificationToUser(currentChange.userId, {
        id: `stage-approved-${changeId}`,
        type: 'system',
        title: 'Etapa de Matrícula Aprobada',
        message: `Tu cambio de etapa a "${currentChange.toStage}" ha sido aprobado`,
        userId: currentChange.userId,
        data: {
          fromStage: currentChange.fromStage,
          toStage: currentChange.toStage,
          comments: validatedData.comments
        },
        createdAt: new Date(),
        read: false
      });
    }

    res.json({
      success: true,
      data: updatedChange,
      message: 'Cambio de etapa actualizado exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Datos inválidos', 
        details: error.errors 
      });
    }
    console.error('Error al actualizar cambio de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo actualizar el cambio de etapa'
    });
  }
});

// Obtener estadísticas de cambios de etapa
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const requestingUser = req.user;
    
    // Solo administradores pueden ver estadísticas
    if (requestingUser.role !== 'SuperAdministrativos' && requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para ver estadísticas' });
    }

    const { dateFrom, dateTo } = req.query;
    
    const stats = await storage.getEnrollmentStageChangeStats({
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    });

    res.json({
      success: true,
      data: stats,
      message: 'Estadísticas obtenidas exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudieron obtener las estadísticas'
    });
  }
});

// Obtener un cambio de etapa específico
router.get('/:changeId', authenticateToken, async (req, res) => {
  try {
    const requestingUser = req.user;
    const changeId = parseInt(req.params.changeId);
    
    const stageChange = await storage.getEnrollmentStageChange(changeId);
    if (!stageChange) {
      return res.status(404).json({ error: 'Cambio de etapa no encontrado' });
    }

    // Verificar permisos
    if (requestingUser.id !== stageChange.userId && 
        requestingUser.role !== 'SuperAdministrativos' && 
        requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para ver este cambio de etapa' });
    }

    res.json({
      success: true,
      data: stageChange,
      message: 'Cambio de etapa obtenido exitosamente'
    });
  } catch (error) {
    console.error('Error al obtener cambio de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo obtener el cambio de etapa'
    });
  }
});

// Eliminar un cambio de etapa (solo superusuarios)
router.delete('/:changeId', authenticateToken, async (req, res) => {
  try {
    const requestingUser = req.user;
    const changeId = parseInt(req.params.changeId);
    
    // Solo superusuarios pueden eliminar cambios de etapa
    if (requestingUser.role !== 'superuser') {
      return res.status(403).json({ error: 'No tienes permisos para eliminar cambios de etapa' });
    }

    const deleted = await storage.deleteEnrollmentStageChange(changeId);
    if (!deleted) {
      return res.status(404).json({ error: 'Cambio de etapa no encontrado' });
    }

    res.json({
      success: true,
      message: 'Cambio de etapa eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cambio de etapa:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo eliminar el cambio de etapa'
    });
  }
});

export default router; 