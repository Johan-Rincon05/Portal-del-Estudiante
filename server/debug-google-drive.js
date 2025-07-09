/**
 * Script de diagnóstico detallado para Google Drive
 * 
 * Este script verifica paso a paso cada componente de la configuración
 */

import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugGoogleDrive() {
  console.log('🔍 Diagnóstico detallado de Google Drive\n');

  // 1. Verificar archivo de credenciales
  console.log('1️⃣ Verificando archivo de credenciales...');
  const credentialsPath = path.join(__dirname, 'config/credentials.json');
  
  if (!fs.existsSync(credentialsPath)) {
    console.log('❌ Archivo de credenciales no encontrado:', credentialsPath);
    return;
  }
  
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
    console.log('✅ Archivo de credenciales encontrado');
    console.log('   - Project ID:', credentials.project_id);
    console.log('   - Client Email:', credentials.client_email);
    console.log('   - Private Key ID:', credentials.private_key_id);
  } catch (error) {
    console.log('❌ Error al leer credenciales:', error.message);
    return;
  }

  // 2. Verificar autenticación
  console.log('\n2️⃣ Verificando autenticación...');
  try {
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const authClient = await auth.getClient();
    console.log('✅ Cliente de autenticación creado');
    
    // Verificar que tenemos un token
    const accessToken = await authClient.getAccessToken();
    console.log('✅ Token de acceso obtenido:', accessToken.token ? 'SÍ' : 'NO');
    
  } catch (error) {
    console.log('❌ Error en autenticación:', error.message);
    return;
  }

  // 3. Verificar cliente de Drive
  console.log('\n3️⃣ Verificando cliente de Google Drive...');
  try {
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/drive']
    });

    const drive = google.drive({ version: 'v3', auth });
    console.log('✅ Cliente de Google Drive creado');
    
    // 4. Probar acceso a la API
    console.log('\n4️⃣ Probando acceso a la API...');
    
    // Primero, probar listar archivos (más básico)
    console.log('   - Probando listar archivos...');
    try {
      const listResponse = await drive.files.list({
        pageSize: 1,
        fields: 'files(id,name)'
      });
      console.log('✅ Lista de archivos obtenida');
      console.log('   - Archivos encontrados:', listResponse.data.files?.length || 0);
    } catch (listError) {
      console.log('❌ Error al listar archivos:', listError.message);
    }

    // Luego, probar acceso a la carpeta específica
    console.log('   - Probando acceso a carpeta específica...');
    const folderId = '1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G';
    
    try {
      const folderResponse = await drive.files.get({
        fileId: folderId,
        fields: 'id,name,mimeType'
      });
      console.log('✅ Acceso a carpeta exitoso');
      console.log('   - Nombre de carpeta:', folderResponse.data.name);
      console.log('   - Tipo MIME:', folderResponse.data.mimeType);
    } catch (folderError) {
      console.log('❌ Error al acceder a carpeta:', folderError.message);
      
      if (folderError.message.includes('not found')) {
        console.log('💡 La carpeta no existe o no tienes permisos');
      } else if (folderError.message.includes('unregistered callers')) {
        console.log('💡 La API de Google Drive no está habilitada');
        console.log('   Ve a: https://console.cloud.google.com/apis/library/drive.googleapis.com');
      }
    }

  } catch (error) {
    console.log('❌ Error al crear cliente de Drive:', error.message);
  }

  // 5. Verificar permisos de la cuenta de servicio
  console.log('\n5️⃣ Información de la cuenta de servicio...');
  console.log('   - Email: storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com');
  console.log('   - Verifica en: https://console.cloud.google.com/iam-admin/serviceaccounts');
  console.log('   - Asegúrate de que tenga rol "Editor" o "Owner"');

  // 6. Verificar permisos de la carpeta
  console.log('\n6️⃣ Información de la carpeta...');
  console.log('   - ID de carpeta: 1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G');
  console.log('   - Enlace: https://drive.google.com/drive/folders/1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G');
  console.log('   - Asegúrate de que la cuenta de servicio tenga permisos de "Editor"');

  console.log('\n📋 Resumen de verificación:');
  console.log('   - Si ves errores de "unregistered callers": API no habilitada');
  console.log('   - Si ves errores de "not found": Carpeta no existe o sin permisos');
  console.log('   - Si ves errores de "permission denied": Problema de permisos');
}

// Ejecutar diagnóstico
debugGoogleDrive(); 