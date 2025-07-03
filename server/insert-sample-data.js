/**
 * Script para insertar datos de ejemplo en la base de datos
 * Este script agrega perfiles, documentos y pagos de ejemplo para que el dashboard funcione
 */

import { storage } from './storage.js';

async function insertSampleData() {
  try {
    console.log('Iniciando inserción de datos de ejemplo...');

    // Verificar si ya existen perfiles
    const existingProfiles = await storage.getAllUsersWithProfiles();
    const studentsWithProfiles = existingProfiles.filter(user => user.role === 'estudiante' && user.profile);
    
    if (studentsWithProfiles.length > 0) {
      console.log('Ya existen estudiantes con perfiles en la base de datos. Saltando inserción...');
      return;
    }

    // Crear perfil para estudiante1 (usuario ID 10)
    const profileData = {
      userId: 10,
      fullName: 'Juan Carlos Pérez González',
      email: 'estudiante1@example.com',
      documentType: 'CC',
      documentNumber: '1234567890',
      birthDate: new Date('2000-05-15'),
      birthPlace: 'Bogotá',
      personalEmail: 'juan.perez@email.com',
      icfesAc: 'A123456789',
      phone: '3001234567',
      city: 'Bogotá',
      address: 'Calle 123 #45-67',
      neighborhood: 'Chapinero',
      locality: 'Chapinero',
      socialStratum: 3,
      bloodType: 'O+',
      conflictVictim: false,
      maritalStatus: 'Soltero',
      enrollmentStage: 'documentacion_completa'
    };

    const newProfile = await storage.createProfile(profileData);
    console.log('Perfil creado para estudiante1');

    // Crear documentos de ejemplo
    const documentsData = [
      { userId: 10, type: 'cedula', name: 'Cédula de Ciudadanía - Juan Pérez.pdf', path: 'cedula_juan_perez.pdf', status: 'aprobado', reviewedBy: 9 },
      { userId: 10, type: 'diploma', name: 'Diploma de Bachiller - Juan Pérez.pdf', path: 'diploma_juan_perez.pdf', status: 'aprobado', reviewedBy: 9 },
      { userId: 10, type: 'acta', name: 'Acta de Grado - Juan Pérez.pdf', path: 'acta_juan_perez.pdf', status: 'pendiente' }
    ];

    for (const docData of documentsData) {
      await storage.createDocument(docData);
    }
    console.log('Documentos creados para estudiante1');

    // Crear pagos de ejemplo
    const paymentsData = [
      { userId: 10, paymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), paymentMethod: 'transferencia', amount: 1500000, giftReceived: false, documentsStatus: 'Pago de matrícula' },
      { userId: 10, paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), paymentMethod: 'efectivo', amount: 500000, giftReceived: false, documentsStatus: 'Pago de cuota' }
    ];

    for (const paymentData of paymentsData) {
      await storage.createPayment(paymentData);
    }
    console.log('Pagos creados para estudiante1');

    // Crear solicitud de ejemplo
    const requestData = {
      userId: 10,
      subject: 'Consulta sobre horarios',
      message: 'Buenos días, quisiera consultar los horarios disponibles para el programa de Sistemas Informáticos.',
      status: 'pendiente'
    };

    await storage.createRequest(requestData);
    console.log('Solicitud creada para estudiante1');

    console.log('✅ Datos de ejemplo insertados correctamente');
    console.log('�� Ahora el dashboard debería mostrar datos reales');

  } catch (error) {
    console.error('❌ Error al insertar datos de ejemplo:', error);
  }
}

// Ejecutar el script
insertSampleData();

/**
 * Script para poblar la tabla profiles solo para usuarios existentes sin perfil
 */
async function poblarProfilesParaUsuariosExistentes() {
  try {
    console.log('Buscando usuarios estudiantes sin perfil...');
    // Obtener todos los usuarios con rol estudiante
    const allUsers = await storage.getAllUsers();
    // Obtener todos los perfiles existentes
    const allProfiles = await storage.getAllUsersWithProfiles();
    // IDs de usuarios que ya tienen perfil
    const userIdsConPerfil = allProfiles.filter(u => u.profile).map(u => u.id);
    // Filtrar estudiantes sin perfil
    const estudiantesSinPerfil = allUsers.filter(u => u.role === 'estudiante' && !userIdsConPerfil.includes(u.id));

    if (estudiantesSinPerfil.length === 0) {
      console.log('Todos los estudiantes ya tienen perfil. Nada que hacer.');
      return;
    }

    for (const user of estudiantesSinPerfil) {
      // Datos ficticios pero válidos
      const profileData = {
        userId: user.id,
        fullName: `Estudiante ${user.username}`,
        email: user.email,
        documentType: 'CC',
        documentNumber: String(1000000000 + user.id),
        birthDate: new Date('2000-01-01'),
        birthPlace: 'Ciudad',
        personalEmail: user.email,
        icfesAc: `ICFES${user.id}`,
        phone: '3000000000',
        city: 'Ciudad',
        address: 'Dirección genérica',
        neighborhood: 'Barrio',
        locality: 'Localidad',
        socialStratum: 3,
        bloodType: 'O+',
        conflictVictim: false,
        maritalStatus: 'Soltero',
        enrollmentStage: 'documentacion_pendiente'
      };
      await storage.createProfile(profileData);
      console.log(`Perfil creado para usuario ${user.username} (ID: ${user.id})`);
    }
    console.log('✅ Perfiles creados para todos los estudiantes sin perfil.');
  } catch (error) {
    console.error('❌ Error al poblar perfiles:', error);
  }
}

poblarProfilesParaUsuariosExistentes(); 