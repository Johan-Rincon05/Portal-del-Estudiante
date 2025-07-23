# Actualización de Roles del Sistema

## Resumen de Cambios

Se han realizado las siguientes modificaciones a los roles del sistema según los requerimientos solicitados:

### 1. **estudiante** ✅
- **Estado**: Sin cambios
- **Permisos**: Mantiene acceso básico a documentos
- **Comentario**: Se mantienen todos los accesos actuales

### 2. **aliado_administrativo** → **aliado_comercial** ✅
- **Cambio**: Renombrado de `aliado_administrativo` a `aliado_comercial`
- **Permisos**: Sin cambios
  - Lectura y actualización de usuarios
  - Lectura y actualización de documentos
  - Acceso administrativo
  - Gestión de usuarios
- **Comentario**: Solo cambio de nombre, funcionalidad idéntica

### 3. **institucion_educativa** ✅
- **Estado**: Mejorado con nuevos permisos
- **Permisos anteriores**:
  - Lectura de usuarios
  - Lectura de documentos
- **Permisos nuevos**:
  - **Lectura de solicitudes** (`request:read`)
- **Comentario**: Ahora pueden ver las solicitudes de los estudiantes

### 4. **admin** → **SuperAdministrativos** ✅
- **Cambio**: Renombrado de `admin` a `SuperAdministrativos`
- **Permisos**: Sin cambios
  - Lectura y actualización de usuarios
  - Lectura y actualización de documentos
  - Acceso administrativo
  - Gestión de usuarios
- **Comentario**: Solo cambio de nombre, funcionalidad idéntica

### 5. **superuser** ✅
- **Estado**: Sin cambios
- **Permisos**: Mantiene acceso total al sistema

### 6. **administrativo** ✅
- **Estado**: Sin cambios
- **Permisos**: Mantiene permisos de gestión académica

### 7. **cartera** ✅
- **Estado**: Sin cambios
- **Permisos**: Mantiene permisos de gestión financiera

## Archivos Modificados

### Backend (Servidor)
- `shared/schema.ts` - Definición de roles y permisos
- `server/middleware/auth.ts` - Lógica de autenticación y autorización
- `server/routes/admin.ts` - Rutas administrativas
- `server/routes/requests.ts` - Rutas de solicitudes
- `server/routes/documents.ts` - Rutas de documentos
- `server/routes/profiles.ts` - Rutas de perfiles
- `server/routes/payments.ts` - Rutas de pagos
- `server/routes/allies.ts` - Rutas de aliados
- `server/routes/auth.ts` - Rutas de autenticación
- `server/auth.ts` - Lógica de autenticación

### Frontend (Cliente)
- `client/src/App.tsx` - Rutas y redirecciones
- `client/src/pages/auth/LoginPage.tsx` - Página de login
- `client/src/pages/auth/RegisterPage.tsx` - Página de registro
- `client/src/components/Sidebar.tsx` - Navegación lateral
- `client/src/components/DocumentViewerModal.tsx` - Modal de documentos
- `client/src/pages/superuser/UsersPage.tsx` - Página de usuarios

### Base de Datos
- `migrations/0015_update_roles.sql` - Migración para actualizar roles existentes

## Nuevos Permisos Agregados

```typescript
// Permisos de solicitudes
REQUEST_READ: 'request:read',
REQUEST_CREATE: 'request:create',
REQUEST_UPDATE: 'request:update',
```

## Impacto en la Funcionalidad

### Para **institucion_educativa**
- ✅ Ahora pueden ver todas las solicitudes de los estudiantes
- ✅ Mantienen acceso a usuarios y documentos
- ✅ Filtrado por universidad aplicado automáticamente

### Para **SuperAdministrativos** (antes admin)
- ✅ Funcionalidad idéntica al rol anterior
- ✅ Acceso completo a todas las secciones administrativas
- ✅ Gestión de usuarios, documentos, pagos, etc.

### Para **aliado_comercial** (antes aliado_administrativo)
- ✅ Funcionalidad idéntica al rol anterior
- ✅ Filtrado por aliado aplicado automáticamente

## Instrucciones de Despliegue

1. **Ejecutar la migración de base de datos**:
   ```bash
   npm run db:push
   ```

2. **Reiniciar el servidor** para que los cambios en el código tomen efecto:
   ```bash
   npm run dev:server
   ```

3. **Verificar que los usuarios existentes** tengan los roles correctos en la base de datos

## Notas Importantes

- Los cambios son **compatibles hacia atrás** en términos de funcionalidad
- Los usuarios existentes con rol `admin` serán actualizados automáticamente a `SuperAdministrativos`
- Los usuarios existentes con rol `aliado_administrativo` serán actualizados automáticamente a `aliado_comercial`
- Los usuarios con rol `institucion_educativa` recibirán automáticamente el nuevo permiso de lectura de solicitudes

## Próximos Pasos

Una vez implementados estos cambios, se pueden continuar con las tareas pendientes de "Part 2: Mejoras a Roles Existentes":

1. **Para SuperAdministrativos**: Implementar funcionalidades de exportación y acciones en lote
2. **Para Estudiante**: Implementar verificación de email y mostrar motivos de rechazo 