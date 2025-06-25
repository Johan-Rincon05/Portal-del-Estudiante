import { storage } from './storage';
import { hashPassword } from './auth';
import { DEFAULT_ROLES } from '@shared/schema';

async function initializeExampleUsers() {
  try {
    console.log('Iniciando creación de usuarios de ejemplo...');

    // Crear superusuario
    const superuserPassword = await hashPassword('superuser123');
    await storage.createUser({
      username: 'superuser1',
      email: 'superuser1@example.com',
      password: superuserPassword,
      role: 'superuser',
      isActive: true,
      permissions: DEFAULT_ROLES.superuser.permissions
    });
    console.log('Superusuario creado exitosamente');

    // Crear administrador
    const adminPassword = await hashPassword('admin123');
    await storage.createUser({
      username: 'admin1',
      email: 'admin1@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      permissions: DEFAULT_ROLES.admin.permissions
    });
    console.log('Administrador creado exitosamente');

    // Crear estudiante
    const studentPassword = await hashPassword('estudiante123');
    await storage.createUser({
      username: 'estudiante1',
      email: 'estudiante1@example.com',
      password: studentPassword,
      role: 'estudiante',
      isActive: true,
      permissions: DEFAULT_ROLES.estudiante.permissions
    });
    console.log('Estudiante creado exitosamente');

    console.log('Todos los usuarios de ejemplo han sido creados exitosamente');
  } catch (error) {
    console.error('Error al crear usuarios de ejemplo:', error);
  }
}

// Ejecutar la inicialización
initializeExampleUsers(); 