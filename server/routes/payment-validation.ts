import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { getWebSocketManager } from '../utils/websocket';
import { sendStatusChangeEmail } from '../utils/email';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuración de multer para subir archivos de soporte
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/payment-support/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'support-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storageConfig,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen, PDF y documentos'));
    }
  }
});

// Esquemas de validación
const validatePaymentSchema = z.object({
  paymentId: z.number(),
  status: z.enum(['aprobado', 'rechazado']),
  rejectionReason: z.string().optional(),
  observations: z.string().optional(),
  adminComments: z.string().optional(),
  quotaUpdates: z.array(z.object({
    quotaId: z.number(),
    newStatus: z.enum(['pagado', 'pendiente', 'vencido'])
  })).optional()
});

const getPaymentsSchema = z.object({
  status: z.enum(['todos', 'pendiente', 'aprobado', 'rechazado']).optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  amountMin: z.number().optional(),
  amountMax: z.number().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
});

const getPaymentHistorySchema = z.object({
  paymentId: z.number()
});

const getQuotasSchema = z.object({
  userId: z.number().optional(),
  status: z.enum(['todos', 'pendiente', 'pagado', 'vencido']).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

// Obtener pagos para validación
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const query = getPaymentsSchema.parse(req.query);
    
    const payments = await storage.getPaymentsForValidation({
      status: query.status === 'todos' ? undefined : query.status,
      paymentMethod: query.paymentMethod,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      amountMin: query.amountMin,
      amountMax: query.amountMax,
      search: query.search,
      page: query.page || 1,
      limit: query.limit || 20
    });

    res.json(payments);
  } catch (error) {
    console.error('Error getting payments for validation:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener estadísticas de pagos
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const stats = await storage.getPaymentValidationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting payment validation stats:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Validar pago (aprobar/rechazar)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { paymentId, status, rejectionReason, observations, adminComments, quotaUpdates } = validatePaymentSchema.parse(req.body);

    // Obtener el pago
    const payment = await storage.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el pago esté pendiente
    if (payment.status !== 'pendiente') {
      return res.status(400).json({ error: 'Solo se pueden validar pagos pendientes' });
    }

    // Validar que se proporcione motivo de rechazo si es rechazado
    if (status === 'rechazado' && !rejectionReason) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
    }

    // Obtener información del estudiante
    const student = await storage.getUserById(payment.userId);
    if (!student) {
      return res.status(404).json({ error: 'Estudiante no encontrado' });
    }

    // Actualizar el pago
    const updatedPayment = await storage.updatePayment(paymentId, {
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      validatedAt: new Date().toISOString(),
      validatedBy: user.id
    });

    // Crear registro en el historial de validaciones
    await storage.createPaymentValidationHistory({
      paymentId,
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      adminComments,
      validatedBy: user.id,
      validatedAt: new Date().toISOString()
    });

    // Actualizar cuotas si se proporcionan
    if (status === 'aprobado' && quotaUpdates && quotaUpdates.length > 0) {
      for (const quotaUpdate of quotaUpdates) {
        await storage.updateQuota(quotaUpdate.quotaId, {
          status: quotaUpdate.newStatus,
          paymentId: paymentId,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendPaymentStatusUpdate(payment.userId, {
      type: 'payment_validation',
      paymentId,
      status,
      rejectionReason,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod
    });

    // Enviar email de notificación al estudiante
    try {
      await sendStatusChangeEmail(
        student.email,
        student.username,
        'payment',
        status,
        status === 'aprobado' 
          ? `Tu pago de ${payment.currency} ${payment.amount.toFixed(2)} ha sido aprobado.`
          : `Tu pago de ${payment.currency} ${payment.amount.toFixed(2)} ha sido rechazado. Motivo: ${rejectionReason}`
      );
    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // No fallar la operación si el email falla
    }

    // Verificar si todas las cuotas del estudiante están pagadas
    if (status === 'aprobado') {
      const allQuotas = await storage.getUserQuotas(payment.userId);
      const allPaid = allQuotas.every(quota => quota.status === 'pagado');
      
      if (allPaid) {
        // Notificar que todas las cuotas están pagadas
        wsManager.sendNotificationToUser(payment.userId, {
          type: 'all_quotas_paid',
          title: 'Todas las cuotas pagadas',
          message: 'Todas tus cuotas han sido pagadas. Puedes continuar con el siguiente paso.',
          priority: 'high'
        });
      }
    }

    res.json({
      message: `Pago ${status === 'aprobado' ? 'aprobado' : 'rechazado'} exitosamente`,
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error validating payment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de validación inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Subir archivo de soporte para un pago
router.post('/:paymentId/support', authenticateToken, upload.single('supportFile'), async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const paymentId = parseInt(req.params.paymentId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo de soporte' });
    }

    // Verificar que el pago existe
    const payment = await storage.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Guardar información del archivo de soporte
    const supportFile = await storage.createPaymentSupportFile({
      paymentId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: user.id,
      uploadedAt: new Date().toISOString()
    });

    res.json({
      message: 'Archivo de soporte subido exitosamente',
      supportFile
    });

  } catch (error) {
    console.error('Error uploading support file:', error);
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: 'Error al subir archivo', details: error.message });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener archivos de soporte de un pago
router.get('/:paymentId/support', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const paymentId = parseInt(req.params.paymentId);
    
    const supportFiles = await storage.getPaymentSupportFiles(paymentId);
    res.json(supportFiles);

  } catch (error) {
    console.error('Error getting payment support files:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener historial de validaciones de un pago
router.get('/history/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const { paymentId } = getPaymentHistorySchema.parse({ paymentId: parseInt(req.params.paymentId) });
    
    const history = await storage.getPaymentValidationHistory(paymentId);
    res.json(history);
  } catch (error) {
    console.error('Error getting payment validation history:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener cuotas de un estudiante
router.get('/quotas', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const query = getQuotasSchema.parse(req.query);
    
    const quotas = await storage.getQuotasForManagement({
      userId: query.userId,
      status: query.status === 'todos' ? undefined : query.status,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo
    });

    res.json(quotas);
  } catch (error) {
    console.error('Error getting quotas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cuota manualmente
router.put('/quotas/:quotaId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const quotaId = parseInt(req.params.quotaId);
    const { status, paymentId, observations } = req.body;

    // Verificar que la cuota existe
    const quota = await storage.getQuotaById(quotaId);
    if (!quota) {
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }

    // Actualizar la cuota
    const updatedQuota = await storage.updateQuota(quotaId, {
      status,
      paymentId,
      observations,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id
    });

    // Obtener información del estudiante
    const student = await storage.getUserById(quota.userId);

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendNotificationToUser(quota.userId, {
      type: 'quota_updated',
      title: 'Cuota actualizada',
      message: `Tu cuota ${quota.quotaNumber} ha sido marcada como ${status}.`,
      priority: 'medium'
    });

    // Enviar email de notificación al estudiante
    if (student) {
      try {
        await sendStatusChangeEmail(
          student.email,
          student.username,
          'payment',
          status,
          `Tu cuota ${quota.quotaNumber} ha sido actualizada a estado: ${status}`
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    res.json({
      message: 'Cuota actualizada exitosamente',
      quota: updatedQuota
    });

  } catch (error) {
    console.error('Error updating quota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener pago específico con información completa
router.get('/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const paymentId = parseInt(req.params.paymentId);
    
    const payment = await storage.getPaymentWithDetails(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Error getting payment details:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Revalidar pago (cambiar decisión anterior)
router.put('/:paymentId/revalidate', authenticateToken, async (req, res) => {
  try {
    const { user } = req as any;
    
    if (user.role !== 'SuperAdministrativos' && user.role !== 'superuser') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const paymentId = parseInt(req.params.paymentId);
    const { status, rejectionReason, observations, adminComments, quotaUpdates } = validatePaymentSchema.partial().parse(req.body);

    if (!status) {
      return res.status(400).json({ error: 'Debe especificar el nuevo estado' });
    }

    // Obtener el pago
    const payment = await storage.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Verificar que el pago ya haya sido validado
    if (payment.status === 'pendiente') {
      return res.status(400).json({ error: 'El pago aún no ha sido validado' });
    }

    // Validar que se proporcione motivo de rechazo si es rechazado
    if (status === 'rechazado' && !rejectionReason) {
      return res.status(400).json({ error: 'Debe proporcionar un motivo de rechazo' });
    }

    // Actualizar el pago
    const updatedPayment = await storage.updatePayment(paymentId, {
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      validatedAt: new Date().toISOString(),
      validatedBy: user.id
    });

    // Crear registro en el historial de validaciones
    await storage.createPaymentValidationHistory({
      paymentId,
      status,
      rejectionReason: status === 'rechazado' ? rejectionReason : null,
      observations,
      adminComments,
      validatedBy: user.id,
      validatedAt: new Date().toISOString(),
      isRevalidation: true
    });

    // Actualizar cuotas si se proporcionan
    if (quotaUpdates && quotaUpdates.length > 0) {
      for (const quotaUpdate of quotaUpdates) {
        await storage.updateQuota(quotaUpdate.quotaId, {
          status: quotaUpdate.newStatus,
          paymentId: paymentId,
          updatedAt: new Date().toISOString()
        });
      }
    }

    // Obtener información del estudiante
    const student = await storage.getUserById(payment.userId);

    // Enviar notificación WebSocket al estudiante
    const wsManager = getWebSocketManager();
    wsManager.sendPaymentStatusUpdate(payment.userId, {
      type: 'payment_revalidation',
      paymentId,
      status,
      rejectionReason,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod
    });

    // Enviar email de notificación al estudiante
    if (student) {
      try {
        await sendStatusChangeEmail(
          student.email,
          student.username,
          'payment',
          status,
          status === 'aprobado' 
            ? `Tu pago de ${payment.currency} ${payment.amount.toFixed(2)} ha sido re-aprobado.`
            : `Tu pago de ${payment.currency} ${payment.amount.toFixed(2)} ha sido re-rechazado. Motivo: ${rejectionReason}`
        );
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
    }

    res.json({
      message: `Pago re-validado exitosamente`,
      payment: updatedPayment
    });

  } catch (error) {
    console.error('Error revalidating payment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos de validación inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 