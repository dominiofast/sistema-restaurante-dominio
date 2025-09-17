# Script para criar novos arquivos nas pastas corretas
# Uso: .\scripts\criar-arquivo.ps1 -Type sql -Name "meu-arquivo" -Category "cashback"

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("sql", "ps1", "js", "bat", "html", "md")]
    [string]$Type,
    
    [Parameter(Mandatory=$true)]
    [string]$Name,
    
    [Parameter(Mandatory=$false)]
    [string]$Category = "general"
)

# Define os caminhos base para cada tipo de arquivo
$paths = @{
    "sql" = @{
        "cashback" = "database\cashback"
        "fiscal" = "database\fiscal"
        "horarios" = "database\horarios"
        "whatsapp" = "database\whatsapp"
        "migrations" = "database\migrations"
        "general" = "database\queries"
    }
    "ps1" = "scripts\powershell"
    "js" = "scripts\nodejs"
    "bat" = "scripts\batch"
    "html" = "test-files"
    "md" = "docs"
}

# Determina o caminho baseado no tipo
if ($Type -eq "sql") {
    $basePath = $paths[$Type][$Category]
    if (-not $basePath) {
        $basePath = $paths[$Type]["general"]
    }
} else {
    $basePath = $paths[$Type]
}

# Garante que o nome tem a extensão correta
if (-not $Name.EndsWith(".$Type")) {
    $Name = "$Name.$Type"
}

# Caminho completo do arquivo
$fullPath = Join-Path $basePath $Name

# Cria o diretório se não existir
$directory = Split-Path $fullPath -Parent
if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
    Write-Host "📁 Diretório criado: $directory" -ForegroundColor Green
}

# Templates para cada tipo de arquivo
$templates = @{
    "sql" = @"
-- =============================================
-- Arquivo: $Name
-- Data: $(Get-Date -Format "dd/MM/yyyy HH:mm")
-- Categoria: $Category
-- Descrição: [Adicione uma descrição aqui]
-- =============================================

-- Seu código SQL aqui

"@
    "ps1" = @"
<#
.SYNOPSIS
    $Name
.DESCRIPTION
    [Adicione uma descrição aqui]
.PARAMETER
    [Adicione parâmetros se necessário]
.EXAMPLE
    .\$Name
.NOTES
    Data: $(Get-Date -Format "dd/MM/yyyy")
#>

# Seu código PowerShell aqui

"@
    "js" = @"
/**
 * Arquivo: $Name
 * Data: $(Get-Date -Format "dd/MM/yyyy")
 * Descrição: [Adicione uma descrição aqui]
 */

// Seu código JavaScript aqui

"@
    "bat" = @"
@echo off
REM =============================================
REM Arquivo: $Name
REM Data: $(Get-Date -Format "dd/MM/yyyy")
REM Descrição: [Adicione uma descrição aqui]
REM =============================================

REM Seu código batch aqui

"@
    "html" = @"
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$Name</title>
</head>
<body>
    <h1>$Name</h1>
    <!-- Seu código HTML aqui -->
</body>
</html>
"@
    "md" = @"
# $Name

> Data: $(Get-Date -Format "dd/MM/yyyy")

## Descrição

[Adicione uma descrição aqui]

## Conteúdo

[Adicione o conteúdo aqui]

"@
}

# Cria o arquivo com o template apropriado
$template = $templates[$Type]
if ($template) {
    $template | Out-File -FilePath $fullPath -Encoding UTF8
    Write-Host "✅ Arquivo criado com sucesso: $fullPath" -ForegroundColor Green
    Write-Host "📝 Template $Type aplicado" -ForegroundColor Cyan
} else {
    New-Item -ItemType File -Path $fullPath -Force | Out-Null
    Write-Host "✅ Arquivo criado: $fullPath" -ForegroundColor Green
}

# Abre o arquivo no editor padrão (opcional)
Write-Host "`n🎯 Para abrir o arquivo, use: code `"$fullPath`"" -ForegroundColor Yellow
