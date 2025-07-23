// Load environment variables first
import './config';

import express, { type Request, Response, NextFunction } from "express";
import cors from 'cors';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import requestsRouter from './routes/requests';
import documentsRouter from './routes/documents';
import universitiesRouter from './routes/universities';
import universityDataRouter from './routes/university-data';
import paymentsRouter from './routes/payments';
import { db } from './db';
import authRouter from './routes/auth';
import profilesRouter from './routes/profiles';
import { setupAuth } from "./auth";
import { fileStorage } from './fileStorage.js';

const app = express();

// Configuración de CORS
if (process.env.NODE_ENV === 'development') {
  // Permitir cualquier origen en desarrollo
  app.use(cors({ origin: true, credentials: true }));
} else {
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://tu-dominio.com'
  ];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar autenticación ANTES de registrar las rutas
setupAuth(app);
app.use('/api/requests', requestsRouter);
app.use('/api/universities', universitiesRouter);
app.use('/api/university-data', universityDataRouter);
app.use('/api/profiles', profilesRouter);
app.use('/api/payments', paymentsRouter);

// Rutas de documentos (sin middleware de JSON para permitir multipart)
app.use('/api/documents', (req, res, next) => {
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    // Para peticiones multipart, saltar el parsing de JSON
    return next();
  }
  next();
}, documentsRouter);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Inicializar sistema de almacenamiento
  await fileStorage.initialize();
  console.log('✅ Sistema de almacenamiento inicializado correctamente');

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 3000
  // this serves both the API and the client.
  const port = 3000;
  server.listen({
    port,
    host: "0.0.0.0", // Escuchar en todas las interfaces de red
  }, () => {
    log(`serving on port ${port}`);
    log(`Local: http://localhost:${port}`);
    log(`Network: http://192.168.10.7:${port}`);
  });
})();
