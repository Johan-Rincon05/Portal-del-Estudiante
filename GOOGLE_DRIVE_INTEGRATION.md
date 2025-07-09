# Integración de Google Drive API

## Descripción

Este documento describe la integración de Google Drive API en el Portal del Estudiante para el almacenamiento y gestión de documentos.

## Configuración

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env`:

```env
# Google Drive API Configuration
GOOGLE_CREDENTIALS={"type":"service_account","project_id":"tu-proyecto","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"tu-service-account@tu-proyecto.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/tu-service-account%40tu-proyecto.iam.gserviceaccount.com"}

# ID de la carpeta en Google Drive donde se guardarán los documentos
DRIVE_FOLDER_ID=1Bxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. Configuración de Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la Google Drive API
4. Crea una cuenta de servicio:
   - Ve a "IAM & Admin" > "Service Accounts"
   - Haz clic en "Create Service Account"
   - Dale un nombre descriptivo
   - Descarga el archivo JSON de credenciales
5. Copia el contenido del archivo JSON a la variable `GOOGLE_CREDENTIALS`
6. Comparte la carpeta de Google Drive con la cuenta de servicio

### 3. Instalación de Dependencias

```bash
npm install googleapis
```

## Migración de Base de Datos

Ejecuta la migración para agregar los campos necesarios:

```bash
node server/run-migration.js
```

## Estructura de Archivos

### Archivos Principales

- `server/google-drive.ts` - Módulo principal de Google Drive
- `server/routes/documents.ts` - Rutas actualizadas para usar Google Drive
- `migrations/0010_add_google_drive_fields.sql` - Migración de base de datos
- `shared/schema.ts` - Esquema actualizado con campos de Google Drive

### Nuevos Campos en la Base de Datos

```sql
ALTER TABLE documents 
ADD COLUMN drive_file_id TEXT,
ADD COLUMN drive_web_view_link TEXT;
```

## Funcionalidades

### 1. Subida de Archivos

Los archivos se suben automáticamente a Google Drive cuando se crea un documento:

```typescript
// Ejemplo de uso en las rutas
const driveFile = await uploadFileToDrive({
  buffer: file.buffer,
  originalname: file.originalname,
  mimetype: file.mimetype
});
```

### 2. Descarga de Archivos

Los archivos se pueden descargar directamente desde Google Drive:

```typescript
// Obtener stream del archivo
const driveFileStream = await getFileFromDrive(document.driveFileId);
```

### 3. Eliminación de Archivos

Los archivos se eliminan tanto de la base de datos como de Google Drive:

```typescript
// Eliminar de Google Drive
await deleteFileFromDrive(document.driveFileId);
```

### 4. Enlaces Directos

Se pueden obtener enlaces directos de visualización:

```typescript
// Obtener enlace de visualización
const driveLink = document.driveWebViewLink;
```

## Rutas API

### Nuevas Rutas

- `GET /api/documents/:id/drive-link` - Obtener enlace directo de Google Drive

### Rutas Modificadas

- `POST /api/documents` - Ahora sube archivos a Google Drive
- `GET /api/documents/:id/file` - Sirve archivos desde Google Drive
- `GET /api/documents/:id/iframe` - Sirve archivos en iframe desde Google Drive
- `DELETE /api/documents/:id` - Elimina archivos de Google Drive

## Funciones del Módulo Google Drive

### `uploadFileToDrive(file)`
Sube un archivo a Google Drive y retorna información del archivo.

**Parámetros:**
- `file.buffer` - Buffer del archivo
- `file.originalname` - Nombre original del archivo
- `file.mimetype` - Tipo MIME del archivo

**Retorna:**
```typescript
{
  id: string,           // ID del archivo en Google Drive
  webViewLink: string   // Enlace de visualización
}
```

### `getFileFromDrive(fileId)`
Obtiene un archivo de Google Drive como stream.

**Parámetros:**
- `fileId` - ID del archivo en Google Drive

**Retorna:**
- Stream del archivo

### `deleteFileFromDrive(fileId)`
Elimina un archivo de Google Drive.

**Parámetros:**
- `fileId` - ID del archivo en Google Drive

**Retorna:**
- `true` si se eliminó correctamente

### `getFileInfo(fileId)`
Obtiene información detallada de un archivo.

**Parámetros:**
- `fileId` - ID del archivo en Google Drive

**Retorna:**
```typescript
{
  id: string,
  name: string,
  size: string,
  mimeType: string,
  webViewLink: string,
  createdTime: string,
  modifiedTime: string
}
```

### `listFilesInFolder(pageSize)`
Lista archivos en la carpeta configurada.

**Parámetros:**
- `pageSize` - Número máximo de archivos (opcional, por defecto 10)

**Retorna:**
- Array de archivos con información

## Compatibilidad

### Fallback a Archivos Locales

El sistema mantiene compatibilidad con archivos locales existentes:

1. Si un documento no tiene `driveFileId`, se intenta servir desde el sistema de archivos local
2. Los documentos existentes seguirán funcionando sin cambios
3. Solo los nuevos documentos se subirán a Google Drive

### Migración Gradual

Para migrar documentos existentes a Google Drive:

1. Los documentos existentes mantienen su funcionalidad actual
2. Los nuevos documentos se suben automáticamente a Google Drive
3. Se puede implementar un script de migración para mover archivos existentes

## Ventajas de Google Drive

### 1. Escalabilidad
- Sin límites de almacenamiento local
- Manejo automático de backups
- Distribución global de contenido

### 2. Seguridad
- Autenticación robusta
- Control de acceso granular
- Auditoría de acceso

### 3. Rendimiento
- CDN global de Google
- Optimización automática de archivos
- Caché inteligente

### 4. Funcionalidades Adicionales
- Visualización en línea de documentos
- Compartir archivos fácilmente
- Integración con otras herramientas de Google

## Troubleshooting

### Error: "DRIVE_FOLDER_ID no está configurado"
- Verifica que la variable `DRIVE_FOLDER_ID` esté configurada en `.env`
- Asegúrate de que la carpeta exista y sea accesible

### Error: "GOOGLE_CREDENTIALS no está configurado"
- Verifica que la variable `GOOGLE_CREDENTIALS` contenga el JSON válido
- Asegúrate de que la cuenta de servicio tenga permisos

### Error: "No se pudo subir el archivo"
- Verifica la conectividad a internet
- Revisa los logs para errores específicos de la API
- Confirma que la cuenta de servicio tenga permisos de escritura

### Archivos no se muestran
- Verifica que los archivos tengan `driveFileId` en la base de datos
- Confirma que los archivos existan en Google Drive
- Revisa los permisos de la carpeta compartida

## Logs y Debugging

El sistema incluye logs detallados para debugging:

```javascript
console.log('[DEBUG] Subiendo archivo a Google Drive...');
console.log('[DEBUG] Archivo subido a Google Drive:', driveFile);
console.log('[DEBUG] Obteniendo archivo de Google Drive:', document.driveFileId);
```

## Consideraciones de Seguridad

1. **Credenciales**: Nunca commits las credenciales de Google Drive
2. **Permisos**: Usa el principio de menor privilegio para la cuenta de servicio
3. **Auditoría**: Revisa regularmente los logs de acceso
4. **Backup**: Mantén backups de la base de datos y configuración

## Próximos Pasos

1. Ejecutar la migración de base de datos
2. Configurar las variables de entorno
3. Probar la subida de archivos
4. Verificar la descarga y visualización
5. Implementar migración de archivos existentes (opcional) 