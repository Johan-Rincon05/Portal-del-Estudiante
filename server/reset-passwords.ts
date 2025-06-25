import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Configuración de la conexión
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/portal_estudiante';
const client = postgres(connectionString);
const db = drizzle(client);

async function resetPasswords() {
  try {
    // Obtener todos los usuarios
    const allUsers = await db.select().from(users);
    console.log(`Encontrados ${allUsers.length} usuarios para actualizar`);

    // Contraseñas específicas para cada tipo de usuario
    const passwords = {
      estudiante: 'estudiante123',
      admin: 'admin123',
      superuser: 'superuser123'
    };

    // Actualizar cada usuario con su contraseña específica
    for (const user of allUsers) {
      // Determinar la contraseña basada en el rol
      let newPassword = 'password123'; // Contraseña por defecto
      
      if (user.username.includes('estudiante')) {
        newPassword = passwords.estudiante;
      } else if (user.username.includes('admin')) {
        newPassword = passwords.admin;
      } else if (user.username.includes('superuser')) {
        newPassword = passwords.superuser;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Verificar que el hash funciona
      const verifyHash = await bcrypt.compare(newPassword, hashedPassword);
      console.log(`Usuario ${user.username}:`);
      console.log(`- Rol: ${user.role}`);
      console.log(`- Contraseña: ${newPassword}`);
      console.log(`- Hash generado: ${hashedPassword}`);
      console.log(`- Verificación del hash: ${verifyHash}`);
      
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id));
      
      // Verificar que el hash se guardó correctamente
      const updatedUser = await db.select().from(users).where(eq(users.id, user.id)).then(rows => rows[0]);
      const verifyStoredHash = await bcrypt.compare(newPassword, updatedUser.password);
      console.log(`- Verificación del hash guardado: ${verifyStoredHash}`);
      console.log('---');
    }

    console.log('Todas las contraseñas han sido actualizadas exitosamente');
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