Write-Host "================================================" -ForegroundColor Cyan
Write-Host "        APLICAR MIGRATIONS NO SUPABASE          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (!(Test-Path "supabase/config.toml")) {
    Write-Host "Erro: Arquivo supabase/config.toml não encontrado." -ForegroundColor Red
    Write-Host "Execute este script na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

Write-Host "Opcoes disponiveis:" -ForegroundColor Yellow
Write-Host "1. Aplicar via Supabase CLI (requer CLI instalado)" -ForegroundColor White
Write-Host "2. Gerar arquivo SQL consolidado para aplicar manualmente" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Escolha uma opcao (1 ou 2)"

if ($opcao -eq "1") {
    # Verificar se o Supabase CLI está instalado
    if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
        Write-Host "Supabase CLI nao encontrado." -ForegroundColor Red
        Write-Host "Instale com: scoop install supabase" -ForegroundColor Yellow
        Write-Host "ou visite: https://supabase.com/docs/guides/cli" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "Aplicando migrations via CLI..." -ForegroundColor Green
    supabase db push
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Migrations aplicadas com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao aplicar migrations" -ForegroundColor Red
    }
    
} elseif ($opcao -eq "2") {
    Write-Host "Gerando arquivo SQL consolidado..." -ForegroundColor Yellow
    
    $outputFile = "migrations-consolidadas.sql"
    $migrations = Get-ChildItem -Path "supabase/migrations" -Filter "*.sql" | Sort-Object Name
    
    "-- Migrations Consolidadas - $(Get-Date)" | Out-File $outputFile
    "-- Total de migrations: $($migrations.Count)" | Out-File $outputFile -Append
    "" | Out-File $outputFile -Append
    
    foreach ($migration in $migrations) {
        "-- ================================================" | Out-File $outputFile -Append
        "-- Migration: $($migration.Name)" | Out-File $outputFile -Append
        "-- ================================================" | Out-File $outputFile -Append
        "" | Out-File $outputFile -Append
        
        Get-Content $migration.FullName | Out-File $outputFile -Append
        "" | Out-File $outputFile -Append
        "" | Out-File $outputFile -Append
    }
    
    Write-Host "Arquivo criado: $outputFile" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/project/epqppxteicfuzdblbluq" -ForegroundColor Cyan
    Write-Host "2. Va em SQL Editor" -ForegroundColor Cyan
    Write-Host "3. Cole o conteudo do arquivo $outputFile" -ForegroundColor Cyan
    Write-Host "4. Execute as queries" -ForegroundColor Cyan
    
    # Copiar para clipboard
    Get-Content $outputFile | clip
    Write-Host ""
    Write-Host "O conteudo foi copiado para a area de transferencia!" -ForegroundColor Green
    
} else {
    Write-Host "Opcao invalida" -ForegroundColor Red
} 