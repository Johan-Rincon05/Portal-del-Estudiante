import type { Express } from "express";
import { createServer, type Server } from "http";
import dotenv from 'dotenv';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import documentsRouter from './routes/documents';
import requestsRouter from './routes/requests';

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

  const httpServer = createServer(app);
  return httpServer;
}
