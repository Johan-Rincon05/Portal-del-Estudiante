/**
 * Middlewares de autenticación y autorización
 * Este archivo contiene los middlewares necesarios para la autenticación y
 * autorización de usuarios en el Portal del Estudiante.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PERMISSIONS, DEFAULT_ROLES } from '../../shared/schema.js';

/**
 * Extensión de la interfaz Request de Express para incluir el usuario autenticado
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        role: string;
        permissions: Record<string, boolean>;
      };
    }
  }
}

/**
 * Middleware para verificar el token JWT
 * Verifica la presencia y validez del token JWT en el header de autorización
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Función next de Express
 * @returns Error 401 si no hay token, 403 si el token es inválido
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== MIDDLEWARE AUTHENTICATE TOKEN ===');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  
  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Token extraído:', token ? token.substring(0, 20) + '...' : 'No token');

  if (!token) {
    console.log('❌ No se proporcionó token');
    return res.status(401).json({ error: 'Token de autenticación no proporcionado' });
  }

  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura';
    console.log('JWT_SECRET usado:', JWT_SECRET ? JWT_SECRET.substring(0, 10) + '...' : 'No definido');
    
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      username: string;
      role: string;
      permissions: Record<string, boolean>;
    };
    
    console.log('✅ Token válido, usuario decodificado:', decoded);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('❌ Error al verificar token:', error);
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para verificar roles de usuario
 * Verifica si el usuario tiene uno de los roles especificados
 * @param roles - Array de roles permitidos
 * @returns Middleware que verifica los roles
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Acceso denegado: rol no autorizado' });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos
 * Verifica si el usuario tiene los permisos necesarios para acceder al recurso
 * @param permissions - Array de permisos requeridos
 * @returns Middleware que verifica los permisos
 */
export const requirePermission = (permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Si el usuario es superuser, tiene todos los permisos
    if (req.user.role === 'superuser') {
      return next();
    }

    // Verificar si el usuario tiene todos los permisos requeridos
    const hasAllPermissions = permissions.every(permission => 
      req.user?.permissions[permission] || 
      DEFAULT_ROLES[req.user.role as keyof typeof DEFAULT_ROLES]?.permissions[permission]
    );

    if (!hasAllPermissions) {
      return res.status(403).json({ error: 'Acceso denegado: permisos insuficientes' });
    }

    next();
  };
};

/**
 * Middleware para verificar si el usuario está activo
 * Verifica que el usuario autenticado esté activo en el sistema
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Función next de Express
 * @returns Error 401 si no está autenticado
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Aquí podrías verificar en la base de datos si el usuario está activo
  // Por ahora, asumimos que si el usuario existe en el token, está activo
  next();
};

/**
 * Middleware para verificar propiedad de recursos
 * Verifica si el usuario es el propietario del recurso o tiene permisos de administrador
 * @param resourceType - Tipo de recurso a verificar
 * @returns Middleware que verifica la propiedad del recurso
 */
export const requireOwnership = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Si el usuario es superuser o admin, tiene acceso a todos los recursos
    if (req.user.role === 'superuser' || req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params.id;
    // Aquí deberías implementar la lógica para verificar si el usuario es el propietario del recurso
    // Por ejemplo, verificar en la base de datos si el recurso pertenece al usuario

    next();
  };
}; 