# Instrucciones de Despliegue en Vercel

## Configuración Actual

Este proyecto está configurado para desplegar solo el frontend en Vercel. El backend necesitará ser desplegado por separado (por ejemplo, en Railway, Render, o Heroku).

## Archivos de Configuración

### vercel.json
- Configura Vercel para construir solo el frontend desde el directorio `client/`
- El directorio de salida es `client/dist`
- Usa Vite como framework

### client/package.json
- Contiene todas las dependencias necesarias para el frontend
- Scripts de construcción configurados para Vercel

### client/vite.config.ts
- Configurado para generar archivos en `client/dist`
- Proxy configurado para desarrollo local

## Pasos para el Despliegue

1. **Conectar el repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio `Portal-del-Estudiante`

2. **Configurar el proyecto:**
   - Framework Preset: Vite
   - Root Directory: `./` (raíz del proyecto)
   - Build Command: `cd client && npm install && npm run build`
   - Output Directory: `client/dist`
   - Install Command: `npm install`

3. **Variables de Entorno:**
   - Configura las variables de entorno necesarias para el frontend
   - Asegúrate de que la URL del backend esté configurada correctamente

4. **Desplegar:**
   - Haz clic en "Deploy"
   - Vercel construirá automáticamente el frontend

## Configuración del Backend

Para que el frontend funcione correctamente, necesitas desplegar el backend por separado:

1. **Desplegar el backend:**
   - Usa Railway, Render, Heroku, o cualquier otro servicio
   - Configura las variables de entorno necesarias
   - Asegúrate de que la base de datos esté configurada

2. **Actualizar la URL del backend:**
   - En el frontend, actualiza la URL base de la API
   - Configura CORS en el backend para permitir tu dominio de Vercel

## Estructura del Proyecto

```
Portal-del-Estudiante/
├── client/                 # Frontend (se despliega en Vercel)
│   ├── package.json       # Dependencias del frontend
│   ├── vite.config.ts     # Configuración de Vite
│   └── src/               # Código fuente del frontend
├── server/                # Backend (se despliega por separado)
│   ├── index.ts           # Servidor principal
│   └── routes/            # Rutas de la API
├── vercel.json            # Configuración de Vercel
└── package.json           # Dependencias del proyecto completo
```

## Solución de Problemas

### Error: "Could not read package.json"
- Asegúrate de que el archivo `client/package.json` existe
- Verifica que el comando de construcción esté configurado correctamente

### Error de construcción
- Revisa los logs de construcción en Vercel
- Asegúrate de que todas las dependencias estén en `client/package.json`
- Los errores de TypeScript se han configurado para ser permisivos durante el build

### Problemas de CORS
- Configura CORS en el backend para permitir tu dominio de Vercel
- Verifica que la URL del backend esté configurada correctamente

### Variables de Entorno
- Configura `VITE_API_URL` en Vercel con la URL de tu backend
- Las variables de entorno están configuradas en `vercel.json`

## Notas Importantes

- Este despliegue solo incluye el frontend
- El backend debe ser desplegado por separado
- Asegúrate de configurar las variables de entorno correctamente
- La base de datos debe estar accesible desde el backend desplegado 