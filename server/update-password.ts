import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function updatePassword(username: string, newPassword: string) {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    // Actualizar la contraseña en la base de datos
    const result = await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.username, username))
      .returning();
    
    if (result.length === 0) {
      console.error(`Usuario ${username} no encontrado`);
      return;
    }
    
    console.log(`Contraseña actualizada para ${username}`);
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
  }
}

// Actualizar contraseñas para usuarios de prueba
async function main() {
  await updatePassword('admin', 'password123');
  await updatePassword('estudiante', 'password123');
  console.log('Contraseñas actualizadas correctamente');
  process.exit(0);
}

main();