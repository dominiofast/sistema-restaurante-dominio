# Script de Diagnóstico do QZ Tray - Versão Melhorada
# Este script verifica se o QZ Tray está funcionando corretamente
# e resolve problemas comuns de certificados
Write-Host "====================================="
Write-Host "   DIAGNOSTICO QZ TRAY - v2.0"
Write-Host "====================================="
Write-Host ""

# Funcao para testar porta
function Test-Port {
    param($Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    }
    catch {
        return $false
    }
}

# 1. Verificar se QZ Tray esta rodando
Write-Host "1. Verificando processo QZ Tray..."
$qzProcess = Get-Process -Name "qz-tray" -ErrorAction SilentlyContinue
if ($qzProcess) {
    Write-Host "   OK: QZ Tray esta rodando (PID: $($qzProcess.Id))" -ForegroundColor Green
}
else {
    Write-Host "   ERRO: QZ Tray NAO esta rodando!" -ForegroundColor Red
    Write-Host "   Solucao: Inicie o QZ Tray pelo menu iniciar" -ForegroundColor Yellow
}
Write-Host ""

# 2. Verificar portas
Write-Host "2. Verificando portas..."
$port8181 = Test-Port -Port 8181
$port8182 = Test-Port -Port 8182

if ($port8181) {
    Write-Host "   OK: Porta 8181 (HTTP) esta aberta" -ForegroundColor Green
}
else {
    Write-Host "   ERRO: Porta 8181 (HTTP) esta fechada" -ForegroundColor Red
}

if ($port8182) {
    Write-Host "   OK: Porta 8182 (HTTPS) esta aberta" -ForegroundColor Green
}
else {
    Write-Host "   ERRO: Porta 8182 (HTTPS) esta fechada" -ForegroundColor Red
}
Write-Host ""

# 3. Verificar instalacao
Write-Host "3. Verificando instalacao..."
$qzPath = "${env:ProgramFiles}\QZ Tray\qz-tray.exe"

if (Test-Path $qzPath) {
    Write-Host "   OK: QZ Tray instalado em: $qzPath" -ForegroundColor Green
}
else {
    Write-Host "   ERRO: QZ Tray nao encontrado" -ForegroundColor Red
    Write-Host "   Solucao: Baixe em https://qz.io/download/" -ForegroundColor Yellow
}
Write-Host ""

# 4. Verificar impressoras
Write-Host "4. Verificando impressoras no sistema..."
$printers = Get-Printer -ErrorAction SilentlyContinue
if ($printers) {
    Write-Host "   OK: $($printers.Count) impressora(s) instalada(s)" -ForegroundColor Green
}
else {
    Write-Host "   AVISO: Nenhuma impressora encontrada" -ForegroundColor Yellow
}
Write-Host ""

# Resumo
Write-Host "====================================="
Write-Host "         RESUMO DO DIAGNOSTICO"
Write-Host "====================================="
Write-Host ""

if (-not $qzProcess) {
    Write-Host "PROBLEMA CRITICO: QZ Tray nao esta rodando" -ForegroundColor Red
}

if (-not $port8181 -and -not $port8182) {
    Write-Host "PROBLEMA CRITICO: Portas nao estao acessiveis" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione ENTER para sair..."
Read-Host