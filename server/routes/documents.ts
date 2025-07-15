/**
 * Rutas de gestión de documentos
 * Este archivo maneja todas las operaciones relacionadas con la carga,
 * descarga y gestión de documentos en el Portal del Estudiante.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { storage } from '../storage';
import { documentSchema } from '../schema';
import { updateDocumentStatusSchema } from '../../shared/schema.js';
import { db } from '../db';
import { documents, users } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  createDocumentUploadNotification, 
  createDocumentApprovedNotification, 
  createDocumentRejectedNotification,
  createAdminDocumentUploadNotification 
} from '../utils/notifications.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const router = Router();

// Obtener la ruta del directorio actual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar multer para documentos (almacenamiento local)
const storageMulter = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/documentos');
    // Crear el directorio si no existe
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Nombre: userId-timestamp-nombreOriginal
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `${req.user?.id || 'unknown'}_${timestamp}${ext}`);
  }
});

const upload = multer({ 
  storage: storageMulter,
  fileFilter: (req, file, cb) => {
    // Permitir solo ciertos tipos de archivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

/**
 * Obtener todos los documentos del usuario actual
 * GET /
 * @requires Autenticación
 * @returns Lista de documentos del usuario
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    // Construir la base de la URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Si es admin o superuser, obtener todos los documentos
    if (req.user.role === 'admin' || req.user.role === 'superuser') {
      const allDocuments = await storage.getAllDocuments();
      // Agregar la URL de archivo a cada documento
      const docsWithUrl = allDocuments.map(doc => ({
        ...doc,
        url: `${baseUrl}/api/documents/${doc.id}/file`
      }));
      res.json(docsWithUrl);
    } else {
      // Si es estudiante, obtener solo sus documentos
      const documents = await storage.getDocuments(req.user.id);
      // Agregar la URL de archivo a cada documento
      const docsWithUrl = documents.map(doc => ({
        ...doc,
        url: `${baseUrl}/api/documents/${doc.id}/file`
      }));
      res.json(docsWithUrl);
    }
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

/**
 * Obtener documentos con información del estudiante (solo para admin/superuser)
 * GET /admin
 * @requires Autenticación y rol admin o superuser
 * @returns Lista de documentos con información del estudiante
 */
router.get('/admin', authenticateToken, requireRole(['admin', 'superuser']), async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const documentsWithStudents = await storage.getDocumentsWithStudents();
    // Agregar la URL de archivo a cada documento
    const docsWithUrl = documentsWithStudents.map(doc => ({
      ...doc,
      url: `${baseUrl}/api/documents/${doc.id}/file`
    }));
    res.json(docsWithUrl);
  } catch (error) {
    console.error('Error al obtener documentos con estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

/**
 * Crear un nuevo documento
 * POST /
 * @requires Autenticación
 * @body {name, type, size, url} - Datos del documento
 * @returns Documento creado
 */
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Log de depuración
    console.log('[DEBUG] Subida de documento iniciada:', {
      userId: req.user.id,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null,
      body: req.body
    });

    const { type, observations } = req.body;
    const file = req.file;

    if (!file) {
      console.log('[DEBUG] No se recibió archivo en la petición de documento');
      return res.status(400).json({ error: 'Archivo no proporcionado' });
    }

    // Guardar la información en la base de datos con ruta local
    const createdDocument = await storage.createDocument({
      name: file.originalname,
      type,
      path: file.filename, // Usar el nombre del archivo guardado localmente
      userId: req.user.id,
      status: 'pendiente',
      observations: observations || null
    });

    // Crear notificación para el estudiante
    await createDocumentUploadNotification(
      req.user.id,
      file.originalname,
      type
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
      await createAdminDocumentUploadNotification(
        adminUserIds,
        req.user.username || 'Estudiante',
        file.originalname
      );
    }

    res.status(201).json(createdDocument);
  } catch (error) {
    console.error('Error al crear documento:', error);
    res.status(500).json({ error: 'Error al crear documento' });
  }
});

