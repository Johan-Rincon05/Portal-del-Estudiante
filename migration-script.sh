#!/bin/bash
# Script de migración para Portal del Estudiante en Linux/macOS

echo "==================================================="
echo "Herramienta de Migración para Portal del Estudiante"
echo "==================================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm no está instalado. Por favor instala npm primero."
    exit 1
fi

# Verificar si PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "[ADVERTENCIA] psql no se encuentra en el PATH. Asegúrate de tener PostgreSQL instalado."
    echo "Se continuará, pero la migración de la base de datos tendrá que ser manual."
    echo ""
fi

echo "[INFO] Verificando requisitos completado."
echo ""

# Instalar dependencias
echo "[INFO] Instalando dependencias del proyecto..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Falló la instalación de dependencias."
    exit 1
fi
echo "[INFO] Dependencias instaladas correctamente."
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "[INFO] Creando archivo .env..."
    echo "NODE_ENV=development" > .env
    echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat" >> .env
    echo "JWT_SECRET=temporal_secret_key_please_change" >> .env
    echo "[INFO] Se ha creado un archivo .env con valores predeterminados."
    echo "[IMPORTANTE] Modifica el archivo .env con tus credenciales de base de datos correctas."
else
    echo "[INFO] El archivo .env ya existe. Asegúrate de que tenga la configuración correcta."
fi
echo ""

# Opciones de base de datos
echo "Opciones de base de datos:"
echo "1. Ejecutar migraciones (crea tablas en base de datos vacía)"
echo "2. Importar base de datos desde archivo SQL (si tienes un backup)"
echo "3. Omitir configuración de base de datos"
echo ""
read -p "Selecciona una opción (1-3): " DB_CHOICE

if [ "$DB_CHOICE" = "1" ]; then
    echo "[INFO] Ejecutando migraciones de base de datos..."
    npm run db:push
    if [ $? -ne 0 ]; then
        echo "[ERROR] Falló la ejecución de migraciones. Verifica la conexión a la base de datos."
        echo "[INFO] Asegúrate de que:"
        echo "1. PostgreSQL esté en ejecución"
        echo "2. La URL de la base de datos en .env sea correcta"
        echo "3. La base de datos exista"
    else
        echo "[INFO] Migraciones ejecutadas correctamente."
    fi
elif [ "$DB_CHOICE" = "2" ]; then
    read -p "Ingresa la ruta al archivo SQL de respaldo: " SQL_FILE
    echo "[INFO] Importando base de datos desde $SQL_FILE..."
    read -p "Usuario PostgreSQL (default: postgres): " DB_USER
    read -p "Nombre de la base de datos (default: websocketchat): " DB_NAME
    DB_USER=${DB_USER:-postgres}
    DB_NAME=${DB_NAME:-websocketchat}
    psql -U $DB_USER -d $DB_NAME -f $SQL_FILE
    if [ $? -ne 0 ]; then
        echo "[ERROR] Falló la importación de la base de datos."
    else
        echo "[INFO] Base de datos importada correctamente."
    fi
else
    echo "[INFO] Configuración de base de datos omitida."
fi
echo ""

echo "[INFO] Proceso de migración completado."
echo ""
echo "Para iniciar la aplicación en modo desarrollo, ejecuta: npm run dev"
echo "Para compilar la aplicación para producción, ejecuta: npm run build"
echo "Para iniciar la aplicación en modo producción, ejecuta: npm start"
echo ""
echo "[INFO] Consulta migration-guide.md para más detalles sobre la migración."
echo ""

# Dar permisos de ejecución al script
chmod +x migration-script.sh 