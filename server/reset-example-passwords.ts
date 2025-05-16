import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Configuración de la conexión
const connectionString = 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);
const db = drizzle(client);

async function resetExamplePasswords() {
  try {
    const password = 'password123';
    // Usar un salt fijo para que el hash sea reproducible
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Hash generado:', hash);

    // Actualizar contraseñas para los usuarios de ejemplo
    await db.update(users)
      .set({ password: hash })
      .where(eq(users.username, 'estudiante1'));

    await db.update(users)
      .set({ password: hash })
      .where(eq(users.username, 'admin1'));

    await db.update(users)
      .set({ password: hash })
      .where(eq(users.username, 'superuser1'));

    console.log('Contraseñas actualizadas exitosamente');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar las contraseñas:', error);
    await client.end();
    process.exit(1);
  }
}

resetExamplePasswords(); 