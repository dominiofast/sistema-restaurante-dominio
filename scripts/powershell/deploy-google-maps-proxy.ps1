# Script para fazer deploy da Edge Function do Google Maps Proxy
Write-Host "🚀 Deployando Google Maps Proxy..." -ForegroundColor Green

# Verificar se o Supabase CLI está instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instale primeiro: https://supabase.com/docs/guides/cli" -ForegroundColor Red
    exit 1
}

# Fazer deploy da Edge Function
Write-Host "📦 Fazendo deploy da Edge Function google-maps-proxy..." -ForegroundColor Yellow
supabase functions deploy google-maps-proxy

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "🌐 URL da Edge Function: https://[SEU_PROJETO].supabase.co/functions/v1/google-maps-proxy" -ForegroundColor Cyan
    Write-Host "📝 Agora o frontend pode fazer requisições para a API do Google Maps sem problemas de CORS!" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro no deploy. Verifique os logs acima." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Configuração concluída! Teste a busca de endereços agora." -ForegroundColor Green
