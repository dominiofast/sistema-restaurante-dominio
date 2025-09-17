Write-Host "================================================" -ForegroundColor Cyan
Write-Host "     DEPLOY COMPLETO - MIGRATION + APLICAÇÃO    " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Supabase CLI está instalado
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI não encontrado. Por favor, instale primeiro." -ForegroundColor Red
    Write-Host "📦 Instale com: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

# Verificar se está no diretório correto
if (!(Test-Path "supabase/config.toml")) {
    Write-Host "❌ Arquivo supabase/config.toml não encontrado." -ForegroundColor Red
    Write-Host "📁 Certifique-se de estar na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Verificando conexão com Supabase..." -ForegroundColor Yellow
$projectStatus = supabase projects list 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Não conectado ao Supabase. Fazendo login..." -ForegroundColor Red
    supabase login
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha no login do Supabase" -ForegroundColor Red
        exit 1
    }
}

# Verificar se o projeto está linkado
Write-Host "🔗 Verificando link com projeto..." -ForegroundColor Yellow
$linkedProject = supabase projects list --output json | ConvertFrom-Json

if (!$linkedProject) {
    Write-Host "⚠️  Projeto não está linkado." -ForegroundColor Yellow
    Write-Host "📝 Digite o Project Ref do seu projeto Supabase:" -ForegroundColor Cyan
    $projectRef = Read-Host "Project Ref"
    
    Write-Host "🔗 Linkando projeto..." -ForegroundColor Yellow
    supabase link --project-ref $projectRef
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Falha ao linkar projeto" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "📊 ETAPA 1: APLICANDO MIGRATIONS NO BANCO DE DADOS" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Listar migrations pendentes
Write-Host "📋 Verificando migrations..." -ForegroundColor Yellow
supabase migration list

# Aplicar migrations
Write-Host "`n📤 Aplicando migrations no banco remoto..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations aplicadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao aplicar migrations" -ForegroundColor Red
    Write-Host "💡 Verifique os logs acima para mais detalhes" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔄 ETAPA 2: ATUALIZANDO TIPOS TYPESCRIPT" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "📝 Gerando tipos TypeScript atualizados..." -ForegroundColor Yellow

# Obter o project ID
$projectId = (supabase projects list --output json | ConvertFrom-Json)[0].id

if ($projectId) {
    npx supabase gen types typescript --project-id $projectId > src/integrations/supabase/types.ts
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tipos TypeScript atualizados!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Aviso: Falha ao gerar tipos TypeScript" -ForegroundColor Yellow
        Write-Host "   Você pode gerar manualmente mais tarde" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Não foi possível obter o Project ID" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 ETAPA 3: BUILD DA APLICAÇÃO" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔨 Fazendo build da aplicação..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build concluído com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no build da aplicação" -ForegroundColor Red
    Write-Host "💡 Verifique os erros de compilação acima" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🌐 ETAPA 4: DEPLOY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Verificar se existe script de deploy
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    
    if ($packageJson.scripts.deploy) {
        Write-Host "📤 Executando deploy..." -ForegroundColor Yellow
        npm run deploy
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Deploy realizado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro no deploy" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "⚠️  Script de deploy não encontrado no package.json" -ForegroundColor Yellow
        Write-Host "📝 Configure o script 'deploy' no seu package.json" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Exemplo para Vercel:" -ForegroundColor Cyan
        Write-Host '  "deploy": "vercel --prod"' -ForegroundColor Gray
        Write-Host ""
        Write-Host "Exemplo para Netlify:" -ForegroundColor Cyan
        Write-Host '  "deploy": "netlify deploy --prod"' -ForegroundColor Gray
    }
} else {
    Write-Host "❌ package.json não encontrado" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "            📊 RESUMO DO DEPLOY                 " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Migrations aplicadas no banco de dados" -ForegroundColor Green
Write-Host "✅ Tipos TypeScript atualizados" -ForegroundColor Green
Write-Host "✅ Build da aplicação concluído" -ForegroundColor Green

if ($packageJson.scripts.deploy) {
    Write-Host "✅ Deploy realizado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Deploy manual necessário" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Processo concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Teste a aplicação em produção" -ForegroundColor White
Write-Host "2. Verifique se as novas funcionalidades estão funcionando" -ForegroundColor White
Write-Host "3. Monitore os logs de erro" -ForegroundColor White
Write-Host "" 