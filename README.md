# Portal del Estudiante

Sistema de gestión para estudiantes que permite el seguimiento de documentos, solicitudes y procesos académicos.

## Características

- Gestión de documentos académicos
- Sistema de solicitudes y tickets
- Seguimiento del estado de matrícula
- Panel de control personalizado

## Migración del Proyecto

Si necesitas migrar este proyecto a otro equipo, hemos preparado herramientas que facilitan este proceso:

### Documentación

- **[Guía de Migración](migration-guide.md)**: Documento detallado con todos los pasos necesarios para migrar el proyecto.

### Scripts de Migración

Dependiendo de tu sistema operativo, puedes utilizar:

- **Windows**: Ejecuta `migration-script.bat` haciendo doble clic o desde la línea de comandos.
- **Linux/macOS**: Ejecuta `./migration-script.sh` desde la terminal (asegúrate de darle permisos con `chmod +x migration-script.sh` primero).

Estos scripts automatizarán gran parte del proceso de migración, incluyendo:
- Verificación de requisitos previos
- Instalación de dependencias
- Configuración de variables de entorno
- Opciones para configurar la base de datos

## Requisitos del Sistema

- Node.js (v16+)
- npm
- PostgreSQL (v13+)
- Navegador web moderno

## Configuración del Entorno

Las variables de entorno necesarias se encuentran en el archivo `.env` en la raíz del proyecto:

```
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat
JWT_SECRET=tu_clave_secreta
```

## Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar en modo producción
npm start
```

## Estructura del Proyecto

- `client/`: Frontend de la aplicación (React)
- `server/`: Backend de la aplicación (Express)
- `shared/`: Código compartido
- `migrations/`: Migraciones de la base de datos 