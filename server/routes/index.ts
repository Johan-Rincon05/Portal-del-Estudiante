import { Express } from 'express';
import { Server } from 'http';
import { setupAuth } from '../auth';
import documentsRoutes from './documents';
import profilesRoutes from './profiles';
import requestsRoutes from './requests';
import notificationsRoutes from './notifications';
import paymentsRoutes from './payments';


export async function registerRoutes(app: Express): Promise<Server> {
  const server = new Server(app);

  // Configurar autenticación
  setupAuth(app);

  // Rutas de documentos
  app.use('/api/documents', documentsRoutes);

  // Rutas de perfiles
  app.use('/api/profiles', profilesRoutes);

  // Rutas de solicitudes
  app.use('/api/requests', requestsRoutes);

  // Rutas de notificaciones
  app.use('/api/notifications', notificationsRoutes);

  // Rutas de pagos
  app.use('/api/payments', paymentsRoutes);



  return server;
} 