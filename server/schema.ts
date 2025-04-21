import { z } from 'zod';

export const documentSchema = z.object({
  id: z.string().uuid().optional(),
  userId: z.string().uuid(),
  name: z.string().min(1, 'El nombre es requerido').max(255),
  type: z.string().min(1, 'El tipo es requerido').max(50),
  size: z.number().positive('El tamaño debe ser mayor a 0'),
  url: z.string().url('URL inválida'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type Document = z.infer<typeof documentSchema>; 