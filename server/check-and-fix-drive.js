/**
 * Script para verificar y arreglar la configuración de Google Drive
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

async function checkAndFixDrive() {
  try {
    console.log('🔍 Verificando configuración de Google Drive...\n');

    // Verificar variables de entorno
    console.log('1️⃣ Verificando variables de entorno...');
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS no está configurado');
    }
    
    if (!process.env.DRIVE_FOLDER_ID) {
      throw new Error('DRIVE_FOLDER_ID no está configurado');
    }

    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('   ✅ Credenciales cargadas');
    console.log('   client_email:', credentials.client_email);
    console.log('   DRIVE_FOLDER_ID:', process.env.DRIVE_FOLDER_ID);

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

    // Verificar la carpeta actual
    console.log('\n5️⃣ Verificando carpeta actual...');
    try {
      const folderResponse = await drive.files.get({
        fileId: process.env.DRIVE_FOLDER_ID,
        fields: 'id, name, mimeType, parents, driveId'
      });

      console.log('   ✅ Carpeta encontrada');
      console.log('   ID:', folderResponse.data.id);
      console.log('   Nombre:', folderResponse.data.name);
      console.log('   Tipo:', folderResponse.data.mimeType);
      console.log('   Drive ID:', folderResponse.data.driveId || 'No es Shared Drive');

      if (!folderResponse.data.driveId) {
        console.log('\n⚠️  La carpeta NO es una Shared Drive');
        console.log('   Esto puede causar problemas de cuota de almacenamiento');
        
        console.log('\n📋 SOLUCIÓN MANUAL:');
        console.log('1. Ve a https://drive.google.com');
        console.log('2. Busca la carpeta:', folderResponse.data.name);
        console.log('3. Haz clic derecho en la carpeta');
        console.log('4. Selecciona "Convertir en unidad compartida"');
        console.log('5. Dale un nombre como "Portal del Estudiante"');
        console.log('6. Copia el nuevo ID de la carpeta');
        console.log('7. Actualiza DRIVE_FOLDER_ID en el archivo .env');
        
        console.log('\n🔗 Enlace directo a la carpeta:');
        console.log(`   https://drive.google.com/drive/folders/${process.env.DRIVE_FOLDER_ID}`);
        
      } else {
        console.log('\n✅ La carpeta ES una Shared Drive');
        console.log('   Drive ID:', folderResponse.data.driveId);
        console.log('   ✅ Configuración correcta');
      }

    } catch (folderError) {
      console.log('   ❌ Error al acceder a la carpeta:', folderError.message);
      
      if (folderError.code === 404) {
        console.log('\n💡 La carpeta no existe o no tienes permisos');
        console.log('📋 SOLUCIÓN:');
        console.log('1. Crea una nueva carpeta en Google Drive');
        console.log('2. Conviértela en unidad compartida');
        console.log('3. Compártela con:', credentials.client_email);
        console.log('4. Actualiza DRIVE_FOLDER_ID en el archivo .env');
      }
    }

    // Probar subida de archivo pequeño
    console.log('\n6️⃣ Probando subida de archivo...');
    try {
      const testContent = 'Archivo de prueba para verificar permisos';
      const testBuffer = Buffer.from(testContent, 'utf8');
      
      const uploadResponse = await drive.files.create({
        requestBody: {
          name: `test-${Date.now()}.txt`,
          parents: [process.env.DRIVE_FOLDER_ID]
        },
        media: {
          mimeType: 'text/plain',
          body: testBuffer
        },
        supportsAllDrives: true,
        supportsTeamDrives: true
      });

      console.log('   ✅ Archivo de prueba subido exitosamente');
      console.log('   ID:', uploadResponse.data.id);
      console.log('   Nombre:', uploadResponse.data.name);

      // Eliminar archivo de prueba
      await drive.files.delete({
        fileId: uploadResponse.data.id,
        supportsAllDrives: true,
        supportsTeamDrives: true
      });
      console.log('   ✅ Archivo de prueba eliminado');

    } catch (uploadError) {
      console.log('   ❌ Error al subir archivo:', uploadError.message);
      
      if (uploadError.message.includes('storage quota')) {
        console.log('\n💡 PROBLEMA: Cuota de almacenamiento agotada');
        console.log('📋 SOLUCIÓN: Convierte la carpeta en Shared Drive');
      } else if (uploadError.message.includes('permission')) {
        console.log('\n💡 PROBLEMA: Permisos insuficientes');
        console.log('📋 SOLUCIÓN: Comparte la carpeta con la cuenta de servicio');
      }
    }

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles:', error);
    process.exit(1);
  }
}

// Ejecutar la verificación
checkAndFixDrive(); 