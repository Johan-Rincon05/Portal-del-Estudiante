import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@shared/schema';
import bcrypt from 'bcrypt';

// Configuración de la conexión
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);
const db = drizzle(client);

async function verifyPasswords() {
  try {
    // Obtener todos los usuarios
    const allUsers = await db.select().from(users);
    console.log(`Encontrados ${allUsers.length} usuarios para verificar`);

    // Contraseñas de prueba
    const testPasswords = {
      'superuser1': 'superuser123',
      'admin1': 'admin123',
      'estudiante1': 'estudiante123',
      'johanrincon0538@gmail.com': 'password123'
    };

    // Verificar cada usuario
    for (const user of allUsers) {
      console.log(`\n=== Verificando usuario: ${user.username} ===`);
      console.log('Rol:', user.role);
      console.log('Hash almacenado:', user.password);

      // Verificar con la contraseña de prueba
      const testPassword = testPasswords[user.username as keyof typeof testPasswords];
      if (testPassword) {
        const match = await bcrypt.compare(testPassword, user.password);
        console.log('Contraseña de prueba:', testPassword);
        console.log('¿Coincide con el hash almacenado?:', match);
      } else {
        console.log('No hay contraseña de prueba para este usuario');
      }

      // Generar un nuevo hash para comparar
      const newHash = await bcrypt.hash(testPassword || 'password123', 10);
      console.log('Nuevo hash generado:', newHash);
      console.log('=== Fin de verificación ===\n');
    }

    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('Error al verificar las contraseñas:', error);
    await client.end();
    process.exit(1);
  }
}

// Ejecutar el script
verifyPasswords(); 