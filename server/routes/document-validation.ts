import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { getWebSocketManager } from '../utils/websocket';
import { sendStatusChangeEmail } from '../utils/email';

const router = Router();

// Esquemas de validación
const validateDocumentSchema = z.object({
  documentId: z.number(),
  status: z.enum(['aprobado', 'rechazado']),
  rejectionReason: z.string().optional(),
  observations: z.string().optional(),
  adminComments: z.string().optional()
});

const getDocumentsSchema = z.object({
  status: z.enum(['todos', 'pendiente', 'aprobado', 'rechazado']).optional(),
  type: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

const getDocumentHistorySchema = z.object({
  documentId: z.number()
});

// Obtener documentos para validación
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    // Verificar permisos de administrador
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const query = getDocumentsSchema.parse(req.query);
    
    const documents = await storage.getDocumentsForValidation({
      status: query.status === 'todos' ? undefined : query.status,
      type: query.type,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      search: query.search,
      page: query.page || 1,
      limit: query.limit || 20
    });

    res.json(documents);
  } catch (error) {
    console.error('Error getting documents for validation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de documentos
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await storage.getDocumentValidationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting document validation stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar documento (aprobar/rechazar)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { documentId, status, rejectionReason, observations, adminComments } = validateDocumentSchema.parse(req.body);

    // Obtener el documento
    const document = await storage.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Verificar que el documento esté pendiente
    if (document.status !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden validar documentos pendientes' });
    }

    // Obtener información del estudiante
    const student = await storage.getUserById(document.userId);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Validar que se proporcione motivo de rechazo si es rechazado
    if (status === 'rechazado' && !rejectionReason) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
    }

    // Actualizar el documento
    const updatedDocument = await storage.updateDocument(documentId, {
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.id
    });

    // Crear registro en el historial de validaciones
    await storage.createDocumentValidationHistory({
      documentId,
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      adminComments,
      validatedBy: user.id,
      validatedAt: new Date().toISOString()
    });

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendDocumentStatusUpdate(document.userId, {
      type: 'document_validation',
      documentId,
      status,
      rejectionReason,
      documentType: document.type,
      fileName: document.fileName
    });

    // Enviar email de notificación al estudiante
    try {
      await sendStatusChangeEmail(
        student.email,
        student.username,
        'document',
        status,
        status === 'aprobado' 
          ? `Tu documento "${document.fileName}" ha sido aprobado.`
          : `Tu documento "${document.fileName}" ha sido rechazado. Motivo: ${rejectionReason}`
      );
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // No fallar la operación si el email falla
    }

    // Verificar si todos los documentos del estudiante están aprobados
    if (status === 'aprobado') {
      const allDocuments = await storage.getUserDocuments(document.userId);
      const allApproved = allDocuments.every(doc => doc.status === 'aprobado');
      
      if (allApproved) {
        // Notificar que todos los documentos están aprobados
        wsManager.sendNotificationToUser(document.userId, {
          type: 'all_documents_approved',
          title: 'Todos los documentos aprobados',
          message: 'Todos tus documentos han sido aprobados. Puedes continuar con el siguiente paso.',
          priority: 'high'
        });
      }
    }

    res.json({
      message: `Documento ${status === 'aprobado' ? 'aprobado' : 'rechazado'} exitosamente`,
      document: updatedDocument
    });

  } catch (error) {
    console.error('Error validating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de validación inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener historial de validaciones de un documento
router.get('/history/:documentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { documentId } = getDocumentHistorySchema.parse({ documentId: parseInt(req.params.documentId) });
    
    const history = await storage.getDocumentValidationHistory(documentId);
    res.json(history);
  } catch (error) {
    console.error('Error getting document validation history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener documento específico con información completa
router.get('/:documentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const documentId = parseInt(req.params.documentId);
    
    const document = await storage.getDocumentWithDetails(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    res.json(document);
  } catch (error) {
    console.error('Error getting document details:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Revalidar documento (cambiar decisión anterior)
router.put('/:documentId/revalidate', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const documentId = parseInt(req.params.documentId);
    const { status, rejectionReason, observations, adminComments } = validateDocumentSchema.partial().parse(req.body);

    if (!status) {
      return res.status(400).json({ error: 'Debe especificar el nuevo estado' });
    }

    // Obtener el documento
    const document = await storage.getDocumentById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Verificar que el documento ya haya sido validado
    if (document.status === 'pendiente') {
      return res.status(400).json({ error: 'El documento aún no ha sido validado' });
    }

    // Validar que se proporcione motivo de rechazo si es rechazado
    if (status === 'rechazado' && !rejectionReason) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
    }

    // Actualizar el documento
    const updatedDocument = await storage.updateDocument(documentId, {
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      reviewedAt: new Date().toISOString(),
      reviewedBy: user.id
    });

    // Crear registro en el historial de validaciones
    await storage.createDocumentValidationHistory({
      documentId,
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      adminComments,
      validatedBy: user.id,
      validatedAt: new Date().toISOString(),
      isRevalidation: true
    });

    // Obtener información del estudiante
    const student = await storage.getUserById(document.userId);

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendDocumentStatusUpdate(document.userId, {
      type: 'document_revalidation',
      documentId,
      status,
      rejectionReason,
      documentType: document.type,
      fileName: document.fileName
    });

    // Enviar email de notificación al estudiante
    if (student) {
      try {
        await sendStatusChangeEmail(
          student.email,
          student.username,
          'document',
          status,
          status === 'aprobado' 
            ? `Tu documento "${document.fileName}" ha sido re-aprobado.`
            : `Tu documento "${document.fileName}" ha sido re-rechazado. Motivo: ${rejectionReason}`
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    res.json({
      message: `Documento re-validado exitosamente`,
      document: updatedDocument
    });

  } catch (error) {
    console.error('Error revalidating document:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de validación inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 