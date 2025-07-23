/**
 * Rutas para el manejo de pagos y cuotas
 * Este archivo contiene los endpoints para consultar el estado financiero del estudiante
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { storage } from '../storage';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configuración de almacenamiento para multer
const storageMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/soportes');
    // Crear el directorio si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Nombre: cuotaID-timestamp.extensión
    const ext = path.extname(file.originalname);
    cb(null, `cuota_${req.params.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage: storageMulter });

/**
 * Middleware para validar que el usuario tenga rol admin o superadmin
 */
function requireAdminRole(req: any, res: any, next: any) {
  if (req.user && (req.user.role === 'SuperAdministrativos' || req.user.role === 'superuser')) {
    return next();
  }
  return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
}

/**
 * Obtiene el historial de pagos del estudiante autenticado
 * GET /api/payments/me
 * @requires Token JWT en el header de autorización
 * @returns Lista de pagos realizados por el estudiante
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const payments = await storage.getPaymentsByUserId(userId);
    
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene todos los pagos del sistema (solo para administradores)
 * GET /api/payments
 * @requires Token JWT en el header de autorización y rol admin/superuser
 * @returns Lista de todos los pagos del sistema
 */
router.get('/', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const payments = await storage.getAllPayments();
    
    res.json(payments);
  } catch (error) {
    console.error('Error al obtener todos los pagos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene las cuotas pendientes del estudiante autenticado
 * GET /api/payments/installments/me
 * @requires Token JWT en el header de autorización
 * @returns Lista de cuotas pendientes del estudiante
 */
router.get('/installments/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const installments = await storage.getInstallmentsByUserId(userId);
    
    res.json(installments);
  } catch (error) {
    console.error('Error al obtener cuotas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtiene el resumen financiero del estudiante
 * GET /api/payments/summary
 * @requires Token JWT en el header de autorización
 * @returns Resumen con totales de pagos y cuotas pendientes
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Obtener pagos realizados
    const payments = await storage.getPaymentsByUserId(userId);
    const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    
    // Obtener cuotas pendientes
    const installments = await storage.getInstallmentsByUserId(userId);
    const totalPending = installments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    
    // Obtener cuotas pagadas
    const paidInstallments = installments.filter(installment => installment.status === 'pagada');
    const totalPaidInstallments = paidInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0);
    
    // Obtener cuotas vencidas
    const overdueInstallments = installments.filter(installment => {
      if (installment.status === 'pendiente' && installment.dueDate) {
        return new Date(installment.dueDate) < new Date();
      }
      return false;
    });
    
    const summary = {
      totalPaid,
      totalPending,
      totalPaidInstallments,
      overdueCount: overdueInstallments.length,
      totalOverdue: overdueInstallments.reduce((sum, installment) => sum + Number(installment.amount || 0), 0),
      paymentsCount: payments.length,
      installmentsCount: installments.length
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error al obtener resumen financiero:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Endpoint para subir soporte de pago de una cuota
 * POST /api/payments/installments/:id/support
 * Requiere autenticación y ser dueño de la cuota
 */
router.post('/installments/:id/support', authenticateToken, upload.single('support'), async (req, res) => {
  try {
    const installmentId = Number(req.params.id);
    const userId = req.user!.id;
    const observations = req.body.observations || '';

    // Log de depuración
    console.log('[DEBUG] Subida de soporte iniciada:', {
      installmentId,
      userId,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body
    });

    // Buscar la cuota
    const installment = await storage.getInstallment(installmentId);
    if (!installment) {
      console.log('[DEBUG] Cuota no encontrada:', installmentId);
      return res.status(404).json({ error: 'Cuota no encontrada' });
    }
    
    // Validar que la cuota pertenezca al usuario autenticado
    if (installment.userId !== userId) {
      console.log('[DEBUG] Usuario no autorizado:', { userId, installmentUserId: installment.userId });
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cuota' });
    }
    
    // Validar que se haya subido un archivo
    if (!req.file) {
      console.log('[DEBUG] No se recibió archivo en la petición');
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }
    
    // Guardar la ruta relativa del archivo en la base de datos
    const soportePath = `/uploads/soportes/${req.file.filename}`;
    await storage.updateInstallment(installmentId, { support: soportePath });

    // Guardar las observaciones si se proporcionaron
    if (observations.trim()) {
      await storage.createInstallmentObservation({
        userId,
        installmentId,
        observation: observations.trim(),
        createdAt: new Date()
      });
    }

    return res.json({ 
      message: 'Soporte subido correctamente', 
      support: soportePath,
      observations: observations.trim() ? 'Observaciones guardadas' : null
    });
  } catch (error) {
    console.error('Error al subir soporte de pago:', error);
    res.status(500).json({ error: 'Error al subir el soporte de pago' });
  }
});

/**
 * Endpoint para que admin/superadmin consulten cuotas, soportes y observaciones de un estudiante
 * GET /api/payments/installments/:userId/admin
 * Requiere autenticación y rol admin/superadmin
 */
router.get('/installments/:userId/admin', authenticateToken, requireAdminRole, async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    // Obtener todas las cuotas del estudiante
    const installments = await storage.getInstallmentsByUserId(userId);
    // Obtener todas las observaciones del estudiante
    const observations = await storage.getInstallmentObservationsByUserId(userId);
    // Mapear observaciones por cuota
    const obsByInstallment = {};
    observations.forEach(obs => {
      if (!obsByInstallment[obs.installmentId]) obsByInstallment[obs.installmentId] = [];
      obsByInstallment[obs.installmentId].push({
        id: obs.id,
        observation: obs.observation,
        createdAt: obs.createdAt
      });
    });
    // Unir datos de cuotas y observaciones
    const result = installments.map(inst => ({
      ...inst,
      observations: obsByInstallment[inst.id] || []
    }));
    res.json(result);
  } catch (error) {
    console.error('Error al consultar cuotas y observaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Endpoint para servir archivos de soporte de forma segura
 * GET /api/payments/support/:filename
 * Requiere autenticación y permisos para ver el archivo
 * Acepta token en header Authorization o como parámetro de consulta
 */
router.get('/support/:filename', async (req, res) => {
  try {
    // Verificar autenticación desde header o parámetro de consulta
    let user: any;
    
    // Intentar obtener token del header Authorization
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const jwt = await import('jsonwebtoken');
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura') as any;
        user = decoded;
      } catch (error) {
        console.log('[DEBUG] Token del header inválido:', error);
      }
    }
    
    // Si no hay usuario del header, intentar con parámetro de consulta
    if (!user) {
      const token = req.query.token as string;
      if (token) {
        try {
          const jwt = await import('jsonwebtoken');
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura') as any;
          user = decoded;
        } catch (error) {
          console.log('[DEBUG] Token del query inválido:', error);
        }
      }
    }
    
    // Si no hay usuario válido, rechazar la petición
    if (!user) {
      console.log('[DEBUG] No se proporcionó token válido');
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }
    
        // Asignar el usuario a req.user para compatibilidad
    req.user = user;
    
    const filename = req.params.filename;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Log de depuración de filename
    console.log(`[DEBUG] Solicitud de archivo:`, filename);

    // Validar que el nombre del archivo sea seguro
    if (!filename || filename.includes('..') || filename.includes('/')) {
      console.log(`[DEBUG] Nombre de archivo inválido:`, filename);
      return res.status(400).json({ error: 'Nombre de archivo inválido' });
    }

    // Construir la ruta completa del archivo
    const filePath = path.join(__dirname, '../../uploads/soportes', filename);
    console.log(`[DEBUG] Ruta absoluta buscada:`, filePath);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo NO encontrado en:`, filePath);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    } else {
      console.log(`[DEBUG] Archivo encontrado en:`, filePath);
    }

    // Para admin/superadmin, permitir acceso a cualquier archivo
    if (userRole === 'SuperAdministrativos' || userRole === 'superuser') {
      // Continuar sin validación adicional
    } else {
      // Para estudiantes, buscar la cuota asociada al archivo para validar permisos
      const installments = await storage.getInstallmentsByUserId(userId);
      const installmentWithFile = installments.find(inst => 
        inst.support && inst.support.includes(filename)
      );

      if (!installmentWithFile) {
        return res.status(403).json({ error: 'No tienes permisos para ver este archivo' });
      }
    }
    


    // Obtener información del archivo
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Configurar headers según el tipo de archivo
    let contentType = 'application/octet-stream';
    let disposition = 'inline';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
      disposition = 'inline';
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      contentType = `image/${ext.slice(1)}`;
      disposition = 'inline';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
      disposition = 'inline';
    }

    // Configurar headers de respuesta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600'); // Cache por 1 hora

    // Log de acceso para auditoría
    console.log(`Acceso a archivo: ${filename} por usuario ${userId} (${userRole})`);

    // Enviar el archivo
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al servir archivo de soporte:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Endpoint para servir archivos de soporte en iframes (sin header de autorización)
 * GET /api/payments/support-iframe/:filename
 * Requiere token como parámetro de consulta para validación
 */
router.get('/support-iframe/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const token = req.query.token as string;
    
    console.log(`[DEBUG] Support-iframe request:`, {
      filename,
      hasToken: !!token,
      tokenLength: token?.length
    });
    
    if (!token) {
      console.log(`[DEBUG] No token provided`);
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Verificar el token
    let user: any;
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura') as any;
      user = decoded;
      console.log(`[DEBUG] Token válido para usuario:`, user);
    } catch (error) {
      console.log(`[DEBUG] Token inválido:`, error);
      return res.status(401).json({ error: 'Token inválido' });
    }

    // Validar que el nombre del archivo sea seguro
    if (!filename || filename.includes('..') || filename.includes('/')) {
      console.log(`[DEBUG] Nombre de archivo inválido:`, filename);
      return res.status(400).json({ error: 'Nombre de archivo inválido' });
    }

    // Construir la ruta completa del archivo
    const filePath = path.join(__dirname, '../../uploads/soportes', filename);
    console.log(`[DEBUG] Ruta del archivo:`, filePath);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo no encontrado:`, filePath);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    console.log(`[DEBUG] Archivo encontrado, enviando...`);

    // Obtener información del archivo
    const stats = fs.statSync(filePath);
    const ext = path.extname(filename).toLowerCase();

    // Configurar headers según el tipo de archivo
    let contentType = 'application/octet-stream';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
    }

    console.log(`[DEBUG] Enviando archivo:`, {
      contentType,
      fileSize: stats.size,
      filename
    });

    // Configurar headers de respuesta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Enviar el archivo directamente
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al servir archivo de soporte en iframe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 