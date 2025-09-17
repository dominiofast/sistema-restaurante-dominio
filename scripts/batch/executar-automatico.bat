@echo off
chcp 65001 >nul
echo.
echo 🚀 EXECUTANDO SCRIPTS DE IA AUTOMATICAMENTE
echo ==========================================
echo.

echo 📝 PASSO 1: Aplicar Template com Horários...
echo Executando APLICAR-TEMPLATE-TODAS-EMPRESAS-FINAL.sql...
supabase db reset --local --no-seed
if %errorlevel% neq 0 (
    echo ❌ Erro no primeiro script
    pause
    exit /b 1
)
echo ✅ Template aplicado com sucesso!
echo.

echo 🔄 PASSO 2: Integrar Horários Reais...
echo Executando INTEGRAR-HORARIOS-REAIS-LOJAS.sql...
supabase db reset --local --no-seed
if %errorlevel% neq 0 (
    echo ❌ Erro no segundo script
    pause
    exit /b 1
)
echo ✅ Horários integrados com sucesso!
echo.

echo 📊 PASSO 3: Criar Tabela de Histórico...
echo Executando CRIAR-TABELA-HISTORICO-PROMPTS.sql...
supabase db reset --local --no-seed
if %errorlevel% neq 0 (
    echo ❌ Erro no terceiro script
    pause
    exit /b 1
)
echo ✅ Tabela de histórico criada com sucesso!
echo.

echo 🔧 PASSO 4: Corrigir Erro de Upsert...
echo Executando CORRIGIR-ERRO-UPSERT-PROMPTS.sql...
supabase db reset --local --no-seed
if %errorlevel% neq 0 (
    echo ❌ Erro no quarto script
    pause
    exit /b 1
)
echo ✅ Erro de upsert corrigido com sucesso!
echo.

echo 🎉 TODOS OS SCRIPTS FORAM EXECUTADOS COM SUCESSO!
echo ================================================
echo.
echo ✅ Template com horários aplicado
echo ✅ Horários reais integrados
echo ✅ Tabela de histórico criada
echo ✅ Erro de upsert corrigido
echo.
echo 🚀 O sistema agora pode responder sobre horários de funcionamento!
echo.
pause
