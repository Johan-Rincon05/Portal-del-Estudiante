import { Router } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { eq } from 'drizzle-orm';
import { requests } from '@shared/schema';

const router = Router();

// Schema para validar la respuesta a una solicitud
const responseSchema = z.object({
  response: z.string().min(1, "La respuesta es requerida"),
  status: z.enum(["en_proceso", "completada", "rechazada"])
});

// Obtener todas las solicitudes
router.get('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const user = req.user;
    let userRequests;

    if (user.role === 'admin') {
      // Los administradores pueden ver todas las solicitudes
      userRequests = await storage.getAllRequests();
    } else {
      // Los estudiantes solo ven sus propias solicitudes
      userRequests = await storage.getRequestsByUserId(user.id);
    }

    res.json(userRequests);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener las solicitudes' });
  }
});

// Crear una nueva solicitud
router.post('/', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const request = await storage.createRequest({
      ...req.body,
      userId: req.user.id,
      status: 'pendiente'
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ error: 'Error al crear la solicitud' });
  }
});

// Responder a una solicitud (solo admin)
router.put('/:id/respond', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { id } = req.params;
    const result = responseSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({ 
        error: 'Datos inválidos',
        details: result.error.issues 
      });
    }

    const { response, status } = result.data;

    const updatedRequest = await storage.updateRequest(parseInt(id), {
      response,
      status,
      respondedAt: new Date(),
      respondedBy: req.user.id
    });

    if (!updatedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }

    // Aquí podrías agregar lógica para notificar al estudiante
    // Por ejemplo, enviar un email o una notificación en tiempo real

    res.json(updatedRequest);
  } catch (error) {
    console.error('Error al responder solicitud:', error);
    res.status(500).json({ error: 'Error al responder la solicitud' });
  }
});

// Obtener el conteo de solicitudes activas
router.get('/active-count', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const count = await storage.getActiveRequestsCount(req.user.id);
    res.json({ count });
  } catch (error) {
    console.error('Error al obtener conteo de solicitudes:', error);
    res.status(500).json({ error: 'Error al obtener el conteo de solicitudes' });
  }
});

export default router; 