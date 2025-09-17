Write-Host "================================================" -ForegroundColor Cyan
Write-Host "        APLICAR MIGRATIONS NO SUPABASE          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Supabase CLI está instalado
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI não encontrado." -ForegroundColor Red
    Write-Host "📦 Instale com: scoop install supabase" -ForegroundColor Yellow
    Write-Host "   ou visite: https://supabase.com/docs/guides/cli" -ForegroundColor Gray
    exit 1
}

# Verificar se está no diretório correto
if (!(Test-Path "supabase/config.toml")) {
    Write-Host "❌ Arquivo supabase/config.toml não encontrado." -ForegroundColor Red
    Write-Host "📁 Execute este script na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Login no Supabase se necessário
Write-Host "🔍 Verificando autenticação..." -ForegroundColor Yellow
$authStatus = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "🔐 Fazendo login no Supabase..." -ForegroundColor Yellow
    supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha no login" -ForegroundColor Red
        exit 1
    }
}

# Verificar se o projeto está linkado
Write-Host "🔗 Verificando link com projeto..." -ForegroundColor Yellow
$dbStatus = supabase db remote list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Projeto não está linkado." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📝 Para obter o Project Ref:" -ForegroundColor Cyan
    Write-Host "   1. Acesse: https://app.supabase.com" -ForegroundColor White
    Write-Host "   2. Selecione seu projeto" -ForegroundColor White
    Write-Host "   3. Vá em Settings > General" -ForegroundColor White
    Write-Host "   4. Copie o Reference ID" -ForegroundColor White
    Write-Host ""
    
    $projectRef = Read-Host "Digite o Project Ref"
    
    Write-Host ""
    Write-Host "🔗 Linkando projeto..." -ForegroundColor Yellow
    supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao linkar projeto" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📋 Listando migrations locais..." -ForegroundColor Yellow
Write-Host ""

# Listar arquivos de migration
$migrations = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name

if ($migrations.Count -eq 0) {
    Write-Host "⚠️  Nenhuma migration encontrada em supabase/migrations/" -ForegroundColor Yellow
    exit 0
}

Write-Host "📂 Migrations encontradas:" -ForegroundColor Cyan
foreach ($migration in $migrations) {
    Write-Host "   - $($migration.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "📊 Status das migrations no banco remoto:" -ForegroundColor Yellow
supabase migration list

Write-Host ""
Write-Host "⚠️  ATENÇÃO: Esta ação aplicará as migrations no banco de PRODUÇÃO!" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Deseja continuar? (S/N)"

if ($confirm -ne 'S' -and $confirm -ne 's') {
    Write-Host "❌ Operação cancelada" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📤 Aplicando migrations..." -ForegroundColor Yellow
Write-Host ""

supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migrations aplicadas com sucesso!" -ForegroundColor Green
    Write-Host ""
    
    # Mostrar status atualizado
    Write-Host "📊 Status atualizado:" -ForegroundColor Cyan
    supabase migration list
    
    Write-Host ""
    Write-Host "🎉 Processo concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Teste as novas funcionalidades" -ForegroundColor White
    Write-Host "   2. Atualize os tipos TypeScript se necessário" -ForegroundColor White
    Write-Host "   3. Faça o deploy da aplicação" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Erro ao aplicar migrations" -ForegroundColor Red
    Write-Host "💡 Verifique os erros acima e tente novamente" -ForegroundColor Yellow
    exit 1
} 