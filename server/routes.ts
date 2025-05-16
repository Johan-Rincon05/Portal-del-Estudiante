import type { Express } from "express";
import { createServer, type Server } from "http";
import dotenv from 'dotenv';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import documentsRouter from './routes/documents';
import requestsRouter from './routes/requests';
import { hashPassword } from "./utils";

// Load environment variables
dotenv.config();

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Register route modules
  app.use('/api/documents', documentsRouter);
  app.use('/api/requests', requestsRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Admin endpoints - create users with specific roles
  app.post('/api/admin/users', async (req, res) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || (req.user?.role !== 'admin' && req.user?.role !== 'superuser')) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const { username, password, role } = req.body;
      
      if (!username || !password || !role) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      
      // Create user with storage
      const user = await storage.createUser({
        username,
        password,
        role
      });
      
      res.json({ 
        message: 'User created successfully', 
        user: { 
          id: user.id, 
          username: user.username,
          role: user.role 
        } 
      });
    } catch (error: any) {
      console.error('Admin user creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para crear usuarios de ejemplo
  app.post('/api/admin/create-example-users', async (req, res) => {
    try {
      // Crear usuarios de ejemplo
      const exampleUsers = [
        { username: 'estudiante1', password: 'password123', role: 'estudiante' },
        { username: 'admin1', password: 'password123', role: 'admin' },
        { username: 'superuser1', password: 'password123', role: 'superuser' }
      ];

      const createdUsers = await Promise.all(
        exampleUsers.map(async (user) => {
          const hashedPassword = await hashPassword(user.password);
          return await storage.createUser({
            ...user,
            password: hashedPassword
          });
        })
      );

      res.json({ message: 'Usuarios de ejemplo creados exitosamente', users: createdUsers });
    } catch (error: any) {
      console.error('Error al crear usuarios de ejemplo:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Endpoint para obtener todos los usuarios
  app.get('/api/admin/users', async (req, res) => {
    try {
      if (!req.isAuthenticated() || (req.user?.role !== 'admin' && req.user?.role !== 'superuser')) {
        return res.status(403).json({ error: 'Not authorized' });
      }
      // JOIN users + profiles
      const usersWithProfiles = await storage.getAllUsersWithProfiles();
      // Mapear los datos para devolverlos en un formato amigable
      const result = usersWithProfiles.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        fullName: user.fullName || null,
        email: user.profileEmail || null,
        documentType: user.documentType || null,
        documentNumber: user.documentNumber || null
      }));
      res.json(result);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
