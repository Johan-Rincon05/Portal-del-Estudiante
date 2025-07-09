/**
 * Script para actualizar el ID de la carpeta después de convertirla en Shared Drive
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, '../.env');

console.log('🔄 Script para actualizar ID de carpeta de Google Drive\n');

// Obtener el nuevo ID del usuario
const newFolderId = process.argv[2];

if (!newFolderId) {
  console.log('❌ Error: Debes proporcionar el nuevo ID de la carpeta');
  console.log('\n📋 Uso:');
  console.log('   node server/update-folder-id.js <NUEVO_ID>');
  console.log('\n📋 Ejemplo:');
  console.log('   node server/update-folder-id.js 1ABC123DEF456GHI789JKL');
  console.log('\n📋 Pasos:');
  console.log('1. Ve a https://drive.google.com');
  console.log('2. Busca la carpeta DOCUMENTOS_PDE');
  console.log('3. Haz clic derecho → "Convertir en unidad compartida"');
  console.log('4. Copia el nuevo ID de la URL');
  console.log('5. Ejecuta este script con el nuevo ID');
  process.exit(1);
}

try {
  console.log('1️⃣ Verificando formato del ID...');
  
  // Verificar que el ID tenga el formato correcto
  if (!/^[a-zA-Z0-9_-]+$/.test(newFolderId)) {
    throw new Error('El ID no tiene el formato correcto');
  }
  
  console.log('   ✅ ID válido:', newFolderId);

  // Leer el archivo .env actual
  console.log('\n2️⃣ Leyendo archivo .env...');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Buscar la línea de DRIVE_FOLDER_ID
  const folderIdMatch = envContent.match(/DRIVE_FOLDER_ID=(.+)/);
  
  if (!folderIdMatch) {
    throw new Error('No se encontró DRIVE_FOLDER_ID en el archivo .env');
  }
  
  const oldFolderId = folderIdMatch[1];
  console.log('   ID anterior:', oldFolderId);
  console.log('   ID nuevo:', newFolderId);

  // Actualizar el archivo .env
  console.log('\n3️⃣ Actualizando archivo .env...');
  const updatedEnvContent = envContent.replace(
    /DRIVE_FOLDER_ID=.*/,
    `DRIVE_FOLDER_ID=${newFolderId}`
  );
  
  fs.writeFileSync(envPath, updatedEnvContent);
  console.log('   ✅ Archivo .env actualizado');

  console.log('\n🎉 ¡ID de carpeta actualizado exitosamente!');
  console.log('📋 Resumen:');
  console.log('   ID anterior:', oldFolderId);
  console.log('   ID nuevo:', newFolderId);
  console.log('\n🔗 Enlace a la nueva carpeta:');
  console.log(`   https://drive.google.com/drive/folders/${newFolderId}`);
  
  console.log('\n📋 Próximos pasos:');
  console.log('1. Reinicia el servidor');
  console.log('2. Prueba subir un documento');
  console.log('3. Verifica que aparece en la Shared Drive');

} catch (error) {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
} 