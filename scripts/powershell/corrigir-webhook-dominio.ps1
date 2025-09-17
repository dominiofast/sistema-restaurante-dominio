# Script para corrigir o problema de cross-talk entre Domínio e Quadrata
# O problema é que o webhook da Domínio está apontando para uma função inexistente

Write-Host "CORRECAO DO WEBHOOK DA DOMINIO" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar se o Supabase CLI está disponível
Write-Host "Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = supabase --version
    Write-Host "Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instale primeiro." -ForegroundColor Red
    Write-Host "   npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# 2. Executar a função de correção
Write-Host ""
Write-Host "Executando correcao automatica..." -ForegroundColor Yellow

try {
    # Chamar a função Edge Function de correção
    $response = curl -X POST "https://epqppxteicfuzdblbluq.supabase.co/functions/v1/fix-dominio-webhook" `
        -H "Authorization: Bearer $env:SUPABASE_SERVICE_ROLE_KEY" `
        -H "Content-Type: application/json" `
        -d '{}' 2>$null

    if ($LASTEXITCODE -eq 0) {
        $result = $response | ConvertFrom-Json
        
        if ($result.success) {
            Write-Host "Correcao aplicada com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "RESULTADO:" -ForegroundColor Cyan
            Write-Host "   • Webhook da Dominio corrigido: $($result.changes.dominio_webhook_fixed)" -ForegroundColor White
            Write-Host "   • Conflito de instance_key resolvido: $($result.changes.instance_key_conflict_resolved)" -ForegroundColor White
            Write-Host ""
            Write-Host "CONFIGURACOES FINAIS:" -ForegroundColor Cyan
            Write-Host "   Domínio:" -ForegroundColor Yellow
            Write-Host "     • Instance Key: $($result.final_configs.dominio.instance_key)" -ForegroundColor White
            Write-Host "     • Webhook: $($result.final_configs.dominio.webhook)" -ForegroundColor White
            Write-Host "     • Ativo: $($result.final_configs.dominio.is_active)" -ForegroundColor White
            
            if ($result.final_configs.quadrata) {
                Write-Host "   Quadrata:" -ForegroundColor Yellow
                Write-Host "     • Instance Key: $($result.final_configs.quadrata.instance_key)" -ForegroundColor White
                Write-Host "     • Webhook: $($result.final_configs.quadrata.webhook)" -ForegroundColor White
                Write-Host "     • Ativo: $($result.final_configs.quadrata.is_active)" -ForegroundColor White
            }
        } else {
            Write-Host "❌ Erro na correção: $($result.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erro ao chamar função de correção" -ForegroundColor Red
        Write-Host "   Verifique se a função fix-dominio-webhook foi deployada" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erro ao executar correção: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Teste enviando uma mensagem para o WhatsApp da Domínio" -ForegroundColor White
Write-Host "   2. Verifique se não está mais recebendo mensagens da Quadrata" -ForegroundColor White
Write-Host "   3. Teste enviando uma mensagem para o WhatsApp da Quadrata" -ForegroundColor White
Write-Host "   4. Verifique se cada empresa responde corretamente" -ForegroundColor White

Write-Host ""
Write-Host "Correcao concluida!" -ForegroundColor Green
