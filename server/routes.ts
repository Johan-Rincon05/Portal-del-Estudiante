/**
 * Configuración de rutas de la API
 * Este archivo maneja el registro y configuración de todas las rutas de la API
 * del Portal del Estudiante.
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import dotenv from 'dotenv';
import { setupAuth } from "./auth";
import { storage } from "./storage";
import documentsRouter from './routes/documents';
import requestsRouter from './routes/requests';
import { hashPassword } from "./utils";

// Cargar variables de entorno
dotenv.config();

/**
 * Registra todas las rutas de la API en la aplicación Express
 * @param app - Instancia de Express
 * @returns Servidor HTTP configurado
 */
export async function registerRoutes(app: Express): Promise<Server> {
  // Registrar módulos de rutas
  app.use('/api/documents', documentsRouter);
  app.use('/api/requests', requestsRouter);

  /**
   * Endpoint de verificación de estado
   * GET /api/health
   * @returns Estado del servidor y timestamp
   */
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Configurar autenticación al final para que las rutas de auth tengan prioridad
  setupAuth(app);

  /**
   * Endpoint de administración - Crear usuarios con roles específicos
   * POST /api/admin/users
   * @requires Autenticación y rol de admin o superuser
   * @body {username, password, role} - Datos del usuario a crear
   * @returns Usuario creado
   */
  app.post('/api/admin/users', async (req, res) => {
    try {
      // Verificar autenticación y rol
      if (!req.isAuthenticated() || (req.user?.role !== 'admin' && req.user?.role !== 'superuser')) {
        return res.status(403).json({ 
          error: 'No autorizado',
          details: 'Se requieren permisos de administrador o superusuario'
        });
      }

      const { username, password, role } = req.body;
      
      // Validaciones de campos requeridos
      if (!username || !password || !role) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos',
          details: 'Se requieren username, password y role'
        });
      }

      // Validar formato del email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido',
          details: 'El username debe ser un email válido'
        });
      }

      // Validar fortaleza de la contraseña
      if (password.length < 8) {
        return res.status(400).json({ 
          error: 'Contraseña débil',
          details: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      // Validar rol
      if (!['estudiante', 'admin', 'superuser'].includes(role)) {
        return res.status(400).json({ 
          error: 'Rol inválido',
          details: 'El rol debe ser uno de: estudiante, admin, superuser'
        });
      }

      // Crear usuario
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role,
        email: username,
        isActive: true,
        permissions: {}
      });

      res.status(201).json({
        message: 'Usuario creado exitosamente',
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      res.status(500).json({ error: 'Error al crear usuario' });
    }
  });

  /**
   * Endpoint para crear usuarios de ejemplo
   * POST /api/admin/create-example-users
   * @returns Lista de usuarios creados
   */
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
            password: hashedPassword,
            email: user.username,
            isActive: true,
            permissions: {}
          });
        })
      );

      res.json({ message: 'Usuarios de ejemplo creados exitosamente', users: createdUsers });
    } catch (error: any) {
      console.error('Error al crear usuarios de ejemplo:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * Endpoint para obtener todos los usuarios
   * GET /api/admin/users
   * @requires Autenticación y rol de admin o superuser
   * @returns Lista de usuarios con sus perfiles
   */
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
        fullName: user.profile?.fullName || null,
        email: user.profile?.email || null,
        documentType: user.profile?.documentType || null,
        documentNumber: user.profile?.documentNumber || null
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
