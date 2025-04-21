@echo off
echo Iniciando servicios para demo...

REM Crear un directorio temporal para los logs si no existe
if not exist "temp" mkdir temp

REM Iniciar el servidor en segundo plano
start cmd /k "cd server && npm run dev"

REM Esperar 5 segundos para que el servidor inicie
timeout /t 5

REM Iniciar el cliente en segundo plano
start cmd /k "cd client && npm run dev"

REM Esperar 5 segundos para que el cliente inicie
timeout /t 5

REM Iniciar ngrok para el servidor y el cliente
start cmd /k "ngrok http 3000 --log=stdout > temp\ngrok-server.log"
start cmd /k "ngrok http 5173 --log=stdout > temp\ngrok-client.log"

REM Esperar a que ngrok inicie y obtener las URLs
timeout /t 5
echo.
echo Obteniendo URLs de acceso...
echo.

REM Mostrar las URLs de ngrok
echo URLs para acceder a la aplicación:
echo.
findstr "url" temp\ngrok-client.log
echo.
echo ¡IMPORTANTE!
echo - Usa la URL de arriba en tu celular para acceder a la aplicación
echo - La aplicación está optimizada para móviles
echo - Asegúrate de usar HTTPS en la URL
echo.
echo Para cerrar todos los servicios, cierra todas las ventanas de comando
echo.
echo Presiona cualquier tecla para cerrar esta ventana (los servicios seguirán ejecutándose)...
pause > nul

REM Limpiar archivos temporales
rd /s /q temp 