@echo off
REM Script de migración para Portal del Estudiante
TITLE Migración del Portal del Estudiante

echo ===================================================
echo Herramienta de Migración para Portal del Estudiante
echo ===================================================
echo.

REM Verificar si Node.js está instalado
WHERE node >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no está instalado. Por favor instala Node.js primero.
    pause
    exit /b
)

REM Verificar si npm está instalado
WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no está instalado. Por favor instala npm primero.
    pause
    exit /b
)

REM Verificar si PostgreSQL está instalado
WHERE psql >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo [ADVERTENCIA] psql no se encuentra en el PATH. Asegúrate de tener PostgreSQL instalado.
    echo Se continuará, pero la migración de la base de datos tendrá que ser manual.
    echo.
)

echo [INFO] Verificando requisitos completado.
echo.

REM Instalar dependencias
echo [INFO] Instalando dependencias del proyecto...
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Falló la instalación de dependencias.
    pause
    exit /b
)
echo [INFO] Dependencias instaladas correctamente.
echo.

REM Crear archivo .env si no existe
if not exist .env (
    echo [INFO] Creando archivo .env...
    echo NODE_ENV=development > .env
    echo DATABASE_URL=postgresql://postgres:postgres@localhost:5432/websocketchat >> .env
    echo JWT_SECRET=temporal_secret_key_please_change >> .env
    echo [INFO] Se ha creado un archivo .env con valores predeterminados.
    echo [IMPORTANTE] Modifica el archivo .env con tus credenciales de base de datos correctas.
) else (
    echo [INFO] El archivo .env ya existe. Asegúrate de que tenga la configuración correcta.
)
echo.

REM Opciones de base de datos
echo Opciones de base de datos:
echo 1. Ejecutar migraciones (crea tablas en base de datos vacía)
echo 2. Importar base de datos desde archivo SQL (si tienes un backup)
echo 3. Omitir configuración de base de datos
echo.
set /p DB_CHOICE=Selecciona una opción (1-3): 

if "%DB_CHOICE%"=="1" (
    echo [INFO] Ejecutando migraciones de base de datos...
    call npm run db:push
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Falló la ejecución de migraciones. Verifica la conexión a la base de datos.
        echo [INFO] Asegúrate de que:
        echo 1. PostgreSQL esté en ejecución
        echo 2. La URL de la base de datos en .env sea correcta
        echo 3. La base de datos exista
    ) else (
        echo [INFO] Migraciones ejecutadas correctamente.
    )
) else if "%DB_CHOICE%"=="2" (
    set /p SQL_FILE=Ingresa la ruta al archivo SQL de respaldo: 
    echo [INFO] Importando base de datos desde %SQL_FILE%...
    set /p DB_USER=Usuario PostgreSQL (default: postgres): 
    set /p DB_NAME=Nombre de la base de datos (default: websocketchat): 
    if "%DB_USER%"=="" set DB_USER=postgres
    if "%DB_NAME%"=="" set DB_NAME=websocketchat
    psql -U %DB_USER% -d %DB_NAME% -f %SQL_FILE%
    IF %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Falló la importación de la base de datos.
    ) else (
        echo [INFO] Base de datos importada correctamente.
    )
) else (
    echo [INFO] Configuración de base de datos omitida.
)
echo.

echo [INFO] Proceso de migración completado.
echo.
echo Para iniciar la aplicación en modo desarrollo, ejecuta: npm run dev
echo Para compilar la aplicación para producción, ejecuta: npm run build
echo Para iniciar la aplicación en modo producción, ejecuta: npm start
echo.
echo [INFO] Consulta migration-guide.md para más detalles sobre la migración.
echo.

pause 