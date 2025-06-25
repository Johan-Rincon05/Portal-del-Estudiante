import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from 'dotenv';
import * as schema from '../shared/schema';

// Cargar variables de entorno
config();

console.log('Variables de entorno:', {
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV
});

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Configurar drizzle con el esquema
export const db = drizzle(pool, { schema });

export default db;
