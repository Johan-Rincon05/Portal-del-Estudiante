import { Router } from 'express';
import passport from 'passport';
import { generateToken, hashPassword } from '../auth';
import { storage } from '../storage';
import { z } from 'zod';

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
  role: z.enum(['estudiante', 'admin', 'superuser']).optional()
});

// Ruta de login
router.post('/login', (req, res, next) => {
  try {
    const { username, password } = loginSchema.parse(req.body);
    
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: 'Error interno del servidor' });
      }

      if (!user) {
        return res.status(401).json({ error: info?.message || 'Credenciales inválidas' });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ error: 'Error al iniciar sesión' });
        }

        const token = generateToken(user);
        res.json({
          id: user.id,
          username: user.username,
          role: user.role,
          token
        });
      });
    })(req, res, next);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de registro
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
      isActive: true,
      permissions: {}
    });

    // Generar token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
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
      return res.status(400).json({ error: 'Datos inválidos', details: error.errors });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta de logout
router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ message: 'Sesión cerrada exitosamente' });
  });
});

// Ruta para verificar el estado de la sesión
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'No autenticado' });
  }
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  });
});

export default router; 