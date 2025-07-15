# 📁 Sistema de Almacenamiento Local

## 📋 Descripción

El Portal del Estudiante ahora utiliza un sistema de almacenamiento local simple para gestionar documentos y soportes de pago. Los archivos se almacenan en el sistema de archivos del servidor en carpetas organizadas.

## 🏗️ Estructura de Carpetas

```
uploads/
├── documentos/     # Documentos subidos por estudiantes
└── soportes/       # Soportes de pago subidos por estudiantes
```

## 📊 Configuración

### Variables de Entorno

El sistema no requiere variables de entorno específicas para el almacenamiento local. Solo necesita:

```env
# Configuración básica
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal_estudiante
JWT_SECRET=tu_clave_secreta
NODE_ENV=development
```

### Estructura de Base de Datos

La tabla `documents` ahora tiene una estructura simplificada:

```sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  name TEXT NOT NULL,
  path TEXT NOT NULL,  -- Ruta del archivo en almacenamiento local
  status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  rejection_reason TEXT,
  observations TEXT,
  reviewed_by INTEGER,
  reviewed_at TIMESTAMP,
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Funcionalidades

### Subida de Documentos

1. **Validación de archivos**: Solo se permiten ciertos tipos de archivo
2. **Nombrado único**: Los archivos se renombran con formato `userId_timestamp.extensión`
3. **Almacenamiento organizado**: Los documentos se guardan en `uploads/documentos/`

### Tipos de Archivo Permitidos

- `application/pdf` - Documentos PDF
- `image/jpeg`, `image/png`, `image/gif` - Imágenes
- `application/msword` - Documentos Word (.doc)
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document` - Documentos Word (.docx)
- `text/plain` - Archivos de texto

### Límites

- **Tamaño máximo**: 10MB por archivo
- **Ubicación**: Carpeta `uploads/documentos/` en el servidor

## 🚀 Rutas API

### Documentos

- `POST /api/documents` - Subir nuevo documento
- `GET /api/documents` - Listar documentos del usuario
- `GET /api/documents/:id/file` - Descargar documento
- `GET /api/documents/:id/iframe` - Ver documento en iframe
- `DELETE /api/documents/:id` - Eliminar documento
- `PUT /api/documents/:id/status` - Actualizar estado (admin)
- `GET /api/documents/:id/download-url` - Obtener URL de descarga

### Soportes de Pago

- `POST /api/payments/installments/:id/support` - Subir soporte de pago
- Los soportes se almacenan en `uploads/soportes/`

## 🔒 Seguridad

### Validación de Permisos

- Los usuarios solo pueden acceder a sus propios documentos
- Los administradores pueden acceder a todos los documentos
- Validación de autenticación en todas las rutas

### Validación de Archivos

- Verificación de tipo MIME
- Límite de tamaño de archivo
- Nombrado seguro de archivos

## 📝 Migración

### Eliminar Campos de Google Drive

Ejecuta la migración para limpiar la base de datos:

```bash
# Ejecutar migración
node server/run-migration.js
```

Esta migración:
- Elimina los campos `drive_file_id` y `drive_web_view_link`
- Elimina el índice `idx_documents_drive_file_id`
- Actualiza los comentarios de la tabla

## 🛠️ Mantenimiento

### Limpieza de Archivos

Para mantener el sistema limpio:

1. **Archivos huérfanos**: Los archivos se eliminan automáticamente cuando se elimina un documento
2. **Backup**: Considera hacer backup regular de la carpeta `uploads/`
3. **Monitoreo**: Monitorea el espacio en disco de la carpeta `uploads/`

### Logs

El sistema registra todas las operaciones de archivos:

- Subida de archivos
- Descarga de archivos
- Eliminación de archivos
- Errores de acceso

## 🔄 Ventajas del Sistema Local

### ✅ Pros

- **Simplicidad**: No requiere configuración externa
- **Velocidad**: Acceso directo a archivos
- **Control total**: Gestión completa de archivos
- **Sin dependencias externas**: No requiere APIs de terceros
- **Costo cero**: No hay costos de almacenamiento en la nube

### ⚠️ Consideraciones

- **Escalabilidad**: Limitado por espacio en disco del servidor
- **Backup**: Responsabilidad del administrador del servidor
- **Disponibilidad**: Dependiente de la disponibilidad del servidor
- **Distribución**: No hay distribución global automática

## 🚀 Próximos Pasos

Para un sistema más robusto en el futuro, considera:

1. **Sistema de archivos distribuido** (NFS, GlusterFS)
2. **Almacenamiento en la nube** (AWS S3, Google Cloud Storage)
3. **CDN** para distribución global
4. **Backup automático** a almacenamiento externo
5. **Compresión** de archivos para ahorrar espacio

## 📞 Soporte

Si necesitas ayuda con el sistema de almacenamiento local:

1. Verifica que las carpetas `uploads/` existan
2. Revisa los permisos de escritura en las carpetas
3. Monitorea los logs del servidor
4. Verifica el espacio disponible en disco 