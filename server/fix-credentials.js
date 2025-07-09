/**
 * Script para verificar y corregir las credenciales de Google Drive
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Configurar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('[DEBUG] Loading environment variables from:', envPath);
dotenv.config({ path: envPath });

async function fixCredentials() {
  try {
    console.log('🔧 Verificando y corrigiendo credenciales de Google Drive...\n');

    // Verificar que existe GOOGLE_CREDENTIALS
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS no está configurado');
    }

    // Parsear credenciales
    console.log('1️⃣ Parseando credenciales actuales...');
    let credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    
    console.log('   client_email:', credentials.client_email);
    console.log('   project_id:', credentials.project_id);
    console.log('   private_key length:', credentials.private_key?.length);

    // Verificar si la clave privada necesita corrección
    if (credentials.private_key && credentials.private_key.includes('\\n')) {
      console.log('\n2️⃣ Corrigiendo formato de clave privada...');
      
      // Reemplazar \\n con \n real
      credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
      
      console.log('   Clave privada corregida');
      console.log('   Nuevo length:', credentials.private_key.length);
      console.log('   Empieza con:', credentials.private_key.substring(0, 50));
    }

    // Probar la autenticación
    console.log('\n3️⃣ Probando autenticación...');
    const { google } = await import('googleapis');

    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/drive']
    );

    await auth.authorize();
    console.log('✅ Autenticación exitosa');

    // Crear cliente de Drive y probar acceso
    console.log('\n4️⃣ Probando acceso a Google Drive...');
    const drive = google.drive({ version: 'v3', auth });

    if (process.env.DRIVE_FOLDER_ID) {
      const folderResponse = await drive.files.get({
        fileId: process.env.DRIVE_FOLDER_ID,
        fields: 'id, name, mimeType'
      });
      console.log('✅ Acceso a carpeta confirmado:', folderResponse.data.name);
    }

    // Si llegamos aquí, las credenciales funcionan
    console.log('\n🎉 ¡Credenciales funcionando correctamente!');
    
    // Actualizar el archivo .env si fue necesario corregir
    if (process.env.GOOGLE_CREDENTIALS !== JSON.stringify(credentials)) {
      console.log('\n5️⃣ Actualizando archivo .env...');
      
      // Leer el archivo .env actual
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Reemplazar la línea de GOOGLE_CREDENTIALS
      const updatedEnvContent = envContent.replace(
        /GOOGLE_CREDENTIALS=.*/,
        `GOOGLE_CREDENTIALS=${JSON.stringify(credentials)}`
      );
      
      // Escribir el archivo actualizado
      fs.writeFileSync(envPath, updatedEnvContent);
      
      console.log('✅ Archivo .env actualizado con credenciales corregidas');
    }

    console.log('\n📋 Resumen:');
    console.log('   ✅ Credenciales válidas');
    console.log('   ✅ Autenticación exitosa');
    console.log('   ✅ Acceso a Google Drive confirmado');
    if (process.env.GOOGLE_CREDENTIALS !== JSON.stringify(credentials)) {
      console.log('   ✅ Archivo .env actualizado');
    }

  } catch (error) {
    console.error('\n❌ Error durante la verificación:', error.message);
    console.error('🔍 Detalles:', error);
    
    if (error.message.includes('GOOGLE_CREDENTIALS')) {
      console.log('\n💡 Solución: Verifica que GOOGLE_CREDENTIALS esté configurado en tu archivo .env');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Solución: Verifica que las credenciales de Google Drive sean correctas');
    } else if (error.message.includes('permission')) {
      console.log('\n💡 Solución: Verifica que la cuenta de servicio tenga permisos en la carpeta');
    } else if (error.message.includes('private_key')) {
      console.log('\n💡 Solución: Verifica el formato de la clave privada en las credenciales');
    }
    
    process.exit(1);
  }
}

// Ejecutar la verificación
fixCredentials(); 