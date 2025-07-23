/**
 * Rutas administrativas con filtro por aliado
 * Este archivo maneja las operaciones administrativas que respetan
 * la separación de datos por aliado para aliados administrativos
 */

import { Router } from 'express';
import { authenticateToken, requireRole, filterDataByRole } from '../middleware/auth';
import { storage } from '../storage';
import { eq, and } from 'drizzle-orm';
import { users } from '../../shared/schema.js';
import { hashPassword } from '../auth.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import { z } from 'zod';

const router = Router();

/**
 * Obtener usuarios con filtro por rol
 * GET /api/admin/users
 * @requires Autenticación y rol SuperAdministrativos, superuser, aliado_comercial o institucion_educativa
 * @returns Lista de usuarios filtrada por rol
 */
router.get('/users', authenticateToken, requireRole(['SuperAdministrativos', 'superuser', 'aliado_comercial', 'institucion_educativa']), filterDataByRole, async (req, res) => {
  try {
    console.log('=== OBTENIENDO USUARIOS ===');
    console.log('Filtros aplicados:', req.dataFilter);
    
    let usersList;

    if (req.dataFilter && (req.dataFilter.allyId || req.dataFilter.universityId)) {
      // Aplicar filtros según el rol del usuario
      const filters: any = {};
      if (req.dataFilter.allyId) filters.allyId = req.dataFilter.allyId;
      if (req.dataFilter.universityId) filters.universityId = req.dataFilter.universityId;
      
      console.log('Aplicando filtros:', filters);
      usersList = await storage.getAllUsersWithProfiles(filters);
    } else {
      // Para admin y superuser, obtener todos los usuarios con perfiles
      console.log('Obteniendo todos los usuarios con perfiles...');
      usersList = await storage.getAllUsersWithProfiles();
    }

    console.log(`✅ Usuarios obtenidos: ${usersList.length}`);
    console.log('=== FIN OBTENCIÓN DE USUARIOS ===');
    
    res.json(usersList);
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

/**
 * Crear nuevo usuario
 * POST /api/admin/users
 * @requires Autenticación y rol superuser
 * @body { username: string, email: string, password: string, role: string }
 * @returns Usuario creado
 */
router.post('/users', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    console.log('=== CREACIÓN DE USUARIO ===');
    console.log('Datos recibidos:', req.body);

    const { username, email, password, role } = req.body;

    // Validaciones básicas
    if (!username || !email || !password || !role) {
      return res.status(400).json({ 
        error: 'Datos incompletos', 
        details: 'Se requieren username, email, password y role' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      console.log('❌ Usuario ya existe:', username);
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }

    // Verificar si el email ya está en uso
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      console.log('❌ Email ya existe:', email);
      return res.status(400).json({ error: 'El email ya está en uso' });
    }

    // Crear el usuario
    const hashedPassword = await hashPassword(password);
    const newUser = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      role,
      isActive: true,
      permissions: {}
    });

    console.log('✅ Usuario creado exitosamente:', newUser.username);
    console.log('=== FIN CREACIÓN DE USUARIO ===');

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al crear usuario' });
  }
});

/**
 * Resetear contraseña de usuario
 * POST /api/admin/users/:userId/reset-password
 * @requires Autenticación y rol superuser
 * @body {} - No requiere body
 * @returns Mensaje de confirmación
 */
router.post('/users/:userId/reset-password', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Obtener el usuario
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Generar contraseña temporal aleatoria
    const generateTemporaryPassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < 12; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await hashPassword(temporaryPassword);

    // Actualizar la contraseña del usuario
    await storage.updateUser(userId, { password: hashedPassword });

    // Enviar email con la nueva contraseña
    const emailSent = await sendPasswordResetEmail(user.email, temporaryPassword, user.username);
    
    if (emailSent) {
      console.log(`✅ Email de reseteo enviado exitosamente a ${user.email}`);
      res.json({ 
        message: 'Contraseña reseteada exitosamente',
        details: `Se ha enviado un email a ${user.email} con la nueva contraseña temporal.`
      });
    } else {
      console.log(`⚠️ Error al enviar email, pero contraseña actualizada para ${user.email}: ${temporaryPassword}`);
      res.json({ 
        message: 'Contraseña reseteada exitosamente',
        details: `No se pudo enviar el email, pero la contraseña ha sido actualizada. Contacta al usuario directamente.`,
        warning: 'Email no enviado'
      });
    }

  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor al resetear contraseña' });
  }
});

