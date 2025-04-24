import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Configuración de la conexión
const connectionString = 'postgres://postgres:postgres@localhost:5432/websocketchat';
const client = postgres(connectionString);
const db = drizzle(client);

const scryptAsync = promisify(scrypt);

async function generateHash(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function resetPasswords() {
  try {
    // Generar hashes para las nuevas contraseñas
    const estudianteHash = await generateHash('estudiante123');
    const adminHash = await generateHash('admin123');
    const superadminHash = await generateHash('superadmin123');

    // Actualizar contraseñas en la base de datos
    await db.update(users)
      .set({ password: estudianteHash })
      .where(eq(users.username, 'estudiante'));

    await db.update(users)
      .set({ password: adminHash })
      .where(eq(users.username, 'admin'));

    await db.update(users)
      .set({ password: superadminHash })
      .where(eq(users.username, 'superadmin'));

    console.log('Contraseñas actualizadas exitosamente');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar las contraseñas:', error);
    await client.end();
    process.exit(1);
  }
}

// Ejecutar el script
resetPasswords(); 