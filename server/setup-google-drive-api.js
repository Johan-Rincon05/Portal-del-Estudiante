/**
 * Script de configuración para Google Drive API
 * 
 * Este script te ayuda a:
 * 1. Verificar que la API de Google Drive esté habilitada
 * 2. Configurar los permisos necesarios
 * 3. Probar la conexión
 */

import { testConnection } from './services/googleDrive.js';

async function setupGoogleDriveAPI() {
  console.log('🔧 Configuración de Google Drive API\n');

  console.log('📋 Pasos necesarios para configurar Google Drive API:\n');

  console.log('1️⃣ Habilitar la API de Google Drive:');
  console.log('   - Ve a: https://console.cloud.google.com/');
  console.log('   - Selecciona tu proyecto: portal-del-estudiante-464914');
  console.log('   - Ve a "APIs y servicios" > "Biblioteca"');
  console.log('   - Busca "Google Drive API"');
  console.log('   - Haz clic en "Habilitar"\n');

  console.log('2️⃣ Verificar permisos de la cuenta de servicio:');
  console.log('   - Ve a: https://console.cloud.google.com/iam-admin/serviceaccounts');
  console.log('   - Busca: storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com');
  console.log('   - Verifica que tenga el rol "Editor" o permisos de Drive\n');

  console.log('3️⃣ Configurar permisos de la carpeta:');
  console.log('   - Ve a: https://drive.google.com/drive/folders/1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G');
  console.log('   - Haz clic derecho en la carpeta > "Compartir"');
  console.log('   - Agrega: storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com');
  console.log('   - Dale permisos de "Editor"\n');

  console.log('4️⃣ Probar la conexión:');
  console.log('   - Ejecuta: npm run test:google-drive\n');

  console.log('🔍 Verificando configuración actual...\n');

  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ ¡Excelente! La configuración está correcta');
      console.log('✅ La API de Google Drive está habilitada');
      console.log('✅ Las credenciales son válidas');
      console.log('✅ Los permisos están configurados correctamente');
    } else {
      console.log('❌ La configuración necesita ajustes');
      console.log('❌ Sigue los pasos anteriores para solucionarlo');
    }

  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message);
    console.log('🔧 Sigue los pasos de configuración anteriores');
  }
}

// Ejecutar la configuración
setupGoogleDriveAPI(); 