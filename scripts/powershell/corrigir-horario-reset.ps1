# Script para corrigir o horário de reset dos pedidos
# Problema: Pedidos estavam zerando às 21:00 em vez de 00:00
# Solução: Ajustar cron job para executar às 00:01 BRT (03:01 UTC)

Write-Host "CORREÇÃO DO HORÁRIO DE RESET DOS PEDIDOS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Problema identificado:" -ForegroundColor Yellow
Write-Host "  • Cron job estava executando às 00:01 UTC" -ForegroundColor White
Write-Host "  • Isso corresponde às 21:00 no horário local (Brasil)" -ForegroundColor White
Write-Host "  • Pedidos estavam zerando às 21:00 em vez de 00:00" -ForegroundColor White
Write-Host ""

Write-Host "Solução:" -ForegroundColor Yellow
Write-Host "  • Ajustar cron job para executar às 03:01 UTC" -ForegroundColor White
Write-Host "  • Isso corresponde às 00:01 no horário local (Brasil)" -ForegroundColor White
Write-Host ""

Write-Host "Executando correção..." -ForegroundColor Yellow

try {
    # Ler o script SQL
    $sqlScript = Get-Content "corrigir-horario-reset-pedidos.sql" -Raw
    
    # Configurar headers para a requisição
    $headers = @{
        "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwcXBweHRlaWNmdXpkYmxibHVxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQ5NzI5MCwiZXhwIjoyMDUzMDczMjkwfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"
        "Content-Type" = "application/json"
        "Prefer" = "return=representation"
    }
    
    # Corpo da requisição
    $body = @{
        query = $sqlScript
    } | ConvertTo-Json -Depth 10
    
    # Executar a correção via API do Supabase
    $response = Invoke-RestMethod -Uri "https://epqppxteicfuzdblbluq.supabase.co/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Correção aplicada com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resultado:" -ForegroundColor Cyan
    Write-Host "  • Cron job antigo removido" -ForegroundColor White
    Write-Host "  • Novo cron job criado: 'reset-daily-pedido-sequences-brt'" -ForegroundColor White
    Write-Host "  • Horário de execução: 03:01 UTC (00:01 BRT)" -ForegroundColor White
    Write-Host ""
    Write-Host "A partir de agora, os pedidos irão zerar às 00:01 (meia-noite e 1 minuto) no horário local!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erro ao aplicar correção: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternativa: Execute o script SQL diretamente no Supabase Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Acesse: https://supabase.com/dashboard/project/epqppxteicfuzdblbluq/sql" -ForegroundColor White
    Write-Host "  2. Cole o conteúdo do arquivo 'corrigir-horario-reset-pedidos.sql'" -ForegroundColor White
    Write-Host "  3. Execute a query" -ForegroundColor White
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
