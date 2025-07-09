/**
 * Script de verificación paso a paso para Google Drive
 * 
 * Este script te guía a través de cada paso necesario para configurar Google Drive
 */

import { testConnection } from './services/googleDrive.js';

async function verifyGoogleDriveSetup() {
  console.log('🔍 Verificación paso a paso de Google Drive API\n');

  console.log('📋 PASOS REQUERIDOS:\n');

  console.log('1️⃣ HABILITAR GOOGLE DRIVE API:');
  console.log('   🔗 Enlace directo: https://console.cloud.google.com/apis/library/drive.googleapis.com');
  console.log('   📝 Instrucciones:');
  console.log('      - Haz clic en "HABILITAR"');
  console.log('      - Espera unos segundos a que se active\n');

  console.log('2️⃣ VERIFICAR CUENTA DE SERVICIO:');
  console.log('   🔗 Enlace directo: https://console.cloud.google.com/iam-admin/serviceaccounts');
  console.log('   📝 Busca: storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com');
  console.log('   📝 Verifica que tenga rol "Editor"\n');

  console.log('3️⃣ CONFIGURAR PERMISOS DE CARPETA:');
  console.log('   🔗 Enlace directo: https://drive.google.com/drive/folders/1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G');
  console.log('   📝 Instrucciones:');
  console.log('      - Haz clic derecho en la carpeta');
  console.log('      - Selecciona "Compartir"');
  console.log('      - Agrega: storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com');
  console.log('      - Dale permisos de "Editor"\n');

  console.log('4️⃣ PROBAR CONEXIÓN:');
  console.log('   💻 Comando: npm run test:google-drive\n');

  console.log('⏳ Verificando configuración actual...\n');

  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('🎉 ¡EXCELENTE! Todo está configurado correctamente');
      console.log('✅ La API de Google Drive está habilitada');
      console.log('✅ Las credenciales son válidas');
      console.log('✅ Los permisos están configurados');
      console.log('🚀 El servicio está listo para usar');
    } else {
      console.log('❌ La configuración necesita ajustes');
      console.log('📋 Sigue los pasos anteriores para solucionarlo');
      console.log('💡 El error más común es que la API no esté habilitada');
    }

  } catch (error) {
    console.log('❌ Error durante la verificación:', error.message);
    
    if (error.message.includes('unregistered callers')) {
      console.log('🔧 SOLUCIÓN: La API de Google Drive no está habilitada');
      console.log('   Ve a: https://console.cloud.google.com/apis/library/drive.googleapis.com');
      console.log('   Y haz clic en "HABILITAR"');
    } else if (error.message.includes('Permission denied')) {
      console.log('🔧 SOLUCIÓN: Problema de permisos');
      console.log('   Verifica que la cuenta de servicio tenga acceso a la carpeta');
    } else {
      console.log('🔧 SOLUCIÓN: Revisa los pasos de configuración');
    }
  }

  console.log('\n📞 Si necesitas ayuda adicional:');
  console.log('   - Revisa el archivo: GOOGLE_DRIVE_SERVICE_SETUP.md');
  console.log('   - Ejecuta: npm run setup:google-drive');
}

// Ejecutar verificación
verifyGoogleDriveSetup(); 