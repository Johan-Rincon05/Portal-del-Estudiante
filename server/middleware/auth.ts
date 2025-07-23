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
        allyId?: number; // ID del aliado asociado al usuario
        universityId?: number; // ID de la universidad asociada al usuario
      };
      allyFilter?: {
        allyId: number;
      };
      universityFilter?: {
        universityId: number;
      };
      dataFilter?: {
        allyId?: number;
        universityId?: number;
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
      allyId?: number;
      universityId?: number;
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
 * Middleware para filtrar datos según el rol del usuario
 * Aplica filtros automáticos basados en el rol del usuario:
 * - Aliado Administrativo: solo ve estudiantes de su aliado
 * - Institución Educativa: solo ve estudiantes de su universidad
 * - Admin/Superuser: ven todos los datos
 * @param req - Request de Express
 * @param res - Response de Express
 * @param next - Función next de Express
 */
export const filterDataByRole = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  // Si es superuser o SuperAdministrativos, no aplicar filtro (ven todo)
  if (req.user.role === 'superuser' || req.user.role === 'SuperAdministrativos') {
    return next();
  }

  // Inicializar filtro de datos
  req.dataFilter = {};

  // Aplicar filtros según el rol
  switch (req.user.role) {
    case 'aliado_comercial':
      if (req.user.allyId) {
        req.dataFilter.allyId = req.user.allyId;
        console.log(`🔒 Filtro aplicado: Aliado ID ${req.user.allyId}`);
      }
      break;

    case 'institucion_educativa':
      if (req.user.universityId) {
        req.dataFilter.universityId = req.user.universityId;
        console.log(`🔒 Filtro aplicado: Universidad ID ${req.user.universityId}`);
      }
      break;

    case 'administrativo':
    case 'cartera':
      // Estos roles pueden ver todos los datos (como admin pero con menos permisos)
      break;

    default:
      // Para otros roles (estudiante), no aplicar filtros especiales
      break;
  }

  next();
};

/**
 * Middleware para verificar acceso a recursos específicos
 * Verifica si el usuario puede acceder a un recurso específico basado en su rol
 * @param resourceType - Tipo de recurso (user, document, payment, etc.)
 * @returns Middleware que verifica el acceso al recurso
 */
export const requireResourceAccess = (resourceType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // Si es superuser o SuperAdministrativos, tiene acceso a todos los recursos
    if (req.user.role === 'superuser' || req.user.role === 'SuperAdministrativos') {
      return next();
    }

    const resourceId = req.params.id;
    if (!resourceId) {
      return res.status(400).json({ error: 'ID de recurso no proporcionado' });
    }

    try {
      // Importar storage dinámicamente para evitar dependencias circulares
      const { storage } = await import('../storage.js');

      let hasAccess = false;

      switch (resourceType) {
        case 'user':
          // Verificar acceso a usuario
          const user = await storage.getUser(parseInt(resourceId));
          if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
          }

          hasAccess = await checkUserAccess(req.user, user);
          break;

        case 'document':
          // Verificar acceso a documento
          const document = await storage.getDocument(parseInt(resourceId));
          if (!document) {
            return res.status(404).json({ error: 'Documento no encontrado' });
          }

          hasAccess = await checkDocumentAccess(req.user, document);
          break;

        case 'payment':
          // Verificar acceso a pago
          const payment = await storage.getPayment(parseInt(resourceId));
          if (!payment) {
            return res.status(404).json({ error: 'Pago no encontrado' });
          }

          hasAccess = await checkPaymentAccess(req.user, payment);
          break;

        default:
          return res.status(400).json({ error: 'Tipo de recurso no soportado' });
      }

      if (!hasAccess) {
        return res.status(403).json({ error: 'Acceso denegado al recurso' });
      }

      next();
    } catch (error) {
      console.error('Error al verificar acceso al recurso:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
};

/**
 * Verifica si un usuario puede acceder a otro usuario
 * @param currentUser - Usuario actual
 * @param targetUser - Usuario objetivo
 * @returns true si tiene acceso
 */
async function checkUserAccess(currentUser: any, targetUser: any): Promise<boolean> {
  // Si es el mismo usuario, tiene acceso
  if (currentUser.id === targetUser.id) {
    return true;
  }

  // Si es estudiante, solo puede acceder a su propia información
  if (currentUser.role === 'estudiante') {
    return false;
  }

  // Para aliados comerciales, verificar que el usuario pertenezca a su aliado
  if (currentUser.role === 'aliado_comercial' && currentUser.allyId) {
    return targetUser.allyId === currentUser.allyId;
  }

  // Para instituciones educativas, verificar que el usuario pertenezca a su universidad
  if (currentUser.role === 'institucion_educativa' && currentUser.universityId) {
    return targetUser.universityId === currentUser.universityId;
  }

  // Para administrativo y cartera, tienen acceso a todos los usuarios
  if (['administrativo', 'cartera'].includes(currentUser.role)) {
    return true;
  }

  return false;
}

/**
 * Verifica si un usuario puede acceder a un documento
 * @param currentUser - Usuario actual
 * @param document - Documento objetivo
 * @returns true si tiene acceso
 */
async function checkDocumentAccess(currentUser: any, document: any): Promise<boolean> {
  // Si es el propietario del documento, tiene acceso
  if (currentUser.id === document.userId) {
    return true;
  }

  // Si es estudiante, solo puede acceder a sus propios documentos
  if (currentUser.role === 'estudiante') {
    return false;
  }

  // Para aliados comerciales, verificar que el documento pertenezca a un usuario de su aliado
  if (currentUser.role === 'aliado_comercial' && currentUser.allyId) {
    const { storage } = await import('../storage.js');
    const documentOwner = await storage.getUser(document.userId);
    return documentOwner?.allyId === currentUser.allyId;
  }

  // Para instituciones educativas, verificar que el documento pertenezca a un usuario de su universidad
  if (currentUser.role === 'institucion_educativa' && currentUser.universityId) {
    const { storage } = await import('../storage.js');
    const documentOwner = await storage.getUser(document.userId);
    return documentOwner?.universityId === currentUser.universityId;
  }

  // Para administrativo y cartera, tienen acceso a todos los documentos
  if (['administrativo', 'cartera'].includes(currentUser.role)) {
    return true;
  }

  return false;
}

/**
 * Verifica si un usuario puede acceder a un pago
 * @param currentUser - Usuario actual
 * @param payment - Pago objetivo
 * @returns true si tiene acceso
 */
async function checkPaymentAccess(currentUser: any, payment: any): Promise<boolean> {
  // Si es el propietario del pago, tiene acceso
  if (currentUser.id === payment.userId) {
    return true;
  }

  // Si es estudiante, solo puede acceder a sus propios pagos
  if (currentUser.role === 'estudiante') {
    return false;
  }

  // Para aliados comerciales, verificar que el pago pertenezca a un usuario de su aliado
  if (currentUser.role === 'aliado_comercial' && currentUser.allyId) {
    const { storage } = await import('../storage.js');
    const paymentOwner = await storage.getUser(payment.userId);
    return paymentOwner?.allyId === currentUser.allyId;
  }

  // Para instituciones educativas, verificar que el pago pertenezca a un usuario de su universidad
  if (currentUser.role === 'institucion_educativa' && currentUser.universityId) {
    const { storage } = await import('../storage.js');
    const paymentOwner = await storage.getUser(payment.userId);
    return paymentOwner?.universityId === currentUser.universityId;
  }

  // Para administrativo y cartera, tienen acceso a todos los pagos
  if (['administrativo', 'cartera'].includes(currentUser.role)) {
    return true;
  }

  return false;
} 