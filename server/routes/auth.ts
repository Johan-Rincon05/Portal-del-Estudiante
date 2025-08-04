import { Router } from 'express';
import { generateToken, hashPassword, comparePasswords } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';
import { 
  generateVerificationCode, 
  sendVerificationEmail, 
  sendWelcomeEmail,
  verifyToken as verifyEmailToken 
} from '../utils/email';
import { config } from '../config';

const router = Router();

// Esquema de validación para login
const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// Esquema de validación para registro
const registerSchema = z.object({
  username: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['estudiante', 'SuperAdministrativos', 'superuser']).optional()
});

// Esquema de validación para verificación de email
const verifyEmailSchema = z.object({
  email: z.string().email('Email inválido'),
  code: z.string().length(6, 'El código debe tener 6 dígitos')
});

// Esquema de validación para reenvío de código
const resendCodeSchema = z.object({
  email: z.string().email('Email inválido')
});

// Ruta de login (solo JWT)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }
    const passwordMatch = await comparePasswords(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }
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
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de registro (solo JWT)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = registerSchema.parse(req.body);
    // Verificar si el usuario ya existe
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'El nombre de usuario ya está en uso' });
    }
    // Verificar si el email ya está en uso
    const existingEmail = await storage.getUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }
    // Crear el usuario
    const hashedPassword = await hashPassword(password);
    const user = await storage.createUser({
      username,
      email,
      password: hashedPassword,
      role: role || 'estudiante',
      isActive: false, // Usuario inactivo hasta verificar email
      permissions: {},
      allyId: null,
      universityId: null
    });

    // Generar código de verificación
    const verificationCode = generateVerificationCode();
    
    // Guardar código de verificación en la base de datos
    await storage.saveVerificationCode(user.id, email, verificationCode);

    // Enviar email de verificación
    const emailSent = await sendVerificationEmail(email, username, verificationCode);
    
    if (!emailSent) {
      // Si falla el envío de email, eliminar el usuario creado
      await storage.deleteUser(user.id);
      return res.status(500).json({ error: 'Error al enviar email de verificación' });
    }

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Revisa tu email para verificar tu cuenta.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: false
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de logout (solo frontend elimina el token)
router.post('/logout', (_req, res) => {
  res.json({ message: 'Sesión cerrada exitosamente' });
});

// Ruta para verificar email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = verifyEmailSchema.parse(req.body);
    
    // Verificar el código
    const isValidCode = await storage.verifyEmailCode(email, code);
    
    if (!isValidCode) {
      return res.status(400).json({ error: 'Código de verificación inválido o expirado' });
    }

    // Activar el usuario
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await storage.updateUser(user.id, { isActive: true });
    
    // Eliminar el código de verificación usado
    await storage.deleteVerificationCode(email);

    // Enviar email de bienvenida
    await sendWelcomeEmail(email, user.username);

    // Generar token de acceso
    const token = generateToken(user);

    res.json({
      message: 'Email verificado exitosamente',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: true
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error en verificación de email:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para reenviar código de verificación
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = resendCodeSchema.parse(req.body);
    
    // Verificar que el usuario existe y no está verificado
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (user.isActive) {
      return res.status(400).json({ error: 'El usuario ya está verificado' });
    }

    // Generar nuevo código de verificación
    const verificationCode = generateVerificationCode();
    
    // Guardar nuevo código
    await storage.saveVerificationCode(user.id, email, verificationCode);

    // Enviar nuevo email
    const emailSent = await sendVerificationEmail(email, user.username, verificationCode);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Error al enviar email de verificación' });
    }

    res.json({
      message: 'Código de verificación reenviado exitosamente'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    console.error('Error al reenviar código:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener información del usuario autenticado (requiere JWT)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }
    const decoded = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura') as { id: number };
    const user = await storage.getUser(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router; 