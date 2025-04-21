import { Express } from 'express';
import { Server } from 'http';
import authRoutes from './auth';
import documentsRoutes from './documents';
import profilesRoutes from './profiles';
import requestsRoutes from './requests';

export async function registerRoutes(app: Express): Promise<Server> {
  const server = new Server(app);

  // Rutas de autenticación
  app.use('/api/auth', authRoutes);

  // Rutas de documentos
  app.use('/api/documents', documentsRoutes);

  // Rutas de perfiles
  app.use('/api/profiles', profilesRoutes);

  // Rutas de solicitudes
  app.use('/api/requests', requestsRoutes);

  return server;
} 