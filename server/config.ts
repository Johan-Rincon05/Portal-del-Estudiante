import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('[DEBUG] Loading environment variables from:', envPath);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[ERROR] Failed to load .env file:', result.error);
  process.exit(1);
}

console.log('[DEBUG] Environment variables loaded successfully');

// Configuración de la aplicación
export const config = {
  // Configuración de la base de datos
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/portal_estudiante',
  },

  // Configuración del servidor
  server: {
    port: parseInt(process.env.PORT || '3001'),
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
  },

  // Configuración de JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  // Configuración de email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@portalestudiante.com',
  },

  // Configuración del frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Configuración de archivos
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },

  // Configuración de WebSockets
  websocket: {
    port: parseInt(process.env.WS_PORT || '3002'),
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  },
};