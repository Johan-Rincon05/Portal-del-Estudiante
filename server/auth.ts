import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from 'bcrypt';
import { scrypt } from 'crypto';
import { promisify } from 'util';
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import express from 'express';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Si el hash almacenado contiene un punto, es un hash de scrypt
    if (stored.includes('.')) {
      const [hash, salt] = stored.split('.');
      const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
      return buf.toString('hex') === hash;
    }
    // Si no, es un hash de bcrypt
    return await bcrypt.compare(supplied, stored);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_jwt',
    resave: true,
    saveUninitialized: true,
    store: storage.sessionStore,
    name: 'sessionId',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        console.log('Intento de inicio de sesión para usuario:', username);
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          console.log('Usuario no encontrado:', username);
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        console.log('Resultado de comparación de contraseña:', passwordMatch);
        
        if (!passwordMatch) {
          console.log('Contraseña incorrecta para usuario:', username);
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        
        console.log('Inicio de sesión exitoso para usuario:', username);
        return done(null, user);
      } catch (error) {
        console.error('Error en la estrategia de autenticación:', error);
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    console.log('Serializando usuario:', user.id);
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      console.log('Deserializando usuario:', id);
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      console.error('Error al deserializar usuario:', error);
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('Intento de inicio de sesión:', req.body);
    if (!req.body || !req.body.username || !req.body.password) {
      return res.status(400).json({ 
        error: 'Se requieren usuario y contraseña' 
      });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Error de autenticación:", err);
        return res.status(500).json({ 
          error: 'Error interno del servidor' 
        });
      }

      if (!user) {
        console.log('Autenticación fallida:', info?.message);
        return res.status(401).json({ 
          error: info?.message || 'Credenciales inválidas' 
        });
      }

      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("Error al iniciar sesión:", loginErr);
          return res.status(500).json({ 
            error: 'Error al iniciar sesión' 
          });
        }

        console.log('Inicio de sesión exitoso para usuario:', user.username);
        res.json({
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    })(req, res, next);
  });

  app.post("/api/register", async (req, res) => {
    try {
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ 
          error: 'Se requieren usuario y contraseña' 
        });
      }

      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ 
          error: 'El nombre de usuario ya existe' 
        });
      }

      const hashedPassword = await hashPassword(req.body.password);
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword
      });

      req.login(user, (err) => {
        if (err) {
          console.error("Error al iniciar sesión después del registro:", err);
          return res.status(500).json({ 
            error: 'Error al iniciar sesión' 
          });
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          role: user.role
        });
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      res.status(500).json({ 
        error: 'Error al registrar el usuario' 
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Error al cerrar sesión:", err);
        return res.status(500).json({ 
          error: 'Error al cerrar sesión' 
        });
      }
      res.json({ message: 'Sesión cerrada exitosamente' });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        error: 'No autenticado' 
      });
    }
    res.json(req.user);
  });
}