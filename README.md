# Portal del Estudiante

Sistema de gestión de documentos y solicitudes para estudiantes universitarios.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js (versión 18 o superior)
- PostgreSQL
- npm o yarn

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Portal-del-Estudiante
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar la base de datos**
   - Crear una base de datos PostgreSQL llamada `portal_estudiante`
   - Ejecutar las migraciones:
   ```bash
   npm run db:push
   ```

### Ejecutar en Desarrollo

#### Opción 1: Ejecutar todo junto (Recomendado)
```bash
npm run dev:full
```

#### Opción 2: Ejecutar por separado
En una terminal:
```bash
npm run dev:server
```

En otra terminal:
```bash
npm run dev:client
```

### Puertos utilizados

- **Backend (API)**: `http://localhost:3000`
- **Frontend (Cliente)**: `http://localhost:3001`
- **Base de datos**: `localhost:5432`

## 🔧 Solución de Problemas

### Error de WebSocket
Si ves errores de WebSocket como `ws://localhost:undefined`, asegúrate de:
1. Ejecutar el backend en el puerto 3000
2. Ejecutar el frontend en el puerto 3001
3. Verificar que no haya conflictos de puertos

### Error de React Hooks
Si ves errores como "Invalid hook call", asegúrate de:
1. Tener una sola versión de React instalada
2. Ejecutar el frontend con `npm run dev:client`
3. Verificar que el `AuthProvider` esté correctamente configurado

### Error de CORS
Si ves errores de CORS:
1. Verificar que el backend esté ejecutándose en el puerto 3000
2. Verificar que el frontend esté ejecutándose en el puerto 3001
3. Verificar la configuración de CORS en `server/index.ts`

## 📁 Estructura del Proyecto

```
Portal-del-Estudiante/
├── client/                 # Frontend React + Vite
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── hooks/         # Hooks personalizados
│   │   ├── pages/         # Páginas de la aplicación
│   │   └── lib/           # Utilidades y configuración
│   └── vite.config.ts     # Configuración de Vite
├── server/                # Backend Express
│   ├── routes/            # Rutas de la API
│   ├── middleware/        # Middlewares
│   └── index.ts           # Punto de entrada del servidor
├── shared/                # Esquemas compartidos
└── migrations/            # Migraciones de la base de datos
```

## 🛠️ Scripts Disponibles

- `npm run dev:full` - Ejecuta backend y frontend simultáneamente
- `npm run dev:server` - Ejecuta solo el backend
- `npm run dev:client` - Ejecuta solo el frontend
- `npm run build` - Construye la aplicación para producción
- `npm run db:push` - Ejecuta las migraciones de la base de datos

## 🔐 Autenticación

El sistema utiliza JWT para la autenticación. Los tokens se almacenan en localStorage y se envían automáticamente en las cabeceras de las peticiones.

## 📝 Roles de Usuario

- **estudiante**: Puede subir documentos, hacer solicitudes y ver su perfil
- **admin**: Puede validar documentos, gestionar solicitudes y ver reportes
- **superuser**: Puede gestionar usuarios y tiene acceso completo al sistema

## 🚀 Despliegue

Para desplegar en producción:

1. Construir la aplicación:
   ```bash
   npm run build
   ```

2. Configurar las variables de entorno de producción

3. Ejecutar el servidor:
   ```bash
   npm start
   ```

## 📞 Soporte

Si encuentras problemas, verifica:
1. Los logs del servidor en la consola
2. Los logs del navegador (F12)
3. La configuración de la base de datos
4. Los puertos utilizados 