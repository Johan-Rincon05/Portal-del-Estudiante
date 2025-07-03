# 📱 Instrucciones para Acceso desde Otros Dispositivos

## 🌐 Información de Conexión

**IP del Servidor:** `192.168.10.7`  
**Puerto:** `3000`  
**URL de Acceso:** `http://192.168.10.7:3000`

## 👥 Usuarios de Prueba Disponibles

### Estudiante
- **Usuario:** `estudiante_demo`
- **Contraseña:** `123456`
- **Email:** `demo@correo.com`

### Estudiante 2
- **Usuario:** `estudiante2`
- **Contraseña:** `123456`
- **Email:** `estudiante2@test.com`

### Administrador
- **Usuario:** `admin2`
- **Contraseña:** `123456`
- **Email:** `admin2@test.com`

### Super Usuario
- **Usuario:** `superuser`
- **Contraseña:** `123456`
- **Email:** `superuser@test.com`

## 📋 Pasos para Acceder

### 1. Desde un Navegador Web
1. Abre tu navegador web (Chrome, Firefox, Safari, Edge)
2. En la barra de direcciones, escribe: `http://192.168.10.7:3000`
3. Presiona Enter
4. Deberías ver la página de inicio de sesión del Portal del Estudiante

### 2. Iniciar Sesión
1. Usa cualquiera de los usuarios de prueba listados arriba
2. Ingresa el nombre de usuario y contraseña
3. Haz clic en "Iniciar Sesión"
4. Serás redirigido al dashboard correspondiente a tu rol

## 🔧 Solución de Problemas

### ❌ No se puede acceder a la página
**Posibles causas:**
- El servidor no está ejecutándose
- Firewall bloqueando la conexión
- Dispositivos no están en la misma red

**Soluciones:**
1. Verifica que el servidor esté ejecutándose en el equipo principal
2. Asegúrate de que ambos dispositivos estén conectados a la misma red WiFi
3. Intenta hacer ping a la IP: `ping 192.168.10.7`

### ❌ Error de autenticación
**Posibles causas:**
- Usuario o contraseña incorrectos
- Base de datos no accesible

**Soluciones:**
1. Verifica que estés usando las credenciales correctas
2. Asegúrate de que la base de datos PostgreSQL esté ejecutándose

### ❌ Página se carga lento
**Posibles causas:**
- Conexión de red lenta
- Servidor sobrecargado

**Soluciones:**
1. Verifica la velocidad de tu conexión WiFi
2. Cierra otras aplicaciones que consuman ancho de banda

## 📱 Acceso desde Dispositivos Móviles

### Android
1. Abre Chrome o cualquier navegador
2. Ve a `http://192.168.10.7:3000`
3. La página se adaptará automáticamente al tamaño de pantalla

### iOS (iPhone/iPad)
1. Abre Safari
2. Ve a `http://192.168.10.7:3000`
3. La interfaz es responsive y se adapta a dispositivos móviles

## 🖥️ Acceso desde Otros Equipos

### Windows
1. Abre cualquier navegador
2. Ve a `http://192.168.10.7:3000`

### macOS
1. Abre Safari, Chrome o Firefox
2. Ve a `http://192.168.10.7:3000`

### Linux
1. Abre tu navegador preferido
2. Ve a `http://192.168.10.7:3000`

## 🔒 Seguridad

- Los usuarios de prueba son solo para desarrollo
- En producción, usa contraseñas seguras
- El acceso está limitado a la red local
- Los tokens JWT expiran en 24 horas

## 📞 Soporte

Si tienes problemas para acceder:
1. Verifica que el servidor esté ejecutándose
2. Confirma que estés en la misma red WiFi
3. Intenta acceder desde otro dispositivo para aislar el problema
4. Revisa los logs del servidor para errores específicos

## 🚀 Funcionalidades Disponibles

### Para Estudiantes:
- Ver documentos y su estado
- Subir nuevos documentos
- Ver historial de pagos
- Crear solicitudes administrativas
- Ver notificaciones

### Para Administradores:
- Validar documentos de estudiantes
- Gestionar solicitudes
- Ver reportes de pagos
- Administrar usuarios

### Para Super Usuarios:
- Gestión completa de usuarios
- Configuración del sistema
- Acceso a todas las funcionalidades 