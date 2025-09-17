@echo off
echo =====================================
echo    VERIFICACAO POS-INSTALACAO
echo =====================================
echo.

echo 1. Verificando processo...
tasklist | find /i "qz-tray.exe" >nul
if %errorlevel%==0 (
    echo    ✅ QZ Tray esta rodando!
) else (
    echo    ❌ QZ Tray NAO esta rodando!
    echo    Iniciando QZ Tray...
    start "" "C:\Program Files\QZ Tray\qz-tray.exe"
    timeout /t 5 /nobreak >nul
)

echo.
echo 2. Testando porta 8181...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8181' -TimeoutSec 2 | Out-Null; Write-Host '   ✅ Porta 8181 respondendo!' -ForegroundColor Green } catch { Write-Host '   ❌ Porta 8181 nao responde!' -ForegroundColor Red }"

echo.
echo 3. Verificando certificados...
certutil -store "Root" | find "QZ Industries" >nul
if %errorlevel%==0 (
    echo    ✅ Certificado QZ instalado!
) else (
    echo    ⚠️  Certificado QZ nao encontrado
)

echo.
echo =====================================
echo Abra o navegador e acesse:
echo https://localhost:8182
echo.
echo Se aparecer aviso de seguranca:
echo 1. Clique em "Avancar"
echo 2. Aceite o certificado
echo =====================================
echo.
pause 