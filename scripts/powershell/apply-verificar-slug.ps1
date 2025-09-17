# 🔍 VERIFICAR SLUG DA EMPRESA - Domínio Pizzas
# Descobrir qual é o slug correto para configurar o prompt

Write-Host "🔍 VERIFICANDO SLUG DA EMPRESA DOMÍNIO PIZZAS..." -ForegroundColor Yellow
Write-Host ""

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content "VERIFICAR-SLUG-EMPRESA.sql" -Raw

Write-Host "📋 EXECUTE ESTE SQL NO SUPABASE SQL EDITOR:" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host $sqlContent -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "📋 COPIE E COLE O SQL ACIMA NO SUPABASE SQL EDITOR" -ForegroundColor Green
Write-Host "🔍 ISSO VAI MOSTRAR O SLUG CORRETO DA EMPRESA" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Aguardando você executar o SQL..." -ForegroundColor Cyan
Write-Host "💡 Depois me diga qual é o slug que apareceu!" -ForegroundColor Cyan
