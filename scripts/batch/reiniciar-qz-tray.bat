@echo off
echo Reiniciando QZ Tray...
echo.

echo 1. Fechando QZ Tray atual...
taskkill /F /IM javaw.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo 2. Iniciando QZ Tray...
start "" "C:\Program Files\QZ Tray\qz-tray.exe"

echo.
echo QZ Tray reiniciado!
echo Aguarde alguns segundos para ele inicializar completamente.
echo.
pause 