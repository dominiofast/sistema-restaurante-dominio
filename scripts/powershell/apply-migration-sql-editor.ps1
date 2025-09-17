Write-Host "================================================" -ForegroundColor Cyan
Write-Host "    APLICAR MIGRATION VIA SQL EDITOR SUPABASE  " -ForegroundColor Cyan
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
$selectedIndex = Read-Host "Digite o número da migration que deseja aplicar (ou ENTER para a mais recente)"

if ([string]::IsNullOrWhiteSpace($selectedIndex)) {
    $selectedMigration = $migrations[-1]
} else {
    $selectedMigration = $migrations[[int]$selectedIndex - 1]
}

Write-Host ""
Write-Host "✅ Migration selecionada: $($selectedMigration.Name)" -ForegroundColor Green

# Ler o conteúdo da migration
$migrationContent = Get-Content $selectedMigration.FullName -Raw

# Criar arquivo temporário com instruções e SQL
$tempFile = [System.IO.Path]::GetTempFileName()
$tempFile = [System.IO.Path]::ChangeExtension($tempFile, ".sql")

$fullContent = @"
-- ================================================
-- MIGRATION: $($selectedMigration.Name)
-- ================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO o conteúdo abaixo
-- 2. Acesse o SQL Editor do Supabase
-- 3. Cole o conteúdo
-- 4. Clique em "Run" ou pressione Ctrl+Enter
-- 
-- ⚠️ ATENÇÃO: Esta migration será aplicada em PRODUÇÃO!
-- ================================================

$migrationContent

-- ================================================
-- FIM DA MIGRATION
-- ================================================
"@

# Salvar no arquivo temporário
$fullContent | Out-File -FilePath $tempFile -Encoding UTF8

# Copiar para a área de transferência
$fullContent | Set-Clipboard

Write-Host ""
Write-Host "✅ SQL copiado para a área de transferência!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. O SQL foi copiado automaticamente (Ctrl+V para colar)" -ForegroundColor White
Write-Host ""
Write-Host "2. Acesse o SQL Editor do Supabase:" -ForegroundColor White
Write-Host "   https://app.supabase.com/project/_/sql/new" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Cole o conteúdo (Ctrl+V)" -ForegroundColor White
Write-Host ""
Write-Host "4. Revise o SQL e clique em 'Run'" -ForegroundColor White
Write-Host ""

# Perguntar se quer abrir o arquivo ou o navegador
Write-Host "OPÇÕES:" -ForegroundColor Yellow
Write-Host "1. Abrir o SQL Editor no navegador" -ForegroundColor White
Write-Host "2. Abrir o arquivo SQL no editor de texto" -ForegroundColor White
Write-Host "3. Ver o SQL aqui no terminal" -ForegroundColor White
Write-Host "4. Sair" -ForegroundColor White
Write-Host ""

$option = Read-Host "Escolha uma opção (1-4)"

switch ($option) {
    "1" {
        Write-Host ""
        Write-Host "🌐 Abrindo SQL Editor..." -ForegroundColor Yellow
        Write-Host "📝 Você precisará:" -ForegroundColor Cyan
        Write-Host "   - Fazer login no Supabase" -ForegroundColor White
        Write-Host "   - Selecionar seu projeto" -ForegroundColor White
        Write-Host "   - Colar o SQL (Ctrl+V)" -ForegroundColor White
        Write-Host ""
        
        # Tentar abrir o navegador
        Start-Process "https://app.supabase.com"
        
        Write-Host "✅ Navegador aberto! O SQL está na área de transferência." -ForegroundColor Green
    }
    "2" {
        Write-Host ""
        Write-Host "📄 Abrindo arquivo SQL..." -ForegroundColor Yellow
        Start-Process notepad.exe $tempFile
        Write-Host "✅ Arquivo aberto no Notepad!" -ForegroundColor Green
    }
    "3" {
        Write-Host ""
        Write-Host "📄 CONTEÚDO DA MIGRATION:" -ForegroundColor Cyan
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host $fullContent
        Write-Host "================================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "✅ SQL está na área de transferência (Ctrl+V para colar)" -ForegroundColor Green
    }
    default {
        Write-Host ""
        Write-Host "✅ SQL está na área de transferência (Ctrl+V para colar)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "💡 DICA: Após aplicar a migration:" -ForegroundColor Yellow
Write-Host "   - Verifique se a tabela foi criada corretamente" -ForegroundColor White
Write-Host "   - Teste as permissões (RLS policies)" -ForegroundColor White
Write-Host "   - Faça o deploy da aplicação" -ForegroundColor White
Write-Host ""

# Limpar arquivo temporário após 5 minutos
Write-Host "🗑️ O arquivo temporário será deletado em 5 minutos..." -ForegroundColor Gray
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 300
    Remove-Item $args[0] -Force -ErrorAction SilentlyContinue
} -ArgumentList $tempFile | Out-Null 