// DELETE /api/documents/:id - Eliminar un documento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const documentId = parseInt(req.params.id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'ID de documento inválido' });
    }
    
    // Obtener el documento antes de eliminarlo para acceder a los datos de Google Drive
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    // Verificar permisos
    if (req.user.role !== 'admin' && req.user.role !== 'superuser' && document.userId !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permisos para eliminar este documento' });
    }
    
    // Eliminar archivo local si existe
    if (document.path) {
      try {
        const filePath = path.join(__dirname, '../../uploads/documentos', document.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('[DEBUG] Archivo local eliminado exitosamente:', document.path);
        }
      } catch (fileError) {
        console.error('[DEBUG] Error al eliminar archivo local:', fileError);
        // Continuar con la eliminación del registro aunque falle la eliminación del archivo
      }
    }
    
    // Eliminar registro de la base de datos
    const deleted = await storage.deleteDocument(documentId, req.user.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }
    
    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
});

router.get('/:id/url', authenticateToken, async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      return res.status(400).send({ error: 'Invalid document ID' });
    }

    const doc = await storage.getDocument(id);
    if (doc === null) {
      return res.status(404).send({ error: 'Document not found' });
    }

    // Verificar permisos - solo el propietario o admin puede acceder
    if (req.user!.role !== 'admin' && req.user!.role !== 'superuser' && doc.userId !== req.user!.id) {
      return res.status(403).send({ error: 'No tienes permisos para acceder a este documento' });
    }

    // Construir URL para archivo local
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/api/documents/${id}/file`;
    
    res.send({ url });
  } catch (error) {
    console.error('Error al obtener URL del documento:', error);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
});

/**
 * Endpoint para servir archivos de documentos de forma segura
 * GET /:id/file
 * Requiere autenticación y permisos para ver el archivo
 */
router.get('/:id/file', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Log de depuración
    console.log(`[DEBUG] Solicitud de documento ID:`, documentId);

    if (isNaN(documentId)) {
      console.log(`[DEBUG] ID de documento inválido:`, documentId);
      return res.status(400).json({ error: 'ID de documento inválido' });
    }

    // Obtener el documento de la base de datos
    const document = await storage.getDocument(documentId);
    if (!document) {
      console.log(`[DEBUG] Documento NO encontrado con ID:`, documentId);
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    console.log(`[DEBUG] Documento encontrado:`, document);

    // Para admin/superadmin, permitir acceso a cualquier documento
    if (userRole === 'admin' || userRole === 'superuser') {
      // Continuar sin validación adicional
    } else {
      // Para estudiantes, verificar que el documento pertenezca al usuario
      if (document.userId !== userId) {
        console.log(`[DEBUG] Usuario ${userId} no tiene permisos para documento ${documentId}`);
        return res.status(403).json({ error: 'No tienes permisos para ver este documento' });
      }
    }

    // Obtener archivo local
    const filePath = path.join(__dirname, '../../uploads/documentos', document.path);
    console.log(`[DEBUG] Ruta absoluta buscada:`, filePath);

    if (!fs.existsSync(filePath)) {
      console.log(`[DEBUG] Archivo local NO encontrado en:`, filePath);
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(document.name).toLowerCase();

    // Configurar headers según el tipo de archivo
    let contentType = 'application/octet-stream';
    let disposition = 'attachment';

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
    res.setHeader('Content-Disposition', `${disposition}; filename="${document.name}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Log de acceso para auditoría
    console.log(`Acceso a documento local: ${document.name} por usuario ${userId} (${userRole})`);

    // Enviar el archivo local
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Error al servir documento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (isNaN(documentId)) {
      return res.status(400).send({ error: 'Invalid document ID' });
    }

    const doc = await storage.getDocument(documentId);
    if (doc === null) {
      return res.status(404).send({ error: 'Document not found' });
    }

    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'superuser' && doc.userId !== userId) {
      return res.status(403).send({ error: 'No tienes permisos para descargar este documento' });
    }

    // Construir URL para descarga
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/api/documents/${documentId}/file`;
    
    res.send({ url });
  } catch (error) {
    console.error('Error al obtener URL de descarga:', error);
    res.status(500).send({ error: 'Error interno del servidor' });
  }
});

/**
 * Actualizar el estado de un documento
 * PUT /:id/status
 * @requires Autenticación y rol admin o superuser
 * @body {status, rejectionReason} - Nuevo estado y motivo de rechazo (opcional)
 * @returns Documento actualizado
 */
router.put('/:id/status', authenticateToken, requireRole(['admin', 'superuser']), async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'ID de documento inválido' });
    }

    // Validar los datos de entrada
    const result = updateDocumentStatusSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { status, rejectionReason } = result.data;

    // Verificar que el documento existe
    const [existingDocument] = await db.select().from(documents).where(eq(documents.id, documentId));
    if (!existingDocument) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Actualizar el estado del documento
    const [updatedDocument] = await db
      .update(documents)
      .set({ 
        status,
        rejectionReason,
        reviewedBy: req.user?.id,
        reviewedAt: new Date()
      })
      .where(eq(documents.id, documentId))
      .returning();

    // Crear notificación para el estudiante según el estado
    if (status === 'aprobado') {
      await createDocumentApprovedNotification(
        existingDocument.userId,
        existingDocument.name
      );
    } else if (status === 'rechazado' && rejectionReason) {
      await createDocumentRejectedNotification(
        existingDocument.userId,
        existingDocument.name,
        rejectionReason
      );
    }

    console.log(`Estado de documento ${documentId} actualizado a: ${status}`);

    res.json({
      message: 'Estado de documento actualizado exitosamente',
      document: updatedDocument
    });
  } catch (error) {
    console.error('Error al actualizar estado de documento:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del documento' });
  }
});

/**
 * Endpoint para servir archivos de documentos en iframes (sin header de autorización)
 * GET /api/documents/:id/iframe
 * Requiere token como parámetro de consulta para validación
 */
router.get('/:id/iframe', async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // Verificar el token
    let user: any;
    try {
      const jwt = await import('jsonwebtoken');
      const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura') as any;
      user = decoded;
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'ID de documento inválido' });
    }

    // Obtener el documento de la base de datos
    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Para admin/superadmin, permitir acceso a cualquier documento
    if (user.role === 'admin' || user.role === 'superuser') {
      // OK
    } else {
      // Para estudiantes, verificar que el documento pertenezca al usuario
      if (document.userId !== user.id) {
        return res.status(403).json({ error: 'No tienes permisos para ver este documento' });
      }
    }

    // Obtener archivo local
    const filePath = path.join(__dirname, '../../uploads/documentos', document.path);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Obtener información del archivo
    const stats = fs.statSync(filePath);
    const ext = path.extname(document.name).toLowerCase();

    // Configurar headers según el tipo de archivo
    let contentType = 'application/octet-stream';
    let disposition = 'inline';

    if (ext === '.pdf') {
      contentType = 'application/pdf';
      disposition = 'inline';
    } else if ([ '.jpg', '.jpeg', '.png', '.gif', '.webp' ].includes(ext)) {
      contentType = `image/${ext.slice(1)}`;
      disposition = 'inline';
    } else if (ext === '.txt') {
      contentType = 'text/plain';
      disposition = 'inline';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `${disposition}; filename="${document.name}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Enviar el archivo local
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Error al servir documento en iframe:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Obtener la URL de descarga directa de un documento
 * GET /:id/download-url
 * @requires Autenticación
 * @returns URL de descarga directa
 */
router.get('/:id/download-url', authenticateToken, async (req, res) => {
  try {
    const documentId = parseInt(req.params.id);
    const userId = req.user!.id;
    const userRole = req.user!.role;

    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'ID de documento inválido' });
    }

    const document = await storage.getDocument(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Documento no encontrado' });
    }

    // Verificar permisos
    if (userRole !== 'admin' && userRole !== 'superuser' && document.userId !== userId) {
      return res.status(403).json({ error: 'No tienes permisos para acceder a este documento' });
    }

    // Construir URL de descarga
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const downloadUrl = `${baseUrl}/api/documents/${documentId}/file`;

    res.json({ 
      downloadUrl: downloadUrl,
      fileName: document.name,
      filePath: document.path
    });
  } catch (error) {
    console.error('Error al obtener URL de descarga:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 