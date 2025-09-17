# Script final para executar scripts de IA
Write-Host "🚀 EXECUTANDO SCRIPTS DE IA AUTOMATICAMENTE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Verificar se os arquivos existem
$arquivos = @(
    "APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql",
    "INTEGRAR-HORARIOS-REAIS-LOJAS.sql", 
    "CRIAR-TABELA-HISTORICO-PROMPTS.sql",
    "CORRIGIR-ERRO-UPSERT-PROMPTS.sql"
)

Write-Host "📋 Verificando arquivos..." -ForegroundColor Yellow
foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Write-Host "✅ $arquivo encontrado" -ForegroundColor Green
    } else {
        Write-Host "❌ $arquivo não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 TODOS OS SCRIPTS ESTÃO PRONTOS!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 SCRIPTS DISPONÍVEIS:" -ForegroundColor Yellow
Write-Host "1. APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql" -ForegroundColor Cyan
Write-Host "   → Aplica template com conhecimento de horários" -ForegroundColor White
Write-Host ""
Write-Host "2. INTEGRAR-HORARIOS-REAIS-LOJAS.sql" -ForegroundColor Cyan
Write-Host "   → Integra horários reais das tabelas" -ForegroundColor White
Write-Host ""
Write-Host "3. CRIAR-TABELA-HISTORICO-PROMPTS.sql" -ForegroundColor Cyan
Write-Host "   → Cria sistema de versionamento" -ForegroundColor White
Write-Host ""
Write-Host "4. CORRIGIR-ERRO-UPSERT-PROMPTS.sql" -ForegroundColor Cyan
Write-Host "   → Corrige erros de chave duplicada" -ForegroundColor White
Write-Host ""

Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o Supabase Dashboard" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Execute os scripts na ordem acima" -ForegroundColor White
Write-Host ""

Write-Host "🚀 RESULTADO ESPERADO:" -ForegroundColor Green
Write-Host "• Sistema de IA com conhecimento de horários" -ForegroundColor White
Write-Host "• Horários específicos de cada loja" -ForegroundColor White
Write-Host "• Sistema de versionamento de prompts" -ForegroundColor White
Write-Host "• Sem erros de chave duplicada" -ForegroundColor White
Write-Host ""

Write-Host "Pressione qualquer tecla para abrir os arquivos..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir todos os arquivos no notepad
foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Start-Process notepad $arquivo
        Write-Host "✅ Abrindo $arquivo" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎉 TODOS OS ARQUIVOS FORAM ABERTOS!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 INSTRUÇÕES FINAIS:" -ForegroundColor Yellow
Write-Host "1. Copie o conteúdo de cada arquivo" -ForegroundColor White
Write-Host "2. Cole no SQL Editor do Supabase" -ForegroundColor White
Write-Host "3. Execute na ordem: 1, 2, 3, 4" -ForegroundColor White
Write-Host "4. Aguarde a confirmação de cada execução" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Após executar todos, o sistema estará pronto!" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
