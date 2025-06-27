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
import { updateDocumentStatusSchema } from '@shared/schema';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../s3';
import { db } from '../db';
import { documents, users } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import multer from 'multer';
import { 
  createDocumentUploadNotification, 
  createDocumentApprovedNotification, 
  createDocumentRejectedNotification,
  createAdminDocumentUploadNotification 
} from '../utils/notifications.js';

const router = Router();
const upload = multer({ dest: 'uploads/' });

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
    
    const documents = await storage.getDocuments(req.user.id);
    res.json(documents);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
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

    const { type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Archivo no proporcionado' });
    }

    // Guardar la información en la base de datos
    const createdDocument = await storage.createDocument({
      name: file.originalname,
      type,
      path: file.filename, // o file.path según tu lógica
      userId: req.user.id,
      status: 'pendiente'
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

router.get('/:id/url', async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    return res.status(400).send({ error: 'Invalid document ID' });
  }

  const doc = await storage.getDocument(id);

  if (doc === null) {
    return res.status(404).send({ error: 'Document not found' });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.url,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.send({ url });
});

router.get('/:id/download', async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    return res.status(400).send({ error: 'Invalid document ID' });
  }

  const doc = await storage.getDocument(id);

  if (doc === null) {
    return res.status(404).send({ error: 'Document not found' });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.url,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  res.send({ url });
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

export default router; 