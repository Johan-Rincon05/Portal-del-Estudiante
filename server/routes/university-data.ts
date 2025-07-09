import { Router } from 'express';
import { db } from '../db';
import { universityData } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Obtener datos universitarios de un usuario
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await db
      .select()
      .from(universityData)
      .where(eq(universityData.userId, parseInt(userId)))
      .limit(1);
    
    res.json(data[0] || null);
  } catch (error) {
    console.error('Error al obtener datos universitarios:', error);
    res.status(500).json({ error: 'Error al obtener los datos universitarios' });
  }
});

// Crear o actualizar datos universitarios
router.post('/', async (req, res) => {
  try {
    const { userId, ...data } = req.body;

    // Verificar si ya existen datos para este usuario
    const existingData = await db
      .select()
      .from(universityData)
      .where(eq(universityData.userId, userId))
      .limit(1);

    let result;
    if (existingData.length > 0) {
      // Actualizar datos existentes
      result = await db
        .update(universityData)
        .set(data)
        .where(eq(universityData.userId, userId))
        .returning();
    } else {
      // Crear nuevos datos
      result = await db
        .insert(universityData)
        .values({
          userId,
          ...data
        })
        .returning();
    }

    res.json(result[0]);
  } catch (error) {
    console.error('Error al guardar datos universitarios:', error);
    res.status(500).json({ error: 'Error al guardar los datos universitarios' });
  }
});

export default router; 