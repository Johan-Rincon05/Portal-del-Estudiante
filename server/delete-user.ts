import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Configuración de la conexión
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);
const db = drizzle(client);

async function deleteUser() {
  try {
    // Eliminar el usuario específico
    const result = await db.delete(users)
      .where(eq(users.username, 'johanrincon0538@gmail.com'))
      .returning();

    console.log('Usuario eliminado:', result);

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    await client.end();
    process.exit(1);
  }
}

// Ejecutar el script
deleteUser(); 