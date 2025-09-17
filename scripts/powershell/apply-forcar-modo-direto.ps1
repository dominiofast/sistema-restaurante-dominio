# 🚨 FORÇAR MODO DIRETO AGORA MESMO - Domínio Pizzas
# O use_direct_mode está como false, vou forçar para true

Write-Host "🚨 CORREÇÃO URGENTE: FORÇANDO MODO DIRETO!" -ForegroundColor Red
Write-Host ""

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content "FORCAR-MODO-DIRETO-AGORA.sql" -Raw

Write-Host "📋 EXECUTE ESTE SQL NO SUPABASE SQL EDITOR AGORA:" -ForegroundColor Red
Write-Host "================================================" -ForegroundColor Red
Write-Host ""
Write-Host $sqlContent -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Red
Write-Host "🚨 EXECUTE AGORA MESMO!" -ForegroundColor Red
Write-Host "💡 ISSO VAI FORÇAR O use_direct_mode = true" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Aguardando você executar o SQL..." -ForegroundColor Cyan
Write-Host "🔍 Depois me mostre o resultado!" -ForegroundColor Cyan
