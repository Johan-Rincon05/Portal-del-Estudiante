/**
 * Sistema de autenticación y autorización
 * Este archivo maneja la autenticación de usuarios, generación de tokens JWT,
 * y la configuración de las rutas de autenticación en el Portal del Estudiante.
 */

import { Express, Request, Response } from "express";
import bcrypt from 'bcrypt';
import { storage } from "./storage";
import { User as SelectUser, PERMISSIONS, DEFAULT_ROLES } from "../shared/schema.js";
import jwt from 'jsonwebtoken';
import { z } from "zod";

/**
 * Extensión de la interfaz User de Express para incluir los campos del usuario
 */
declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

/**
 * Configuración de JWT
 * Define las constantes para la generación y verificación de tokens JWT
 */
const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';
const JWT_EXPIRES_IN = '24h';

/**
 * Genera un token JWT para un usuario
 * @param user - Datos del usuario para incluir en el token
 * @returns Token JWT firmado
 */
export const generateToken = (user: { id: number; username: string; role: string; allyId?: number; universityId?: number }) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, allyId: user.allyId, universityId: user.universityId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Hashea una contraseña usando bcrypt
 * @param password - Contraseña en texto plano
 * @returns Contraseña hasheada
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compara una contraseña en texto plano con un hash
 * @param password - Contraseña en texto plano
 * @param hash - Hash de la contraseña
 * @returns true si la contraseña coincide
 */
export const comparePasswords = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Esquema de validación para registro de usuarios
 * Define las reglas de validación para los datos de registro
 */
const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['estudiante', 'SuperAdministrativos', 'superuser']).optional()
});

/**
 * Esquema de validación para inicio de sesión
 * Define las reglas de validación para los datos de inicio de sesión
 */
const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

/**
 * Configura las rutas y middleware de autenticación
 * @param app - Instancia de Express
 */
export function setupAuth(app: Express) {
  /**
   * Ruta de inicio de sesión
   * POST /api/login
   * @body {username, password} - Credenciales de inicio de sesión
   * @returns Token JWT y datos del usuario
   */
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      console.log('=== INICIO DE PROCESO DE AUTENTICACIÓN ===');
      console.log('Intento de inicio de sesión para usuario:', username);
      
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        console.log('Usuario no encontrado:', username);
        return res.status(401).json({ error: 'Usuario no encontrado' });
      }
      
      const passwordMatch = await comparePasswords(password, user.password);
      
      if (!passwordMatch) {
        console.log('Contraseña incorrecta para usuario:', username);
        return res.status(401).json({ error: 'Contraseña incorrecta' });
      }
      
      console.log('Inicio de sesión exitoso para usuario:', username);
      
      // Generar token JWT
      const token = generateToken(user);

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        token
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos de inicio de sesión inválidos", details: error.errors });
      }
      console.error('Error en inicio de sesión:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  /**
   * Ruta de registro de usuarios
   * POST /api/register
   * @body {username, email, password, role} - Datos del usuario a registrar
   * @returns Token JWT y datos del usuario creado
   */
  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { username, email, password, role } = registerSchema.parse(req.body);
      
      // Verificar si el usuario ya existe
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
      }

      // Verificar si el email ya está en uso
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: "El email ya está en uso" });
      }

      // Crear el usuario
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: role || 'estudiante',
        isActive: true,
        permissions: {}
      });

      // Generar token
      const token = generateToken(user);

      res.status(201).json({
        message: "Usuario registrado exitosamente",
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos de registro inválidos", details: error.errors });
      }
      console.error("Error en registro:", error);
      res.status(500).json({ error: "Error al registrar usuario" });
    }
  });

  /**
   * Ruta de cierre de sesión
   * POST /api/logout
   * @returns Mensaje de éxito
   */
  app.post("/api/logout", (req, res) => {
    // Con JWT, el logout se maneja en el frontend eliminando el token
    res.json({ message: 'Sesión cerrada exitosamente' });
  });

  /**
   * Ruta para obtener información del usuario actual
   * GET /api/me
   * @requires Token JWT en el header de autorización
   * @returns Datos del usuario autenticado
   */
  app.get("/api/me", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const user = await storage.getUser(decoded.id);

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      res.status(401).json({ error: "Token inválido" });
    }
  });

  /**
   * Ruta para cambiar contraseña
   * POST /api/change-password
   * @requires Token JWT en el header de autorización
   * @body {currentPassword, newPassword} - Contraseñas actual y nueva
   * @returns Mensaje de éxito
   */
  app.post("/api/change-password", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      const { currentPassword, newPassword } = req.body;

      const user = await storage.getUser(decoded.id);
      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Verificar contraseña actual
      const isValidPassword = await comparePasswords(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Contraseña actual incorrecta" });
      }

      // Actualizar contraseña
      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ message: "Contraseña actualizada exitosamente" });
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
      res.status(500).json({ error: "Error al cambiar contraseña" });
    }
  });

  /**
   * Ruta para obtener información del usuario actual
   * GET /api/user
   * @returns Datos del usuario autenticado
   */
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      console.log('Headers recibidos:', req.headers);
      const authHeader = req.headers.authorization;
      console.log('Authorization header:', authHeader);
      
      const token = authHeader?.split(' ')[1];
      console.log('Token extraído:', token ? token.substring(0, 20) + '...' : 'No token');
      
      if (!token) {
        console.log('No se proporcionó token');
        return res.status(401).json({ error: "Token no proporcionado" });
      }

      const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
      console.log('Token decodificado:', decoded);
      
      const user = await storage.getUser(decoded.id);
      console.log('Usuario encontrado:', user ? { id: user.id, username: user.username, role: user.role } : 'No encontrado');

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const response = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      
      console.log('Enviando respuesta:', response);
      res.json(response);
    } catch (error) {
      console.error("Error al obtener información del usuario:", error);
      res.status(401).json({ error: "Token inválido" });
    }
  });
}