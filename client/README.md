# Portal del Estudiante - Frontend

Este es el frontend del Portal del Estudiante, construido con React, TypeScript y Vite.

## Configuración para Desarrollo Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y configúralo:

```bash
cp env.example .env.local
```

Edita `.env.local` con tu configuración:

```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=Portal del Estudiante
VITE_APP_VERSION=1.0.0
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Configuración del Backend

Asegúrate de que el backend esté ejecutándose en `http://localhost:5000` antes de iniciar el frontend.

### Ejecutar el backend

Desde la raíz del proyecto:

```bash
npm run dev
```

## Estructura del Proyecto

```
client/
├── src/
│   ├── components/     # Componentes React
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Utilidades y configuración
│   ├── pages/         # Páginas de la aplicación
│   └── types/         # Tipos TypeScript
├── public/            # Archivos estáticos
└── dist/              # Archivos de construcción (generado)
```

## Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye la aplicación para producción
- `npm run preview` - Previsualiza la construcción de producción

## Variables de Entorno

- `VITE_API_URL` - URL del backend (default: http://localhost:5000)
- `VITE_APP_NAME` - Nombre de la aplicación
- `VITE_APP_VERSION` - Versión de la aplicación

## Notas Importantes

- El frontend usa Vite como bundler
- TypeScript está configurado en modo permisivo para evitar errores de build
- El proxy está configurado para redirigir `/api` al backend en desarrollo
- Las variables de entorno deben empezar con `VITE_` para ser accesibles en el frontend 