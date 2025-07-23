import { Router } from 'express';
import { db } from '../db';
import { universityData, users } from '../../shared/schema.js';
import { eq } from 'drizzle-orm';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { z } from 'zod';

const router = Router();

// Esquema de validación para datos universitarios
const universityDataSchema = z.object({
  userId: z.number().positive('ID de usuario debe ser un número positivo'),
  universityId: z.number().positive('ID de universidad debe ser un número positivo').optional(),
  programId: z.number().positive('ID de programa debe ser un número positivo').optional(),
  academicPeriod: z.string().optional(),
  studyDuration: z.string().optional(),
  methodology: z.string().optional(),
  degreeTitle: z.string().optional(),
  subscriptionType: z.string().optional(),
  applicationMethod: z.string().optional(),
  severancePaymentUsed: z.boolean().optional()
});

// Obtener datos universitarios de un usuario
router.get('/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdNum = parseInt(userId);
    
    if (isNaN(userIdNum)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const data = await db
      .select()
      .from(universityData)
      .where(eq(universityData.userId, userIdNum))
      .limit(1);
    
    res.json(data[0] || null);
  } catch (error) {
    console.error('Error al obtener datos universitarios:', error);
    res.status(500).json({ error: 'Error al obtener los datos universitarios' });
  }
});

// Crear o actualizar datos universitarios
router.post('/', authenticateToken, requireRole(['SuperAdministrativos', 'superuser']), async (req, res) => {
  try {
    console.log('=== ACTUALIZACIÓN DE DATOS UNIVERSITARIOS ===');
    console.log('Datos recibidos:', req.body);
    
    // Validar datos de entrada
    const validationResult = universityDataSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.log('❌ Validación fallida:', validationResult.error.issues);
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: validationResult.error.issues 
      });
    }

    const { userId, ...data } = validationResult.data;
    console.log('✅ Datos validados - userId:', userId, 'data:', data);

    // Verificar que el usuario existe
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', user.username);

    // Verificar si ya existen datos para este usuario
    const existingData = await db
      .select()
      .from(universityData)
      .where(eq(universityData.userId, userId))
      .limit(1);

    console.log('📋 Datos existentes:', existingData[0] || 'No existen');

    let result;
    if (existingData.length > 0) {
      // Actualizar datos existentes
      console.log('🔄 Actualizando datos existentes...');
      result = await db
        .update(universityData)
        .set(data)
        .where(eq(universityData.userId, userId))
        .returning();
      console.log('✅ Datos actualizados:', result[0]);
    } else {
      // Crear nuevos datos - solo incluir campos que no sean undefined
      const insertData: any = { userId };
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          insertData[key] = value;
        }
      });
      
      console.log('🔄 Creando nuevos datos:', insertData);
      result = await db
        .insert(universityData)
        .values(insertData)
        .returning();
      console.log('✅ Datos creados:', result[0]);
    }

    console.log('=== FIN ACTUALIZACIÓN DE DATOS UNIVERSITARIOS ===');
    res.json(result[0]);
  } catch (error) {
    console.error('❌ Error al guardar datos universitarios:', error);
    res.status(500).json({ error: 'Error al guardar los datos universitarios' });
  }
});

export default router; 