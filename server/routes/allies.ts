/**
 * Rutas de gestión de aliados
 * Este archivo maneja todas las operaciones relacionadas con los aliados
 * del sistema en el Portal del Estudiante.
 */

import { Router } from 'express';
import { z } from 'zod';
import { authenticateToken, requireRole } from '../middleware/auth';
import { storage } from '../storage';

const router = Router();

/**
 * Esquema de validación para crear/actualizar aliados
 */
const allySchema = z.object({
  name: z.string().min(1, "El nombre del aliado es requerido").max(255, "El nombre es demasiado largo")
});

/**
 * Obtener todos los aliados
 * GET /
 * @requires Autenticación y rol admin o superuser
 * @returns Lista de todos los aliados
 */
router.get('/', authenticateToken, requireRole(['SuperAdministrativos', 'superuser']), async (req, res) => {
  try {
    const allies = await storage.getAllAllies();
    res.json(allies);
  } catch (error) {
    console.error('Error al obtener aliados:', error);
    res.status(500).json({ error: 'Error al obtener los aliados' });
  }
});

/**
 * Obtener un aliado por ID
 * GET /:id
 * @requires Autenticación y rol admin o superuser
 * @returns Aliado específico
 */
router.get('/:id', authenticateToken, requireRole(['SuperAdministrativos', 'superuser']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de aliado inválido' });
    }

    const ally = await storage.getAlly(id);
    if (!ally) {
      return res.status(404).json({ error: 'Aliado no encontrado' });
    }

    res.json(ally);
  } catch (error) {
    console.error('Error al obtener aliado:', error);
    res.status(500).json({ error: 'Error al obtener el aliado' });
  }
});

/**
 * Crear un nuevo aliado
 * POST /
 * @requires Autenticación y rol superuser
 * @body {name} - Datos del aliado
 * @returns Aliado creado
 */
router.post('/', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    const result = allySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { name } = result.data;
    const ally = await storage.createAlly({ name });
    
    res.status(201).json(ally);
  } catch (error) {
    console.error('Error al crear aliado:', error);
    res.status(500).json({ error: 'Error al crear el aliado' });
  }
});

/**
 * Actualizar un aliado
 * PUT /:id
 * @requires Autenticación y rol superuser
 * @body {name} - Nuevos datos del aliado
 * @returns Aliado actualizado
 */
router.put('/:id', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de aliado inválido' });
    }

    const result = allySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { name } = result.data;
    const ally = await storage.updateAlly(id, { name });
    
    if (!ally) {
      return res.status(404).json({ error: 'Aliado no encontrado' });
    }

    res.json(ally);
  } catch (error) {
    console.error('Error al actualizar aliado:', error);
    res.status(500).json({ error: 'Error al actualizar el aliado' });
  }
});

/**
 * Eliminar un aliado
 * DELETE /:id
 * @requires Autenticación y rol superuser
 * @returns Mensaje de confirmación
 */
router.delete('/:id', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de aliado inválido' });
    }

    // Verificar que el aliado existe antes de eliminarlo
    const existingAlly = await storage.getAlly(id);
    if (!existingAlly) {
      return res.status(404).json({ error: 'Aliado no encontrado' });
    }

    await storage.deleteAlly(id);
    res.json({ message: 'Aliado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar aliado:', error);
    res.status(500).json({ error: 'Error al eliminar el aliado' });
  }
});

export default router; 