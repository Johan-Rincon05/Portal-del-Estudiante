/**
 * Rutas para servir archivos estáticos
 * Este archivo maneja el acceso directo a archivos almacenados
 * usando el sistema centralizado de almacenamiento.
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { fileStorage } from '../fileStorage.js';
import path from 'path';

const router = Router();

/**
 * Servir archivos de documentos
 * GET /documentos/:filename
 * @requires Autenticación
 * @returns Archivo solicitado
 */
router.get('/documentos/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que el archivo existe
    if (!fileStorage.fileExists(filename, 'documentos')) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Obtener información del archivo
    const fileInfo = fileStorage.getFileInfo(filename, 'documentos');
    if (!fileInfo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Leer el archivo
    const fileBuffer = await fileStorage.readFile(filename, 'documentos');
    if (!fileBuffer) {
      return res.status(404).json({ error: 'Error al leer archivo' });
    }

    // Determinar el tipo de contenido
    const ext = path.extname(filename).toLowerCase();
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

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Enviar archivo
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error al servir archivo de documentos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * Servir archivos de soportes
 * GET /soportes/:filename
 * @requires Autenticación
 * @returns Archivo solicitado
 */
router.get('/soportes/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Verificar que el archivo existe
    if (!fileStorage.fileExists(filename, 'soportes')) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Obtener información del archivo
    const fileInfo = fileStorage.getFileInfo(filename, 'soportes');
    if (!fileInfo) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Leer el archivo
    const fileBuffer = await fileStorage.readFile(filename, 'soportes');
    if (!fileBuffer) {
      return res.status(404).json({ error: 'Error al leer archivo' });
    }

    // Determinar el tipo de contenido
    const ext = path.extname(filename).toLowerCase();
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

    // Configurar headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');

    // Enviar archivo
    res.send(fileBuffer);

  } catch (error) {
    console.error('Error al servir archivo de soportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router; 