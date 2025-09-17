# 🍕 CORRIGIR PROMPT DOMÍNIO PIZZAS
# Substituir o template genérico pelo prompt personalizado

Write-Host "🍕 CORRIGINDO PROMPT DA DOMÍNIO PIZZAS..." -ForegroundColor Yellow
Write-Host ""

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content "CORRIGIR-PROMPT-DOMINIO-PIZZAS.sql" -Raw

Write-Host "📋 EXECUTE ESTE SQL NO SUPABASE SQL EDITOR:" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host $sqlContent -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "📋 COPIE E COLE O SQL ACIMA NO SUPABASE SQL EDITOR" -ForegroundColor Green
Write-Host "🍕 ISSO VAI CORRIGIR O PROMPT PERSONALIZADO" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Aguardando você executar o SQL..." -ForegroundColor Cyan
Write-Host "🔍 Depois me mostre o resultado!" -ForegroundColor Cyan
