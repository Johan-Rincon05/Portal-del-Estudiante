# 📊 Migraciones de Base de Datos - Portal del Estudiante

## 📋 Descripción

Este directorio contiene todas las migraciones de base de datos para el Portal del Estudiante. Las migraciones están organizadas cronológicamente y cada una representa un cambio específico en la estructura de la base de datos.

## 🗂️ Estructura de Migraciones

### **Migración Inicial**
- `0000_initial_schema.sql` - **MIGRACIÓN CONSOLIDADA**
  - Crea todas las tablas base del sistema
  - Define todos los enums necesarios
  - Establece índices para rendimiento
  - **USAR ESTA MIGRACIÓN PARA NUEVAS INSTALACIONES**

### **Migraciones Incrementales (Mantener para actualizaciones)**

#### **Índices y Optimización**
- `0001_add_indexes.sql` - Índices adicionales para rendimiento
- `0002_add_roles_and_permissions.sql` - Sistema de roles y permisos

#### **Funcionalidades Core**
- `0003_create_notifications.sql` - Sistema de notificaciones
- `0004_create_enrollment_stage_history.sql` - Historial de etapas de matrícula
- `0006_add_document_validations.sql` - Validaciones de documentos
- `0007_improve_payments_installments.sql` - Mejoras en sistema de pagos
- `0008_add_request_type.sql` - Tipos de solicitud
- `0009_add_document_observations.sql` - Observaciones en documentos

#### **Limpieza y Mantenimiento**
- `0012_remove_google_drive_fields.sql` - Eliminación de campos de Google Drive

## 🚀 Uso de Migraciones

### **Nueva Instalación**
Para una nueva instalación, ejecuta solo la migración consolidada:

```bash
# Ejecutar migración inicial consolidada
psql -d portal_estudiante -f migrations/0000_initial_schema.sql
```

### **Actualización de Sistema Existente**
Para actualizar un sistema existente, ejecuta las migraciones incrementales en orden:

```bash
# Ejecutar migraciones incrementales
psql -d portal_estudiante -f migrations/0001_add_indexes.sql
psql -d portal_estudiante -f migrations/0002_add_roles_and_permissions.sql
psql -d portal_estudiante -f migrations/0003_create_notifications.sql
# ... continuar con las demás migraciones en orden
```

### **Usando el Script de Migración**
El proyecto incluye un script automatizado:

```bash
# Ejecutar todas las migraciones automáticamente
node server/run-migration.js
```

## 📊 Tablas del Sistema

### **Tablas Principales**
1. **users** - Usuarios del sistema
2. **profiles** - Perfiles de usuarios
3. **documents** - Documentos subidos
4. **requests** - Solicitudes de estudiantes
5. **notifications** - Notificaciones del sistema

### **Tablas de Pago**
6. **payments** - Registro de pagos
7. **installments** - Cuotas del plan de pagos
8. **installment_observations** - Observaciones de cuotas

### **Tablas Académicas**
9. **universities** - Universidades
10. **programs** - Programas académicos
11. **university_data** - Datos universitarios de estudiantes
12. **enrollment_stage_history** - Historial de etapas de matrícula

### **Tablas de Sistema**
13. **roles** - Roles y permisos
14. **enums** - Tipos enumerados para validación

## 🔧 Enums del Sistema

### **enrollment_stage**
- `suscrito` - Usuario registrado
- `documentos_completos` - Documentos subidos
- `registro_validado` - Registro verificado
- `proceso_universitario` - En proceso universitario
- `matriculado` - Matriculado
- `inicio_clases` - Clases iniciadas
- `estudiante_activo` - Estudiante activo
- `pagos_al_dia` - Pagos al día
- `proceso_finalizado` - Proceso completado

### **document_type**
- `cedula` - Cédula de ciudadanía
- `diploma` - Diploma académico
- `acta` - Acta de grado
- `foto` - Fotografía
- `recibo` - Recibo de pago
- `formulario` - Formulario
- `certificado` - Certificado
- `otro` - Otro tipo

### **document_status**
- `pendiente` - Pendiente de revisión
- `aprobado` - Aprobado
- `rechazado` - Rechazado
- `en_revision` - En revisión

### **request_type**
- `financiera` - Solicitud financiera
- `academica` - Solicitud académica
- `documental_administrativa` - Solicitud documental administrativa
- `datos_estudiante_administrativa` - Solicitud de datos administrativos

## ⚠️ Migraciones Eliminadas

### **Migraciones Problemáticas (Eliminadas)**
- `0005_fix_email_duplication.sql` - **ELIMINADA**
  - Causaba conflictos con el esquema actual
  - El email ya se maneja correctamente en la tabla users

- `0011_align_profile_user_ids.sql` - **ELIMINADA**
  - Práctica peligrosa de sincronización de IDs
  - Puede causar conflictos con claves primarias

## 🛠️ Mantenimiento

### **Verificar Estado de Migraciones**
```bash
# Verificar qué migraciones se han ejecutado
psql -d portal_estudiante -c "SELECT * FROM schema_migrations;"
```

### **Backup Antes de Migraciones**
```bash
# Crear backup antes de ejecutar migraciones
pg_dump portal_estudiante > backup_before_migration.sql
```

### **Reversión de Migraciones**
Para revertir una migración específica, consulta el contenido del archivo y ejecuta los comandos inversos manualmente.

## 📝 Notas Importantes

1. **Orden de Ejecución**: Las migraciones deben ejecutarse en orden cronológico
2. **Backup**: Siempre hacer backup antes de ejecutar migraciones
3. **Testing**: Probar migraciones en ambiente de desarrollo primero
4. **Consolidación**: Para nuevas instalaciones, usar `0000_initial_schema.sql`
5. **Incremental**: Para actualizaciones, usar migraciones individuales

## 🔍 Troubleshooting

### **Error: "relation already exists"**
- Las migraciones usan `CREATE TABLE IF NOT EXISTS`
- Este error indica que la tabla ya existe, es normal

### **Error: "enum already exists"**
- Los enums se crean con `CREATE TYPE IF NOT EXISTS`
- Este error es normal si el enum ya existe

### **Error: "index already exists"**
- Los índices se crean con `CREATE INDEX IF NOT EXISTS`
- Este error es normal si el índice ya existe 