/**
 * Eliminar usuario
 * DELETE /api/admin/users/:userId
 * @requires Autenticación y rol superuser
 * @returns Mensaje de confirmación
 */
router.delete('/users/:userId', authenticateToken, requireRole(['superuser']), async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    console.log('=== ELIMINACIÓN DE USUARIO ===');
    console.log('ID de usuario a eliminar:', userId);

    // Verificar que el usuario existe
    const user = await storage.getUser(userId);
    if (!user) {
      console.log('❌ Usuario no encontrado:', userId);
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', user.username, 'rol:', user.role);

    // Verificar que no se está intentando eliminar a sí mismo
    if (user.id === req.user?.id) {
      console.log('❌ Intento de auto-eliminación bloqueado');
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    // Eliminar el usuario (esto también eliminará el perfil por cascada si está configurado)
    await storage.deleteUser(userId);
    
    console.log('✅ Usuario eliminado exitosamente:', user.username);
    console.log('=== FIN ELIMINACIÓN DE USUARIO ===');
    
    res.json({ 
      message: 'Usuario eliminado exitosamente',
      details: `El usuario ${user.username} ha sido eliminado del sistema.`
    });

  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al eliminar usuario' });
  }
});

/**
 * Obtener estudiantes con filtro por rol
 * GET /api/admin/students
 * @requires Autenticación y rol SuperAdministrativos, superuser, aliado_comercial o institucion_educativa
 * @returns Lista de estudiantes filtrada por rol
 */
router.get('/students', authenticateToken, requireRole(['SuperAdministrativos', 'superuser', 'aliado_comercial', 'institucion_educativa']), filterDataByRole, async (req, res) => {
  try {
    let studentsList;

    if (req.dataFilter && (req.dataFilter.allyId || req.dataFilter.universityId)) {
      // Aplicar filtros según el rol del usuario
      if (req.dataFilter.allyId) {
        studentsList = await storage.getAllStudentsWithDocuments(req.dataFilter.allyId);
      } else if (req.dataFilter.universityId) {
        studentsList = await storage.getAllStudentsWithDocumentsByUniversity(req.dataFilter.universityId);
      } else {
        studentsList = await storage.getAllStudentsWithDocuments();
      }
    } else {
      // Para admin y superuser, obtener todos los estudiantes
      studentsList = await storage.getAllStudentsWithDocuments();
    }

    res.json(studentsList);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
});

/**
 * Obtener documentos con filtro por rol
 * GET /api/admin/documents
 * @requires Autenticación y rol SuperAdministrativos, superuser, aliado_comercial o institucion_educativa
 * @returns Lista de documentos filtrada por rol
 */
router.get('/documents', authenticateToken, requireRole(['SuperAdministrativos', 'superuser', 'aliado_comercial', 'institucion_educativa']), filterDataByRole, async (req, res) => {
  try {
    let documentsList;

    if (req.dataFilter && (req.dataFilter.allyId || req.dataFilter.universityId)) {
      // Aplicar filtros según el rol del usuario
      if (req.dataFilter.allyId) {
        documentsList = await storage.getDocumentsWithStudents(req.dataFilter.allyId);
      } else if (req.dataFilter.universityId) {
        documentsList = await storage.getDocumentsWithStudentsByUniversity(req.dataFilter.universityId);
      } else {
        documentsList = await storage.getDocumentsWithStudents();
      }
    } else {
      // Para admin y superuser, obtener todos los documentos
      documentsList = await storage.getDocumentsWithStudents();
    }

    res.json(documentsList);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
});

export default router; 