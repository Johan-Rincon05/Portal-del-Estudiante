/**
 * Rutas de gestión de documentos
 * Este archivo maneja todas las operaciones relacionadas con la carga,
 * descarga y gestión de documentos en el Portal del Estudiante.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { storage } from '../storage';
import { documentSchema } from '../schema';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../s3';

const router = Router();

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
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const document = documentSchema.parse(req.body);
    const createdDocument = await storage.createDocument({
      ...document,
      userId: req.user.id
    });
    res.status(201).json(createdDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
    } else {
      console.error('Error al crear documento:', error);
      res.status(500).json({ error: 'Error al crear documento' });
    }
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

export default router; 