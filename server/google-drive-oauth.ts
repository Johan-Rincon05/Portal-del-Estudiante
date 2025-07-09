import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración OAuth2
const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
);

// Función para generar URL de autorización
export function generateAuthUrl(): string {
    const scopes = [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });
}

// Función para intercambiar código por tokens
export async function getTokensFromCode(code: string) {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        
        // Guardar tokens en archivo (en producción usar base de datos)
        const tokensPath = path.join(__dirname, 'tokens.json');
        fs.writeFileSync(tokensPath, JSON.stringify(tokens, null, 2));
        
        return tokens;
    } catch (error) {
        console.error('Error al obtener tokens:', error);
        throw error;
    }
}

// Función para cargar tokens guardados
export function loadSavedTokens() {
    try {
        const tokensPath = path.join(__dirname, 'tokens.json');
        if (fs.existsSync(tokensPath)) {
            const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
            oauth2Client.setCredentials(tokens);
            return true;
        }
    } catch (error) {
        console.error('Error al cargar tokens:', error);
    }
    return false;
}

// Función para subir archivo a Google Drive
export async function uploadFileToDrive(fileData: { buffer: Buffer; originalname: string; mimetype: string }): Promise<{ id: string; webViewLink: string }> {
    try {
        // Verificar si tenemos tokens válidos
        if (!oauth2Client.credentials.access_token) {
            throw new Error('No hay tokens de acceso válidos. Necesitas autenticarte primero.');
        }

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado');
        }

        const fileMetadata = {
            name: fileData.originalname,
            parents: [folderId]
        };

        const media = {
            mimeType: fileData.mimetype,
            body: fileData.buffer
        };

        console.log('📤 Subiendo archivo a Google Drive con OAuth...');
        
        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id,webViewLink'
        });

        console.log('✅ Archivo subido correctamente:', response.data.name);

        return {
            id: response.data.id!,
            webViewLink: response.data.webViewLink!
        };

    } catch (error) {
        console.error('❌ Error al subir archivo a Google Drive:', error);
        throw new Error('No se pudo subir el archivo a Google Drive');
    }
}

// Función para verificar si la autenticación está lista
export function isAuthenticated(): boolean {
    return !!(oauth2Client.credentials && oauth2Client.credentials.access_token);
}

// Función para obtener información de la carpeta
export async function getFolderInfo() {
    try {
        if (!oauth2Client.credentials.access_token) {
            throw new Error('No hay tokens de acceso válidos');
        }

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        if (!folderId) {
            throw new Error('GOOGLE_DRIVE_FOLDER_ID no está configurado');
        }

        const response = await drive.files.get({
            fileId: folderId,
            fields: 'id,name,mimeType,webViewLink'
        });

        return response.data;
    } catch (error) {
        console.error('Error al obtener información de la carpeta:', error);
        throw error;
    }
}

// Función para obtener archivo de Google Drive
export async function getFileFromDrive(fileId: string): Promise<Buffer> {
    try {
        if (!oauth2Client.credentials.access_token) {
            throw new Error('No hay tokens de acceso válidos. Necesitas autenticarte primero.');
        }

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media'
        });

        return Buffer.from(response.data as any);
    } catch (error) {
        console.error('Error al obtener archivo de Google Drive:', error);
        throw new Error('No se pudo obtener el archivo de Google Drive');
    }
}

// Función para eliminar archivo de Google Drive
export async function deleteFileFromDrive(fileId: string): Promise<void> {
    try {
        if (!oauth2Client.credentials.access_token) {
            throw new Error('No hay tokens de acceso válidos. Necesitas autenticarte primero.');
        }

        const drive = google.drive({ version: 'v3', auth: oauth2Client });
        
        await drive.files.delete({
            fileId: fileId
        });

        console.log('✅ Archivo eliminado de Google Drive:', fileId);
    } catch (error) {
        console.error('Error al eliminar archivo de Google Drive:', error);
        throw new Error('No se pudo eliminar el archivo de Google Drive');
    }
}

// Cargar tokens al importar el módulo
loadSavedTokens(); 