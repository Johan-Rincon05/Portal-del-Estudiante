import { Router } from 'express';
import { db } from '../db';
import { universities, programs } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Obtener todas las universidades
router.get('/', async (req, res) => {
  try {
    const allUniversities = await db
      .select()
      .from(universities);
    
    res.json(allUniversities);
  } catch (error) {
    console.error('Error al obtener universidades:', error);
    res.status(500).json({ error: 'Error al obtener las universidades' });
  }
});

// Obtener programas de una universidad
router.get('/:universityId/programs', async (req, res) => {
  try {
    const { universityId } = req.params;
    const universityPrograms = await db
      .select()
      .from(programs)
      .where(eq(programs.universityId, parseInt(universityId)));
    
    res.json(universityPrograms);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    res.status(500).json({ error: 'Error al obtener los programas' });
  }
});

export default router; 