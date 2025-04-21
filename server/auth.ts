import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    if (!stored || !stored.includes(".")) {
      console.error("Invalid stored password format");
      return false;
    }
    
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password components");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.JWT_SECRET || 'tu_clave_secreta_jwt',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    name: 'sessionId',
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax'
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Usuario no encontrado' });
        }
        
        const passwordMatch = await comparePasswords(password, user.password);
        
        if (!passwordMatch) {
          return done(null, false, { message: 'Contraseña incorrecta' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
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