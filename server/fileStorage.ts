/**
 * Sistema de Almacenamiento de Archivos Centralizado
 * 
 * Este módulo centraliza todas las operaciones de almacenamiento de archivos
 * para facilitar la futura migración a un sistema de almacenamiento en la nube.
 * 
 * TODO ANTES DE DESPLEGAR:
 * La lógica actual usa el sistema de archivos local.
 * Reemplazar estas funciones por el SDK de @vercel/blob
 * para evitar pérdida de archivos en Vercel.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Obtener la ruta del directorio actual para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuración del almacenamiento
 */
const STORAGE_CONFIG = {
  // Directorio base para almacenamiento local
  LOCAL_STORAGE_PATH: path.join(__dirname, '../uploads'),
  DOCUMENTS_PATH: path.join(__dirname, '../uploads/documentos'),
  SUPPORTS_PATH: path.join(__dirname, '../uploads/soportes'),
  
  // Configuración para URLs
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  
  // Tipos de archivo permitidos
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  
  // Tamaño máximo de archivo (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024
};

/**
 * Interfaz para archivos
 */
export interface FileInfo {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

/**
 * Interfaz para referencias de archivo
 */
export interface FileReference {
  id: string;
  path: string;
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Clase principal para el manejo de archivos
 */
class FileStorage {
  /**
   * Inicializa el sistema de almacenamiento
   * Crea los directorios necesarios si no existen
   */
  async initialize(): Promise<void> {
    try {
      // Crear directorios si no existen
      const directories = [
        STORAGE_CONFIG.LOCAL_STORAGE_PATH,
        STORAGE_CONFIG.DOCUMENTS_PATH,
        STORAGE_CONFIG.SUPPORTS_PATH
      ];

      for (const dir of directories) {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Directorio creado: ${dir}`);
        }
      }
    } catch (error) {
      console.error('❌ Error al inicializar el almacenamiento:', error);
      throw error;
    }
  }

  /**
   * Valida un archivo antes de guardarlo
   * @param file - Información del archivo
   * @returns true si el archivo es válido
   */
  validateFile(file: FileInfo): { isValid: boolean; error?: string } {
    // Verificar tipo MIME
    if (!STORAGE_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return {
        isValid: false,
        error: `Tipo de archivo no permitido: ${file.mimetype}`
      };
    }

    // Verificar tamaño
    if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `Archivo demasiado grande. Máximo: ${STORAGE_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`
      };
    }

    return { isValid: true };
  }

  /**
   * Genera un nombre único para el archivo
   * @param originalname - Nombre original del archivo
   * @param userId - ID del usuario
   * @returns Nombre único del archivo
   */
  generateUniqueFilename(originalname: string, userId: number): string {
    const ext = path.extname(originalname);
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    return `${userId}_${timestamp}_${uuid}${ext}`;
  }

  /**
   * Guarda un archivo en el almacenamiento local
   * @param file - Información del archivo
   * @param userId - ID del usuario
   * @param category - Categoría del archivo (documentos, soportes, etc.)
   * @returns Referencia del archivo guardado
   */
  async saveFile(file: FileInfo, userId: number, category: 'documentos' | 'soportes' = 'documentos'): Promise<FileReference> {
    try {
      // Validar archivo
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Generar nombre único
      const filename = this.generateUniqueFilename(file.originalname, userId);
      
      // Determinar directorio de destino
      const storageDir = category === 'documentos' 
        ? STORAGE_CONFIG.DOCUMENTS_PATH 
        : STORAGE_CONFIG.SUPPORTS_PATH;
      
      const filePath = path.join(storageDir, filename);

      // Guardar archivo
      if (file.buffer) {
        // Si tenemos el buffer, escribirlo directamente
        fs.writeFileSync(filePath, file.buffer);
      } else if (file.path) {
        // Si tenemos una ruta temporal, mover el archivo
        fs.copyFileSync(file.path, filePath);
        // Limpiar archivo temporal
        fs.unlinkSync(file.path);
      } else {
        throw new Error('No se proporcionó buffer ni ruta del archivo');
      }

      // Crear referencia
      const fileReference: FileReference = {
        id: uuidv4(),
        path: filename, // Guardamos solo el nombre del archivo
        url: `${STORAGE_CONFIG.BASE_URL}/api/files/${category}/${filename}`,
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      };

      console.log(`✅ Archivo guardado: ${filename}`);
      return fileReference;

    } catch (error) {
      console.error('❌ Error al guardar archivo:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL de un archivo
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns URL completa del archivo
   */
  getFileUrl(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): string {
    return `${STORAGE_CONFIG.BASE_URL}/api/files/${category}/${filePath}`;
  }

  /**
   * Obtiene la ruta física de un archivo
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns Ruta física completa del archivo
   */
  getFilePath(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): string {
    const storageDir = category === 'documentos' 
      ? STORAGE_CONFIG.DOCUMENTS_PATH 
      : STORAGE_CONFIG.SUPPORTS_PATH;
    
    return path.join(storageDir, filePath);
  }

  /**
   * Verifica si un archivo existe
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns true si el archivo existe
   */
  fileExists(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): boolean {
    const fullPath = this.getFilePath(filePath, category);
    return fs.existsSync(fullPath);
  }

  /**
   * Elimina un archivo del almacenamiento
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns true si se eliminó correctamente
   */
  async deleteFile(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): Promise<boolean> {
    try {
      const fullPath = this.getFilePath(filePath, category);
      
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`✅ Archivo eliminado: ${filePath}`);
        return true;
      } else {
        console.log(`⚠️ Archivo no encontrado: ${filePath}`);
        return false;
      }
    } catch (error) {
      console.error('❌ Error al eliminar archivo:', error);
      return false;
    }
  }

  /**
   * Lee un archivo del almacenamiento
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns Buffer del archivo o null si no existe
   */
  async readFile(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): Promise<Buffer | null> {
    try {
      const fullPath = this.getFilePath(filePath, category);
      
      if (fs.existsSync(fullPath)) {
        return fs.readFileSync(fullPath);
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error al leer archivo:', error);
      return null;
    }
  }

  /**
   * Obtiene información de un archivo
   * @param filePath - Ruta del archivo (nombre del archivo)
   * @param category - Categoría del archivo
   * @returns Información del archivo o null si no existe
   */
  getFileInfo(filePath: string, category: 'documentos' | 'soportes' = 'documentos'): { size: number; mimetype?: string } | null {
    try {
      const fullPath = this.getFilePath(filePath, category);
      
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          size: stats.size,
          mimetype: this.getMimeTypeFromExtension(path.extname(filePath))
        };
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error al obtener información del archivo:', error);
      return null;
    }
  }

  /**
   * Obtiene el tipo MIME basado en la extensión del archivo
   * @param extension - Extensión del archivo
   * @returns Tipo MIME
   */
  private getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  }
}

// Exportar instancia única
export const fileStorage = new FileStorage();

// Exportar tipos y configuraciones
export type { FileInfo, FileReference };
export { STORAGE_CONFIG }; 