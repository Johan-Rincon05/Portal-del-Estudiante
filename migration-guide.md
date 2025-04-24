# Guía de Migración del Portal del Estudiante

Esta guía te ayudará a migrar completamente el proyecto "Portal del Estudiante" a un nuevo equipo, incluyendo la aplicación, base de datos y todas las dependencias necesarias.

## Requisitos Previos

Asegúrate de tener instalado en el nuevo equipo:

- Node.js (versión 16 o superior)
- npm (incluido con Node.js)
- PostgreSQL (versión 13 o superior)
- Git (opcional, pero recomendado)

## Paso 1: Transferir el Código Fuente

### Opción A: Usando Git (Recomendado)

Si el proyecto está en un repositorio Git:

```bash
# En el nuevo equipo
git clone <url-del-repositorio>
cd Portal-del-Estudiante
```

### Opción B: Transferencia Manual

1. Crea un archivo ZIP de todo el directorio del proyecto (excluyendo `node_modules`)
2. Transfiere el ZIP al nuevo equipo (USB, servicio de almacenamiento en la nube, etc.)
3. Descomprime el archivo en la ubicación deseada

## Paso 2: Configurar la Base de Datos

1. Instala PostgreSQL en el nuevo equipo si aún no está instalado
2. Crea una nueva base de datos:

```bash
# Conéctate a PostgreSQL
psql -U postgres

# Crea una nueva base de datos
CREATE DATABASE websocketchat;

# Salir de psql
\q
```

3. Exporta tu base de datos actual:

```bash
# En el equipo original
pg_dump -U postgres -d websocketchat > websocketchat_backup.sql
```

4. Importa la base de datos en el nuevo equipo:

```bash
# En el nuevo equipo
psql -U postgres -d websocketchat < websocketchat_backup.sql
```

## Paso 3: Instalar Dependencias

```bash
# En el directorio del proyecto en el nuevo equipo
npm install
```

## Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat
# Otras variables específicas del proyecto como claves JWT, configuración S3, etc.
```

Asegúrate de ajustar la URL de la base de datos según tu configuración local.

## Paso 5: Ejecutar Migraciones (Si es necesario)

Si necesitas aplicar todas las migraciones de la base de datos:

```bash
npm run db:push
```

## Paso 6: Iniciar la Aplicación

### Para desarrollo:

```bash
npm run dev
```

### Para producción:

```bash
npm run build
npm start
```

## Paso 7: Verificar Funcionalidad

1. Abre la aplicación en `http://localhost:3000`
2. Verifica que todas las funciones principales funcionen correctamente:
   - Inicio de sesión
   - Carga de documentos
   - Visualización de solicitudes
   - Otros flujos importantes

## Solución de Problemas

### Problemas con la Base de Datos

Si hay problemas con la conexión a la base de datos:
- Verifica que PostgreSQL esté en ejecución en el nuevo equipo
- Asegúrate de que la URL de la base de datos en `.env` sea correcta
- Comprueba que el usuario de la base de datos tenga permisos adecuados

### Problemas con las Dependencias

Si hay problemas con las dependencias:
- Elimina `node_modules` y `package-lock.json`
- Ejecuta `npm install` nuevamente

### Errores de Compilación

- Verifica que la versión de Node.js sea compatible (16+)
- Ejecuta `npm run check` para verificar errores de TypeScript

## Información Adicional

### Estructura del Proyecto

- `client/`: Frontend de la aplicación (React)
- `server/`: Backend de la aplicación (Express)
- `shared/`: Código compartido entre frontend y backend
- `migrations/`: Migraciones de la base de datos

### Mantenimiento

Después de la migración, considera:
- Hacer una copia de seguridad regular de la base de datos
- Mantener actualizado el sistema y las dependencias
- Documentar cualquier cambio específico del entorno

---

Si necesitas más ayuda o tienes preguntas específicas sobre la migración, contacta al equipo de desarrollo. 