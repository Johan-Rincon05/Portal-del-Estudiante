# 🧑‍💼 Funcionalidades del Súper Administrador

## Descripción General

El rol de **Súper Administrador** es el nivel más alto de acceso en el Portal del Estudiante, con capacidades de gestión global del sistema y todos los usuarios.

## 🔐 Funcionalidades Principales

### 1. Gestión Avanzada de Usuarios

#### Búsqueda y Filtrado Inteligente
- **Búsqueda por múltiples criterios**: nombre, correo electrónico, número de documento o rol
- **Filtros avanzados**:
  - Por rol (estudiante, admin, superuser)
  - Por estado (activo/inactivo)
  - Combinación de filtros
- **Estadísticas en tiempo real**: muestra el número de usuarios encontrados vs total

#### Reseteo de Contraseñas
- **Generación automática** de contraseñas temporales seguras
- **Envío automático de email** con la nueva contraseña
- **Confirmación visual** del proceso
- **Logs detallados** para auditoría

### 2. Interfaz Mejorada

#### Barra de Búsqueda Avanzada
```typescript
// Ejemplo de búsqueda
- Término: "juan" → encuentra usuarios con "juan" en nombre, email o documento
- Rol: "admin" → filtra solo administradores
- Estado: "activo" → filtra solo usuarios activos
```

#### Tabla de Usuarios Mejorada
- **Columnas adicionales**: estado del usuario, fecha de creación
- **Badges visuales**: para roles y estados
- **Acciones contextuales**: editar, resetear contraseña, eliminar
- **Paginación inteligente**: con contadores de resultados

### 3. Seguridad y Auditoría

#### Reseteo Seguro de Contraseñas
```typescript
// Proceso de reseteo:
1. Validación de permisos (solo superuser)
2. Generación de contraseña temporal (12 caracteres)
3. Hash seguro con bcrypt
4. Actualización en base de datos
5. Envío de email con nueva contraseña
6. Logs de auditoría
```

#### Confirmaciones de Acciones Críticas
- **Modal de confirmación** para reseteo de contraseña
- **Modal de confirmación** para eliminación de usuarios
- **Feedback visual** durante operaciones

## 📧 Sistema de Email

### Configuración de Email

#### Desarrollo (Ethereal Email)
```env
ETHEREAL_USER=test@ethereal.email
ETHEREAL_PASS=test123
```

#### Producción (Gmail/SMTP)
```env
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=Portal del Estudiante <noreply@portalestudiante.com>
```

### Plantillas de Email

#### Email de Reseteo de Contraseña
- **Diseño profesional** con branding del portal
- **Contraseña destacada** en formato legible
- **Instrucciones claras** para el usuario
- **Enlaces directos** al portal
- **Información de seguridad**

## 🔧 Configuración Técnica

### Endpoints del Backend

#### Reseteo de Contraseña
```http
POST /api/admin/users/:userId/reset-password
Authorization: Bearer <token>
Content-Type: application/json

Response:
{
  "message": "Contraseña reseteada exitosamente",
  "details": "Se ha enviado un email a usuario@ejemplo.com con la nueva contraseña temporal."
}
```

### Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portal_estudiante

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui

# Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion
EMAIL_FROM=Portal del Estudiante <noreply@portalestudiante.com>

# URLs
FRONTEND_URL=http://localhost:3001
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias
```bash
npm install nodemailer @types/nodemailer
```

### 2. Configurar Variables de Entorno
```bash
# Copiar el archivo de ejemplo
cp env.example .env

# Editar las variables según tu entorno
nano .env
```

### 3. Configurar Email (Desarrollo)
Para desarrollo, el sistema usa Ethereal Email automáticamente. No se requiere configuración adicional.

### 4. Configurar Email (Producción)
```env
# Para Gmail
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=contraseña_de_aplicacion_gmail
EMAIL_FROM=Portal del Estudiante <tu_email@gmail.com>

# Para otros proveedores SMTP
SMTP_HOST=smtp.tuproveedor.com
SMTP_PORT=587
SMTP_USER=tu_email@dominio.com
SMTP_PASS=tu_contraseña
```

## 📊 Monitoreo y Logs

### Logs del Sistema
```bash
# Reseteo exitoso
✅ Email de reseteo enviado exitosamente a usuario@ejemplo.com

# Error en envío de email
⚠️ Error al enviar email, pero contraseña actualizada para usuario@ejemplo.com: TempPass123!

# Error general
❌ Error al resetear contraseña: [detalles del error]
```

### Logs de Email (Desarrollo)
```bash
📧 Email de reseteo enviado (desarrollo):
URL de preview: https://ethereal.email/message/...
```

## 🔒 Consideraciones de Seguridad

### Permisos
- Solo usuarios con rol `superuser` pueden resetear contraseñas
- Validación de token JWT en cada operación
- Logs de auditoría para todas las acciones críticas

### Contraseñas Temporales
- **Longitud**: 12 caracteres
- **Caracteres**: Mayúsculas, minúsculas, números, símbolos
- **Expiración**: El usuario debe cambiarla en el primer inicio de sesión
- **Hash**: bcrypt con salt de 10 rondas

### Email
- **Encriptación**: TLS/SSL para transmisión
- **Autenticación**: SMTP con credenciales seguras
- **Plantillas**: HTML seguro sin scripts ejecutables

## 🐛 Solución de Problemas

### Email No Se Envía
1. Verificar configuración SMTP
2. Revisar logs del servidor
3. Verificar credenciales de email
4. Comprobar firewall/antivirus

### Error de Permisos
1. Verificar rol del usuario actual
2. Comprobar token JWT
3. Revisar middleware de autenticación

### Usuario No Encontrado
1. Verificar ID del usuario
2. Comprobar que el usuario existe en la base de datos
3. Revisar permisos de acceso a datos

## 📈 Próximas Mejoras

### Funcionalidades Planificadas
- [ ] Historial de reseteos de contraseña
- [ ] Notificaciones push en tiempo real
- [ ] Exportación de datos de usuarios
- [ ] Gestión de permisos granulares
- [ ] Dashboard de estadísticas avanzadas

### Mejoras de UX
- [ ] Búsqueda con autocompletado
- [ ] Filtros guardados
- [ ] Acciones en lote
- [ ] Vista de calendario de actividades

---

**Nota**: Esta documentación se actualiza regularmente. Para la versión más reciente, consulta el repositorio del proyecto. 