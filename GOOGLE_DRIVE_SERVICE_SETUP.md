# 🚀 Servicio de Google Drive - Configuración y Uso

## 📋 Resumen

Se ha creado un servicio encapsulado para Google Drive que centraliza toda la lógica de interacción con la API de Google Drive usando una cuenta de servicio para autenticación servidor a servidor.

## 🏗️ Arquitectura del Servicio

### Ubicación del Servicio
```
server/
├── services/
│   └── googleDrive.ts          # Servicio principal
├── config/
│   └── credentials.json        # Credenciales de cuenta de servicio (protegido)
└── ...
```

### Funciones Disponibles

#### `uploadFileToDrive(file: Express.Multer.File): Promise<string>`
- **Propósito**: Sube un archivo a Google Drive
- **Parámetros**: Objeto de archivo de multer
- **Retorna**: ID del archivo subido en Google Drive
- **Características**:
  - Convierte buffer a stream automáticamente
  - Manejo de errores centralizado
  - Logs detallados para debugging

#### `getFileFromDrive(fileId: string): Promise<Buffer>`
- **Propósito**: Obtiene un archivo de Google Drive
- **Parámetros**: ID del archivo
- **Retorna**: Contenido del archivo como buffer

#### `deleteFileFromDrive(fileId: string): Promise<void>`
- **Propósito**: Elimina un archivo de Google Drive
- **Parámetros**: ID del archivo

#### `testConnection(): Promise<boolean>`
- **Propósito**: Verifica la conexión con Google Drive
- **Retorna**: true si la conexión es exitosa

## ⚙️ Configuración Requerida

### 1. Habilitar Google Drive API

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: `portal-del-estudiante-464914`
3. Ve a "APIs y servicios" > "Biblioteca"
4. Busca "Google Drive API"
5. Haz clic en "Habilitar"

### 2. Verificar Permisos de la Cuenta de Servicio

1. Ve a [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Busca: `storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com`
3. Verifica que tenga el rol "Editor" o permisos de Drive

### 3. Configurar Permisos de la Carpeta

1. Ve a la carpeta de Google Drive: [Carpeta del Proyecto](https://drive.google.com/drive/folders/1eNzgB8aXSraFEPCTWd9Dp1HmESe0ob3G)
2. Haz clic derecho en la carpeta > "Compartir"
3. Agrega: `storage-pde@portal-del-estudiante-464914.iam.gserviceaccount.com`
4. Dale permisos de "Editor"

## 🧪 Scripts de Prueba

### Probar la Conexión
```bash
npm run test:google-drive
```

### Ver Configuración
```bash
npm run setup:google-drive
```

## 📝 Uso del Servicio

### En las Rutas de Documentos

```typescript
import { uploadFileToDrive, getFileFromDrive, deleteFileFromDrive } from '../services/googleDrive';

// Subir archivo
const fileId = await uploadFileToDrive(req.file);

// Obtener archivo
const fileBuffer = await getFileFromDrive(fileId);

// Eliminar archivo
await deleteFileFromDrive(fileId);
```

### Ejemplo Completo de Subida

```typescript
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no proporcionado' });
    }

    // Usar el servicio encapsulado
    const fileId = await uploadFileToDrive(req.file);

    // Guardar en base de datos
    const document = await storage.createDocument({
      name: req.file.originalname,
      type: req.body.type,
      path: fileId, // Usar el ID de Google Drive
      driveFileId: fileId,
      userId: req.user.id,
      status: 'pendiente'
    });

    res.json(document);
  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ error: 'Error al subir documento' });
  }
});
```

## 🔐 Seguridad

### Credenciales Protegidas
- ✅ Archivo `credentials.json` protegido por `.gitignore`
- ✅ Nunca se subirá al repositorio
- ✅ Usa cuenta de servicio (más seguro que OAuth2 para servidor)

### Permisos Mínimos
- ✅ Solo acceso a la carpeta específica
- ✅ No acceso a otros archivos del usuario
- ✅ Autenticación servidor a servidor

## 🚨 Solución de Problemas

### Error: "Method doesn't allow unregistered callers"
**Causa**: La API de Google Drive no está habilitada
**Solución**: Habilitar la API en Google Cloud Console

### Error: "Permission denied"
**Causa**: La cuenta de servicio no tiene permisos
**Solución**: 
1. Verificar que la cuenta tenga rol "Editor"
2. Compartir la carpeta con la cuenta de servicio

### Error: "File not found"
**Causa**: El archivo no existe o no tienes permisos
**Solución**: Verificar el ID del archivo y permisos

## 📊 Ventajas del Servicio Encapsulado

1. **Centralización**: Toda la lógica de Google Drive en un lugar
2. **Reutilización**: Fácil de usar en múltiples rutas
3. **Mantenimiento**: Cambios en un solo archivo
4. **Testing**: Fácil de probar de forma aislada
5. **Error Handling**: Manejo de errores consistente
6. **Logging**: Logs detallados para debugging

## 🔄 Migración desde OAuth2

El servicio reemplaza la configuración anterior de OAuth2 con una solución más robusta:

- **Antes**: OAuth2 con tokens que expiran
- **Ahora**: Cuenta de servicio sin expiración
- **Beneficio**: Más confiable para uso en producción

## 📈 Próximos Pasos

1. **Habilitar la API** siguiendo las instrucciones
2. **Probar la conexión** con `npm run test:google-drive`
3. **Integrar en las rutas** de documentos
4. **Migrar archivos existentes** si es necesario

---

**Estado**: ✅ Servicio creado y listo para usar
**Próximo paso**: Habilitar la API de Google Drive en la consola de Google Cloud 