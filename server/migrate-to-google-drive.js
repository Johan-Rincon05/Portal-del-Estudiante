/**
 * Script para migrar documentos existentes a Google Drive
 * Este script lee documentos de la base de datos que no tienen driveFileId
 * y los sube a Google Drive, actualizando la base de datos
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateDocumentsToGoogleDrive() {
  console.log('🔄 Iniciando migración de documentos a Google Drive...\n');

  try {
    // Verificar configuración
    if (!process.env.GOOGLE_CREDENTIALS) {
      throw new Error('GOOGLE_CREDENTIALS no está configurado');
    }
    
    if (!process.env.DRIVE_FOLDER_ID) {
      throw new Error('DRIVE_FOLDER_ID no está configurado');
    }

    // Importar módulos
    console.log('📋 Importando módulos...');
    const { uploadFileToDrive } = await import('./google-drive.ts');
    const { storage } = await import('./storage.ts');
    console.log('✅ Módulos importados correctamente\n');

    // Obtener todos los documentos
    console.log('📋 Obteniendo documentos de la base de datos...');
    const allDocuments = await storage.getAllDocuments();
    
    // Filtrar documentos que no tienen driveFileId
    const documentsToMigrate = allDocuments.filter(doc => !doc.driveFileId);
    
    console.log(`📊 Total de documentos: ${allDocuments.length}`);
    console.log(`📤 Documentos a migrar: ${documentsToMigrate.length}\n`);

    if (documentsToMigrate.length === 0) {
      console.log('✅ No hay documentos para migrar. Todos ya están en Google Drive.');
      return;
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Migrar cada documento
    for (let i = 0; i < documentsToMigrate.length; i++) {
      const document = documentsToMigrate[i];
      
      console.log(`🔄 Migrando documento ${i + 1}/${documentsToMigrate.length}: ${document.name}`);
      
      try {
        // Verificar si el archivo local existe
        const filePath = join(__dirname, '../uploads/documentos', document.path);
        
        if (!existsSync(filePath)) {
          console.log(`   ⚠️ Archivo local no encontrado: ${filePath}`);
          errors.push({
            documentId: document.id,
            documentName: document.name,
            error: 'Archivo local no encontrado'
          });
          errorCount++;
          continue;
        }

        // Leer el archivo
        const fileBuffer = readFileSync(filePath);
        
        // Determinar el tipo MIME basado en la extensión
        const ext = document.name.split('.').pop()?.toLowerCase();
        let mimeType = 'application/octet-stream';
        
        if (ext === 'pdf') mimeType = 'application/pdf';
        else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'txt') mimeType = 'text/plain';
        else if (ext === 'doc') mimeType = 'application/msword';
        else if (ext === 'docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        // Subir a Google Drive
        const driveFile = await uploadFileToDrive({
          buffer: fileBuffer,
          originalname: document.name,
          mimetype: mimeType
        });

        // Actualizar la base de datos
        await storage.updateDocument(document.id, {
          driveFileId: driveFile.id,
          driveWebViewLink: driveFile.webViewLink,
          path: driveFile.id // Actualizar path para usar el ID de Google Drive
        });

        console.log(`   ✅ Migrado exitosamente`);
        console.log(`      ID: ${driveFile.id}`);
        console.log(`      Enlace: ${driveFile.webViewLink}`);
        
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        errors.push({
          documentId: document.id,
          documentName: document.name,
          error: error.message
        });
        errorCount++;
      }
      
      console.log(''); // Línea en blanco para separar
    }

    // Mostrar resumen
    console.log('📊 Resumen de la migración:');
    console.log(`   ✅ Documentos migrados exitosamente: ${successCount}`);
    console.log(`   ❌ Documentos con errores: ${errorCount}`);
    console.log(`   📋 Total procesados: ${documentsToMigrate.length}\n`);

    if (errors.length > 0) {
      console.log('❌ Errores encontrados:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. Documento ID ${error.documentId} (${error.documentName}): ${error.error}`);
      });
      console.log('');
    }

    if (successCount > 0) {
      console.log('🎉 ¡Migración completada!');
      console.log('💡 Los documentos migrados ahora usan Google Drive como almacenamiento.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error('🔍 Detalles del error:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateDocumentsToGoogleDrive(); 