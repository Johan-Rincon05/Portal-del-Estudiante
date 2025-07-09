/**
 * Servicio de Google Drive
 * 
 * Este servicio encapsula toda la lógica para interactuar con la API de Google Drive
 * usando una cuenta de servicio para autenticación servidor a servidor.
 * 
 * Responsabilidades:
 * - Autenticación con Google usando credenciales de cuenta de servicio
 * - Subida de archivos a Google Drive
 * - Gestión de streams y buffers
 * - Manejo de errores centralizado
 */

import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { Readable } from 'stream';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ID de la carpeta de destino en Google Drive
const DRIVE_FOLDER_ID = '1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G';

// Configuración de autenticación usando cuenta de servicio
const auth = new GoogleAuth({
  keyFile: path.join(__dirname, '../config/credentials.json'),
  scopes: ['https://www.googleapis.com/auth/drive']
});

// Cliente de Google Drive
const drive = google.drive({ version: 'v3', auth });

/**
 * Sube un archivo a Google Drive usando la cuenta de servicio
 * 
 * @param file - Objeto de archivo de multer (Express.Multer.File)
 * @returns Promise<string> - ID del archivo subido en Google Drive
 * 
 * @throws Error si hay problemas con la autenticación o subida
 */
export async function uploadFileToDrive(file: Express.Multer.File): Promise<string> {
  try {
    console.log('📤 Iniciando subida de archivo a Google Drive:', {
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype
    });

    // Verificar que el archivo tenga buffer
    if (!file.buffer) {
      throw new Error('El archivo no contiene datos (buffer vacío)');
    }

    // Convertir el buffer a stream legible
    const stream = Readable.from(file.buffer);

    // Configurar los metadatos del archivo
    const fileMetadata = {
      name: file.originalname,
      parents: [DRIVE_FOLDER_ID]
    };

    // Configurar el contenido del archivo
    const media = {
      mimeType: file.mimetype,
      body: stream
    };

    // Subir archivo a Google Drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id' // Solo solicitamos el ID para ser más eficientes
    });

    const fileId = response.data.id;
    
    if (!fileId) {
      throw new Error('No se pudo obtener el ID del archivo subido');
    }

    console.log('✅ Archivo subido exitosamente a Google Drive:', {
      fileName: file.originalname,
      fileId: fileId
    });

    return fileId;

  } catch (error) {
    console.error('❌ Error al subir archivo a Google Drive:', error);
    
    // Re-lanzar el error con contexto adicional
    if (error instanceof Error) {
      throw new Error(`Error al subir archivo a Google Drive: ${error.message}`);
    } else {
      throw new Error('Error desconocido al subir archivo a Google Drive');
    }
  }
}

/**
 * Obtiene un archivo de Google Drive por su ID
 * 
 * @param fileId - ID del archivo en Google Drive
 * @returns Promise<Buffer> - Contenido del archivo como buffer
 */
export async function getFileFromDrive(fileId: string): Promise<Buffer> {
  try {
    console.log('📥 Obteniendo archivo de Google Drive:', fileId);

    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    });

    return Buffer.from(response.data as any);

  } catch (error) {
    console.error('❌ Error al obtener archivo de Google Drive:', error);
    throw new Error(`Error al obtener archivo de Google Drive: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Elimina un archivo de Google Drive por su ID
 * 
 * @param fileId - ID del archivo en Google Drive
 * @returns Promise<void>
 */
export async function deleteFileFromDrive(fileId: string): Promise<void> {
  try {
    console.log('🗑️ Eliminando archivo de Google Drive:', fileId);

    await drive.files.delete({
      fileId: fileId
    });

    console.log('✅ Archivo eliminado exitosamente de Google Drive:', fileId);

  } catch (error) {
    console.error('❌ Error al eliminar archivo de Google Drive:', error);
    throw new Error(`Error al eliminar archivo de Google Drive: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Verifica la conexión con Google Drive
 * 
 * @returns Promise<boolean> - true si la conexión es exitosa
 */
export async function testConnection(): Promise<boolean> {
  try {
    console.log('🔍 Probando conexión con Google Drive...');

    // Intentar obtener información de la carpeta de destino
    await drive.files.get({
      fileId: DRIVE_FOLDER_ID,
      fields: 'id,name'
    });

    console.log('✅ Conexión con Google Drive exitosa');
    return true;

  } catch (error) {
    console.error('❌ Error al conectar con Google Drive:', error);
    return false;
  }
}

// Exportar constantes para uso en otros módulos
export { DRIVE_FOLDER_ID }; 