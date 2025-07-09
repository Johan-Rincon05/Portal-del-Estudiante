/**
 * Script de prueba simple para diagnosticar problemas de autenticación
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

async function simpleTest() {
  try {
    console.log('🧪 Prueba simple de autenticación...\n');

    // Verificar variables de entorno
    console.log('1️⃣ Variables de entorno:');
    console.log('   GOOGLE_CREDENTIALS:', !!process.env.GOOGLE_CREDENTIALS);
    console.log('   DRIVE_FOLDER_ID:', process.env.DRIVE_FOLDER_ID);

    // Parsear credenciales
    console.log('\n2️⃣ Parseando credenciales:');
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
    console.log('   client_email:', credentials.client_email);
    console.log('   project_id:', credentials.project_id);
    console.log('   private_key length:', credentials.private_key.length);
    console.log('   private_key starts with:', credentials.private_key.substring(0, 30));

    // Importar googleapis
    console.log('\n3️⃣ Importando googleapis...');
    const { google } = await import('googleapis');

    // Crear JWT con más detalles
    console.log('\n4️⃣ Creando JWT...');
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    console.log('   JWT creado correctamente');

    // Autorizar
    console.log('\n5️⃣ Autorizando JWT...');
    const authResult = await auth.authorize();
    console.log('   Auth result:', authResult);

    console.log('\n🎉 ¡Autenticación exitosa!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('🔍 Detalles:', error);
    
    if (error.message.includes('No key or keyFile set')) {
      console.log('\n💡 Posible solución: Verifica que la clave privada esté en el formato correcto');
    } else if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Posible solución: Verifica que la cuenta de servicio esté habilitada');
    } else if (error.message.includes('unauthorized_client')) {
      console.log('\n💡 Posible solución: Verifica que la cuenta de servicio tenga permisos');
    }
    
    process.exit(1);
  }
}

// Ejecutar la prueba
simpleTest(); 