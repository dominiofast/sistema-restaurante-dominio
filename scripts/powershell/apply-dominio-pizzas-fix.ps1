# CORRECAO DOMINIO PIZZAS - ASSISTENTE IA
# Script para corrigir o problema do Assistant ID excluido

Write-Host "Iniciando correcao da Dominio Pizzas..." -ForegroundColor Yellow

# Verificar se o arquivo SQL existe
$sqlFile = "CORRECAO-ASSISTENTE-DOMINIO-PIZZAS.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Arquivo $sqlFile nao encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Arquivo SQL encontrado: $sqlFile" -ForegroundColor Green

# Ler o conteudo do arquivo SQL
$sqlContent = Get-Content $sqlFile -Raw
Write-Host "Conteudo do arquivo carregado" -ForegroundColor Green

# Verificar se o Supabase CLI esta instalado
try {
    $supabaseVersion = supabase --version
    Write-Host "Supabase CLI encontrado: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Supabase CLI nao encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Verificar se esta logado no Supabase
try {
    $projects = supabase projects list
    if ($projects -match "No projects found") {
        Write-Host "Nao esta logado no Supabase!" -ForegroundColor Red
        Write-Host "Faca login com: supabase login" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "Logado no Supabase" -ForegroundColor Green
} catch {
    Write-Host "Erro ao verificar login do Supabase!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Aplicando correcao..." -ForegroundColor Cyan
Write-Host ""

# Executar o script SQL
try {
    Write-Host "Enviando script para o Supabase..." -ForegroundColor Yellow
    
    # Salvar o SQL em um arquivo temporario
    $tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
    $sqlContent | Out-File -FilePath $tempFile -Encoding UTF8
    
    # Executar via Supabase CLI
    $result = supabase db reset --linked --db-url "postgresql://postgres.epqppxteicfuzdblbluq:MDT3OHEGIyu@aws-0-us-east-1.pooler.supabase.com:6543/postgres" --file $tempFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Correcao aplicada com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Erro ao aplicar correcao!" -ForegroundColor Red
        Write-Host "Resultado: $result" -ForegroundColor Red
    }
    
    # Limpar arquivo temporario
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    
} catch {
    Write-Host "Erro durante a execucao: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Correcao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "O que foi corrigido:" -ForegroundColor Cyan
Write-Host "   Removido Assistant ID excluido da integracao WhatsApp" -ForegroundColor White
Write-Host "   Configurado agente IA personalizado para Dominio Pizzas" -ForegroundColor White
Write-Host "   Criado prompt personalizado com especializacao em pizzas" -ForegroundColor White
Write-Host "   Limpado logs antigos para fresh start" -ForegroundColor White
Write-Host ""
Write-Host "Agora o assistente deve:" -ForegroundColor Yellow
Write-Host "   Usar apenas a API OpenAI (sem Assistant ID)" -ForegroundColor White
Write-Host "   Responder com o prompt personalizado da Dominio Pizzas" -ForegroundColor White
Write-Host "   Parar de enviar mensagens padrao genericas" -ForegroundColor White
Write-Host ""
Write-Host "Teste enviando uma mensagem para o WhatsApp da Dominio Pizzas!" -ForegroundColor Green
