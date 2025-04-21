import { Router } from 'express';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { users, profiles, documents } from '@shared/schema';

const router = Router();

// Middleware para verificar rol de administrador
const requireAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No autorizado' });
  }

  next();
};

// Obtener todos los estudiantes con sus documentos
router.get('/students', requireAdmin, async (req, res) => {
  try {
    // Obtener estudiantes (usuarios con rol 'estudiante' y sus perfiles)
    const students = await storage.getAllStudentsWithDocuments();
    res.json(students);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener los estudiantes' });
  }
});

export default router; 