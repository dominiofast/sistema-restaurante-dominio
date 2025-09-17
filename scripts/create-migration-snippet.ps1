Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   CRIAR SNIPPET SQL PARA MIGRATION SUPABASE   " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se existe a pasta de migrations
if (!(Test-Path "supabase/migrations")) {
    Write-Host "❌ Pasta supabase/migrations não encontrada." -ForegroundColor Red
    Write-Host "📁 Execute este script na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Listar arquivos de migration
Write-Host "📋 Procurando migrations..." -ForegroundColor Yellow
$migrations = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name

if ($migrations.Count -eq 0) {
    Write-Host "❌ Nenhuma migration encontrada em supabase/migrations/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📂 Migrations encontradas:" -ForegroundColor Cyan
$index = 1
foreach ($migration in $migrations) {
    Write-Host "   $index. $($migration.Name)" -ForegroundColor White
    $index++
}

# Perguntar qual migration aplicar
Write-Host ""
$selectedIndex = Read-Host "Digite o número da migration que deseja criar snippet (ou ENTER para todas)"

if ([string]::IsNullOrWhiteSpace($selectedIndex)) {
    # Criar snippet com todas as migrations
    Write-Host ""
    Write-Host "✅ Criando snippet com TODAS as migrations..." -ForegroundColor Green
    
    $allMigrations = ""
    foreach ($migration in $migrations) {
        $content = Get-Content $migration.FullName -Raw
        $allMigrations += @"

-- ================================================
-- MIGRATION: $($migration.Name)
-- ================================================

$content

"@
    }
    
    $migrationContent = $allMigrations
    $snippetName = "Aplicar Todas Migrations - $(Get-Date -Format 'yyyy-MM-dd')"
} else {
    # Criar snippet com migration específica
    $selectedMigration = $migrations[[int]$selectedIndex - 1]
    Write-Host ""
    Write-Host "✅ Migration selecionada: $($selectedMigration.Name)" -ForegroundColor Green
    
    $migrationContent = Get-Content $selectedMigration.FullName -Raw
    $snippetName = "Migration - $($selectedMigration.Name)"
}

# Criar o SQL do snippet
$snippetSQL = @"
-- ================================================
-- SNIPPET: $snippetName
-- Criado em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
-- ================================================
-- 
-- Este snippet contém as migrations do projeto.
-- Execute com cuidado em produção!
-- 
-- Para executar: Selecione todo o código e clique em "Run"
-- ================================================

-- Verificar se as tabelas já existem (opcional)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('company_addresses', 'companies', 'profiles');

-- ================================================
-- INÍCIO DAS MIGRATIONS
-- ================================================

$migrationContent

-- ================================================
-- FIM DAS MIGRATIONS
-- ================================================

-- Verificar se as migrations foram aplicadas com sucesso
SELECT 
    'company_addresses' as tabela,
    COUNT(*) as existe
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'company_addresses'

UNION ALL

SELECT 
    'Políticas RLS' as tabela,
    COUNT(*) as quantidade
FROM pg_policies
WHERE tablename = 'company_addresses';
"@

# Copiar para área de transferência
$snippetSQL | Set-Clipboard

# Criar arquivo local também
$snippetFile = "supabase-snippet-$(Get-Date -Format 'yyyyMMdd-HHmmss').sql"
$snippetSQL | Out-File -FilePath $snippetFile -Encoding UTF8

Write-Host ""
Write-Host "✅ Snippet SQL criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 INSTRUÇÕES PARA ADICIONAR O SNIPPET NO SUPABASE:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. O SQL foi copiado para a área de transferência (Ctrl+V)" -ForegroundColor White
Write-Host ""
Write-Host "2. No Supabase SQL Editor:" -ForegroundColor White
Write-Host "   a) Clique no botão '+' ao lado de 'Consultas de pesquisa'" -ForegroundColor Cyan
Write-Host "   b) Dê um nome ao snippet: '$snippetName'" -ForegroundColor Cyan
Write-Host "   c) Cole o SQL (Ctrl+V)" -ForegroundColor Cyan
Write-Host "   d) Clique em 'Salvar'" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Para executar o snippet salvo:" -ForegroundColor White
Write-Host "   a) Clique no snippet na lista lateral" -ForegroundColor Cyan
Write-Host "   b) Revise o código" -ForegroundColor Cyan
Write-Host "   c) Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor Cyan
Write-Host ""

# Mostrar opções
Write-Host "OPÇÕES:" -ForegroundColor Yellow
Write-Host "1. Abrir o Supabase SQL Editor no navegador" -ForegroundColor White
Write-Host "2. Ver o SQL completo aqui" -ForegroundColor White
Write-Host "3. Abrir o arquivo SQL salvo" -ForegroundColor White
Write-Host "4. Sair" -ForegroundColor White
Write-Host ""

$option = Read-Host "Escolha uma opção (1-4)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Abrindo SQL Editor..." -ForegroundColor Yellow
        Start-Process "https://app.supabase.com"
        Write-Host "✅ Navegador aberto! O SQL está na área de transferência." -ForegroundColor Green
        Write-Host ""
        Write-Host "📝 Lembre-se de:" -ForegroundColor Yellow
        Write-Host "   - Clicar no '+' para criar novo snippet" -ForegroundColor White
        Write-Host "   - Dar o nome: $snippetName" -ForegroundColor White
        Write-Host "   - Colar o SQL (Ctrl+V)" -ForegroundColor White
    }
    "2" {
        Write-Host ""
        Write-Host "📄 SQL DO SNIPPET:" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host $snippetSQL
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ SQL está na área de transferência (Ctrl+V)" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📄 Abrindo arquivo SQL..." -ForegroundColor Yellow
        Start-Process notepad.exe $snippetFile
        Write-Host "✅ Arquivo aberto!" -ForegroundColor Green
        Write-Host "📁 Salvo como: $snippetFile" -ForegroundColor Gray
    }
    default {
        Write-Host ""
        Write-Host "✅ SQL está na área de transferência (Ctrl+V)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "💡 DICAS:" -ForegroundColor Yellow
Write-Host "   - Snippets salvos ficam disponíveis para uso futuro" -ForegroundColor White
Write-Host "   - Você pode editar o snippet depois de salvar" -ForegroundColor White
Write-Host "   - Use snippets para queries frequentes" -ForegroundColor White
Write-Host "   - Arquivo local salvo: $snippetFile" -ForegroundColor Gray
Write-Host "" 