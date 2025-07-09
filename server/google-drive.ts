import { google } from 'googleapis';
import stream from 'stream';

// Cargar las credenciales desde las variables de entorno
console.log('[DEBUG] Variables de entorno:');
console.log('[DEBUG] GOOGLE_CREDENTIALS existe:', !!process.env.GOOGLE_CREDENTIALS);
console.log('[DEBUG] DRIVE_FOLDER_ID existe:', !!process.env.DRIVE_FOLDER_ID);
console.log('[DEBUG] DRIVE_FOLDER_ID valor:', process.env.DRIVE_FOLDER_ID);

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');
const FOLDER_ID = process.env.DRIVE_FOLDER_ID;

// Configurar la autenticación JWT con el formato correcto
const auth = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/drive']
});

// Autorizar el JWT antes de usarlo
async function authorizeJWT() {
  try {
    console.log('[DEBUG] Autorizando JWT...');
    await auth.authorize();
    console.log('[DEBUG] JWT autorizado correctamente');
    return true;
  } catch (error) {
    console.error('[ERROR] Error al autorizar JWT:', error);
    throw error;
  }
}

const drive = google.drive({ version: 'v3', auth });

interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

/**
 * Sube un archivo a una carpeta específica en Google Drive.
 * @param file Objeto del archivo procesado por multer (en memoria).
 * @returns Un objeto con el ID y el enlace de visualización del archivo en Drive.
 */
export async function uploadFileToDrive(file: UploadedFile) {
  if (!FOLDER_ID) {
    throw new Error("DRIVE_FOLDER_ID no está configurado en las variables de entorno.");
  }

  // Verificar que las credenciales estén presentes
  if (!credentials.client_email || !credentials.private_key) {
    throw new Error("Credenciales de Google Drive incompletas. Verifica GOOGLE_CREDENTIALS.");
  }

  // Autorizar el JWT antes de hacer la petición
  await authorizeJWT();

  const bufferStream = new stream.PassThrough();
  bufferStream.end(file.buffer);

  try {
    console.log('[DEBUG] Iniciando subida a Google Drive...');
    const response = await drive.files.create({
      requestBody: {
        name: `${Date.now()}-${file.originalname}`, // Nombre único para evitar colisiones
        parents: [FOLDER_ID], // ID de la carpeta donde se guardará
      },
      media: {
        mimeType: file.mimetype,
        body: bufferStream,
      },
      fields: 'id, webViewLink', // Campos que queremos que la API nos devuelva
    });

    console.log('[DEBUG] Archivo subido exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error al subir el archivo a Google Drive:", error);
    
    // Log detallado del error para debugging
    if (error.response) {
      console.error("Detalles del error:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      });
    }
    
    throw new Error("No se pudo subir el archivo.");
  }
}

/**
 * Obtiene un archivo de Google Drive por su ID
 * @param fileId ID del archivo en Google Drive
 * @returns Stream del archivo
 */
export async function getFileFromDrive(fileId: string) {
  // Autorizar el JWT antes de hacer la petición
  await authorizeJWT();
  
  try {
    const response = await drive.files.get({
      fileId: fileId,
      alt: 'media'
    }, { responseType: 'stream' });
    
    return response.data;
  } catch (error) {
    console.error("Error al obtener el archivo de Google Drive:", error);
    throw new Error("No se pudo obtener el archivo.");
  }
}

/**
 * Elimina un archivo de Google Drive por su ID
 * @param fileId ID del archivo en Google Drive
 * @returns true si se eliminó correctamente
 */
export async function deleteFileFromDrive(fileId: string): Promise<boolean> {
  // Autorizar el JWT antes de hacer la petición
  await authorizeJWT();
  
  try {
    await drive.files.delete({
      fileId: fileId
    });
    
    return true;
  } catch (error) {
    console.error("Error al eliminar el archivo de Google Drive:", error);
    throw new Error("No se pudo eliminar el archivo.");
  }
}

/**
 * Obtiene información de un archivo de Google Drive por su ID
 * @param fileId ID del archivo en Google Drive
 * @returns Información del archivo
 */
export async function getFileInfo(fileId: string) {
  // Autorizar el JWT antes de hacer la petición
  await authorizeJWT();
  
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, size, mimeType, webViewLink, createdTime, modifiedTime'
    });
    
    return response.data;
  } catch (error) {
    console.error("Error al obtener información del archivo de Google Drive:", error);
    throw new Error("No se pudo obtener la información del archivo.");
  }
}

/**
 * Lista archivos en la carpeta configurada de Google Drive
 * @param pageSize Número máximo de archivos a retornar (por defecto 10)
 * @returns Lista de archivos
 */
export async function listFilesInFolder(pageSize: number = 10) {
  if (!FOLDER_ID) {
    throw new Error("DRIVE_FOLDER_ID no está configurado en las variables de entorno.");
  }

  // Autorizar el JWT antes de hacer la petición
  await authorizeJWT();

  try {
    const response = await drive.files.list({
      q: `'${FOLDER_ID}' in parents and trashed=false`,
      pageSize: pageSize,
      fields: 'files(id, name, size, mimeType, webViewLink, createdTime, modifiedTime)',
      orderBy: 'createdTime desc'
    });
    
    return response.data.files;
  } catch (error) {
    console.error("Error al listar archivos de Google Drive:", error);
    throw new Error("No se pudieron listar los archivos.");
  }
} 