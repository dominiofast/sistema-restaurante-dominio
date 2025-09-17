# CORRECAO DOMINIO PIZZAS - VERSAO SIMPLES
# Script para corrigir o problema do Assistant ID excluido

Write-Host "Iniciando correcao da Dominio Pizzas..." -ForegroundColor Yellow

# Verificar se o arquivo SQL existe
$sqlFile = "CORRECAO-ASSISTENTE-DOMINIO-PIZZAS.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Arquivo $sqlFile nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivo SQL encontrado: $sqlFile" -ForegroundColor Green

# Ler o conteudo do arquivo SQL
$sqlContent = Get-Content $sqlFile -Raw
Write-Host "Conteudo do arquivo carregado" -ForegroundColor Green

Write-Host ""
Write-Host "INSTRUCOES PARA APLICAR A CORRECAO:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse o Supabase Dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/epqppxteicfuzdblbluq" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host ""
Write-Host "3. Cole o seguinte SQL e execute:" -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Gray
Write-Host $sqlContent -ForegroundColor White
Write-Host "================================================" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Verifique se as consultas de verificacao retornaram dados" -ForegroundColor White
Write-Host ""
Write-Host "5. Teste enviando uma mensagem para o WhatsApp da Dominio Pizzas" -ForegroundColor Green
Write-Host ""
Write-Host "O que sera corrigido:" -ForegroundColor Cyan
Write-Host "   Removido Assistant ID excluido da integracao WhatsApp" -ForegroundColor White
Write-Host "   Configurado agente IA personalizado para Dominio Pizzas" -ForegroundColor White
Write-Host "   Criado prompt personalizado com especializacao em pizzas" -ForegroundColor White
Write-Host "   Limpado logs antigos para fresh start" -ForegroundColor White
Write-Host ""
Write-Host "Agora o assistente deve:" -ForegroundColor Yellow
Write-Host "   Usar apenas a API OpenAI (sem Assistant ID)" -ForegroundColor White
Write-Host "   Responder com o prompt personalizado da Dominio Pizzas" -ForegroundColor White
Write-Host "   Parar de enviar mensagens padrao genericas" -ForegroundColor White
