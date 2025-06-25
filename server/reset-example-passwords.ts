import { storage } from './storage';
import { hashPassword } from './auth';

async function resetExamplePasswords() {
  try {
    console.log('Iniciando restablecimiento de contraseñas...');

    // Restablecer contraseña del superusuario
    const superuser = await storage.getUserByUsername('superuser1');
    if (superuser) {
      const superuserPassword = await hashPassword('superuser123');
      await storage.updateUser(superuser.id, { password: superuserPassword });
      console.log('Contraseña del superusuario actualizada');
    }

    // Restablecer contraseña del administrador
    const admin = await storage.getUserByUsername('admin1');
    if (admin) {
      const adminPassword = await hashPassword('admin123');
      await storage.updateUser(admin.id, { password: adminPassword });
      console.log('Contraseña del administrador actualizada');
    }

    // Restablecer contraseña del estudiante
    const student = await storage.getUserByUsername('estudiante1');
    if (student) {
      const studentPassword = await hashPassword('estudiante123');
      await storage.updateUser(student.id, { password: studentPassword });
      console.log('Contraseña del estudiante actualizada');
    }

    console.log('Todas las contraseñas han sido restablecidas exitosamente');
  } catch (error) {
    console.error('Error al restablecer contraseñas:', error);
  }
}

// Ejecutar el restablecimiento
resetExamplePasswords(); 