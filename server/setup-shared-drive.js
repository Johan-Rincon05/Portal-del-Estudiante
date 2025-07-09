/**
 * Script para configurar una Shared Drive en Google Drive
 * Las Shared Drives permiten almacenamiento ilimitado para cuentas de servicio
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Configurar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('[DEBUG] Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

async function setupSharedDrive() {
  try {
    console.log('🚀 Configurando Shared Drive para Google Drive...\n');

    // Verificar variables de entorno
    console.log('1️⃣ Verificando configuración...');
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS no está configurado');
    }
    
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('   ✅ Credenciales cargadas');
    console.log('   client_email:', credentials.client_email);

    // Importar googleapis
    console.log('\n2️⃣ Importando googleapis...');
    const { google } = await import('googleapis');

    // Crear JWT
    console.log('\n3️⃣ Creando JWT...');
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });

    await auth.authorize();
    console.log('   ✅ JWT autorizado');

    // Crear cliente de Drive
    console.log('\n4️⃣ Creando cliente de Drive...');
    const drive = google.drive({ version: 'v3', auth });

    // Crear Shared Drive
    console.log('\n5️⃣ Creando Shared Drive...');
    const sharedDriveResponse = await drive.drives.create({
      requestBody: {
        name: 'Portal del Estudiante - Documentos',
        description: 'Unidad compartida para almacenar documentos del Portal del Estudiante'
      }
    });

    const sharedDriveId = sharedDriveResponse.data.id;
    console.log('   ✅ Shared Drive creado');
    console.log('   ID:', sharedDriveId);
    console.log('   Nombre:', sharedDriveResponse.data.name);

    // Crear carpeta dentro de la Shared Drive
    console.log('\n6️⃣ Creando carpeta de documentos...');
    const folderResponse = await drive.files.create({
      requestBody: {
        name: 'Documentos',
        mimeType: 'application/vnd.google-apps.folder',
        parents: [sharedDriveId]
      },
      supportsAllDrives: true,
      supportsTeamDrives: true
    });

    const folderId = folderResponse.data.id;
    console.log('   ✅ Carpeta creada');
    console.log('   ID:', folderId);
    console.log('   Nombre:', folderResponse.data.name);

    // Actualizar archivo .env
    console.log('\n7️⃣ Actualizando archivo .env...');
    const fs = await import('fs');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const updatedEnvContent = envContent.replace(
      /DRIVE_FOLDER_ID=.*/,
      `DRIVE_FOLDER_ID=${folderId}`
    );
    
    fs.writeFileSync(envPath, updatedEnvContent);
    console.log('   ✅ Archivo .env actualizado');

    console.log('\n🎉 ¡Shared Drive configurado exitosamente!');
    console.log('📋 Resumen:');
    console.log('   ✅ Shared Drive creado:', sharedDriveId);
    console.log('   ✅ Carpeta de documentos creada:', folderId);
    console.log('   ✅ Variables de entorno actualizadas');
    console.log('\n🔗 Enlaces:');
    console.log(`   Shared Drive: https://drive.google.com/drive/folders/${sharedDriveId}`);
    console.log(`   Carpeta documentos: https://drive.google.com/drive/folders/${folderId}`);

  } catch (error) {
    console.error('\n❌ Error durante la configuración:', error.message);
    console.error('🔍 Detalles:', error);
    
    if (error.message.includes('insufficient permissions')) {
      console.log('\n💡 Solución: La cuenta de servicio necesita permisos de administrador para crear Shared Drives');
      console.log('   - Ve a Google Workspace Admin Console');
      console.log('   - Habilita la API de Shared Drives');
      console.log('   - Dale permisos de administrador a la cuenta de servicio');
    } else if (error.message.includes('quota exceeded')) {
      console.log('\n💡 Solución: Has alcanzado el límite de Shared Drives');
    }
    
    process.exit(1);
  }
}

// Ejecutar la configuración
setupSharedDrive(); 