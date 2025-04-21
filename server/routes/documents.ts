import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';
import { documentSchema } from '../schema';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../s3';

const router = Router();

// GET /api/documents - Obtener todos los documentos del usuario actual
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

// POST /api/documents - Crear un nuevo documento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const document = documentSchema.parse(req.body);
    const { rows } = await pool.query(
      'INSERT INTO documents (user_id, name, type, size, url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, document.name, document.type, document.size, document.url]
    );
    res.status(201).json(rows[0]);
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
    const { rows } = await pool.query(
      'DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    
    if (rows.length === 0) {
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

  const doc = await pool.query(
    'SELECT * FROM documents WHERE id = $1',
    [id]
  );

  if (doc.rows.length === 0) {
    return res.status(404).send({ error: 'Document not found' });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.rows[0].url,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  res.send({ url });
});

router.get('/:id/download', async (req, res) => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) {
    return res.status(400).send({ error: 'Invalid document ID' });
  }

  const doc = await pool.query(
    'SELECT * FROM documents WHERE id = $1',
    [id]
  );

  if (doc.rows.length === 0) {
    return res.status(404).send({ error: 'Document not found' });
  }

  const command = new GetObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: doc.rows[0].url,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  res.send({ url });
});

export default router; 