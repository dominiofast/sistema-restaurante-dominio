# Script PowerShell para aplicar migração no Supabase
# Execute este script para aplicar as migrações

Write-Host "🚀 Aplicando migrações no Supabase..." -ForegroundColor Green

# Verificar se psql está disponível
if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✅ psql encontrado, aplicando migração..." -ForegroundColor Green
    
    # Aplicar migração do slug (se ainda não foi aplicada)
    Write-Host "📝 Aplicando migração de slug..." -ForegroundColor Yellow
    psql "postgresql://postgres:Li29088512@@@@@@@@db.epqppxteicfuzdblbluq.supabase.co:5432/postgres" -f "supabase/migrations/20250617154900-add-company-slug.sql"
    
    # Aplicar migração do branding
    Write-Host "🎨 Aplicando migração de branding..." -ForegroundColor Yellow
    psql "postgresql://postgres:Li29088512@@@@@@@@db.epqppxteicfuzdblbluq.supabase.co:5432/postgres" -f "supabase/migrations/20250617164200-add-cardapio-digital-branding.sql"
    
    Write-Host "✅ Migrações aplicadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ psql não encontrado." -ForegroundColor Red
    Write-Host "📋 Instruções alternativas:" -ForegroundColor Yellow
    Write-Host "1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/epqppxteicfuzdblbluq" -ForegroundColor Cyan
    Write-Host "2. Vá em 'SQL Editor'" -ForegroundColor Cyan
    Write-Host "3. Cole e execute o conteúdo dos arquivos:" -ForegroundColor Cyan
    Write-Host "   - supabase/migrations/20250617154900-add-company-slug.sql" -ForegroundColor White
    Write-Host "   - supabase/migrations/20250617164200-add-cardapio-digital-branding.sql" -ForegroundColor White
    Write-Host "4. Execute cada migração separadamente" -ForegroundColor Cyan
}

Write-Host "🎯 Após aplicar as migrações, você pode enviar o prompt para a Lovable!" -ForegroundColor Magenta
