# Script para executar os scripts SQL de IA
# Este script abre os arquivos SQL para facilitar a cópia

Write-Host "🚀 EXECUTANDO SCRIPTS DE IA - SUPABASE" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# 1. Aplicar Template com Horários
Write-Host "📝 PASSO 1: APLICAR TEMPLATE COM HORÁRIOS" -ForegroundColor Yellow
Write-Host "Arquivo: APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql" -ForegroundColor Cyan
Write-Host "Ação: Copie o conteúdo e execute no SQL Editor do Supabase Dashboard" -ForegroundColor White
Write-Host ""

# Abrir o arquivo no notepad
Start-Process notepad "APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql"

Write-Host "✅ Arquivo aberto no Notepad" -ForegroundColor Green
Write-Host "📋 Copie todo o conteúdo e cole no SQL Editor do Supabase" -ForegroundColor White
Write-Host ""

# Aguardar confirmação
Read-Host "Pressione ENTER quando terminar de executar o primeiro script"

# 2. Integrar Horários Reais
Write-Host "🔄 PASSO 2: INTEGRAR HORÁRIOS REAIS" -ForegroundColor Yellow
Write-Host "Arquivo: INTEGRAR-HORARIOS-REAIS-LOJAS.sql" -ForegroundColor Cyan
Write-Host "Ação: Copie o conteúdo e execute no SQL Editor do Supabase Dashboard" -ForegroundColor White
Write-Host ""

# Abrir o arquivo no notepad
Start-Process notepad "INTEGRAR-HORARIOS-REAIS-LOJAS.sql"

Write-Host "✅ Arquivo aberto no Notepad" -ForegroundColor Green
Write-Host "📋 Copie todo o conteúdo e cole no SQL Editor do Supabase" -ForegroundColor White
Write-Host ""

# Aguardar confirmação
Read-Host "Pressione ENTER quando terminar de executar o segundo script"

# 3. Criar Tabela de Histórico (Opcional)
Write-Host "📊 PASSO 3: CRIAR TABELA DE HISTÓRICO (OPCIONAL)" -ForegroundColor Yellow
Write-Host "Arquivo: CRIAR-TABELA-HISTORICO-PROMPTS.sql" -ForegroundColor Cyan
Write-Host "Ação: Copie o conteúdo e execute no SQL Editor do Supabase Dashboard" -ForegroundColor White
Write-Host ""

# Abrir o arquivo no notepad
Start-Process notepad "CRIAR-TABELA-HISTORICO-PROMPTS.sql"

Write-Host "✅ Arquivo aberto no Notepad" -ForegroundColor Green
Write-Host "📋 Copie todo o conteúdo e cole no SQL Editor do Supabase" -ForegroundColor White
Write-Host ""

# Aguardar confirmação
Read-Host "Pressione ENTER quando terminar de executar o terceiro script"

# 4. Corrigir Erro de Upsert (se necessário)
Write-Host "🔧 PASSO 4: CORRIGIR ERRO DE UPSERT (SE NECESSÁRIO)" -ForegroundColor Yellow
Write-Host "Arquivo: CORRIGIR-ERRO-UPSERT-PROMPTS.sql" -ForegroundColor Cyan
Write-Host "Ação: Execute apenas se houver erro de chave duplicada" -ForegroundColor White
Write-Host ""

# Abrir o arquivo no notepad
Start-Process notepad "CORRIGIR-ERRO-UPSERT-PROMPTS.sql"

Write-Host "✅ Arquivo aberto no Notepad" -ForegroundColor Green
Write-Host "📋 Execute apenas se necessário" -ForegroundColor White
Write-Host ""

# Aguardar confirmação
Read-Host "Pressione ENTER quando terminar (ou se não precisar executar)"

Write-Host ""
Write-Host "🎉 TODOS OS SCRIPTS FORAM EXECUTADOS!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Template com horários aplicado" -ForegroundColor Green
Write-Host "✅ Horários reais integrados" -ForegroundColor Green
Write-Host "✅ Tabela de histórico criada (se executado)" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora o sistema pode responder sobre horários de funcionamento!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
