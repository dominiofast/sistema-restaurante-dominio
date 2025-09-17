# 🔧 CORRIGIR SLUG DO PROMPT - Domínio Pizzas
# Verificar o slug correto da empresa e corrigir o prompt

Write-Host "🔧 CORRIGINDO SLUG DO PROMPT..." -ForegroundColor Yellow
Write-Host ""

# Ler o conteúdo do arquivo SQL
$sqlContent = Get-Content "CORRIGIR-SLUG-PROMPT.sql" -Raw

Write-Host "📋 EXECUTE ESTE SQL NO SUPABASE SQL EDITOR:" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host $sqlContent -ForegroundColor White
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "📋 COPIE E COLE O SQL ACIMA NO SUPABASE SQL EDITOR" -ForegroundColor Green
Write-Host "🔍 ISSO VAI MOSTRAR O SLUG CORRETO E OS PROMPTS" -ForegroundColor Yellow
Write-Host ""

Write-Host "⏳ Aguardando você executar o SQL..." -ForegroundColor Cyan
Write-Host "💡 Depois me diga qual é o slug correto da empresa!" -ForegroundColor Cyan
