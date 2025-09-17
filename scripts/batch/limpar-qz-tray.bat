@echo off
echo =====================================
echo    LIMPEZA COMPLETA QZ TRAY
echo =====================================
echo.

echo 1. Fechando processos QZ Tray...
taskkill /F /IM qz-tray.exe 2>nul
taskkill /F /IM javaw.exe 2>nul
timeout /t 2 /nobreak >nul

echo 2. Removendo pastas de dados...
echo    - Removendo C:\ProgramData\qz...
rmdir /S /Q "C:\ProgramData\qz" 2>nul

echo    - Removendo %APPDATA%\qz...
rmdir /S /Q "%APPDATA%\qz" 2>nul

echo    - Removendo %LOCALAPPDATA%\qz...
rmdir /S /Q "%LOCALAPPDATA%\qz" 2>nul

echo 3. Limpando certificados QZ...
certutil -delstore "Root" "QZ Industries, LLC" 2>nul

echo.
echo ✅ Limpeza concluída!
echo.
echo Agora você pode instalar o QZ Tray novamente.
echo Download em: https://qz.io/download/
echo.
pause 