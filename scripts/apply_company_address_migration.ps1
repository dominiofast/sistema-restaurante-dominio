Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Aplicando Migration de Endereços" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Verificar se o Supabase CLI está instalado
if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI não encontrado. Por favor, instale primeiro." -ForegroundColor Red
    Write-Host "📦 Instale com: scoop install supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Aplicando migração de endereços da empresa..." -ForegroundColor Yellow
supabase migration up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migração aplicada com sucesso!" -ForegroundColor Green
    
    Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Gere os tipos TypeScript atualizados:" -ForegroundColor White
    Write-Host "   npx supabase gen types typescript --local > src/integrations/supabase/types.ts" -ForegroundColor Cyan
    
    Write-Host "`n2. Se estiver usando o Supabase remoto:" -ForegroundColor White
    Write-Host "   supabase db push" -ForegroundColor Cyan
    
    Write-Host "`n3. Reinicie o servidor de desenvolvimento" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao aplicar migração" -ForegroundColor Red
    Write-Host "💡 Verifique se o Supabase está rodando localmente com: supabase start" -ForegroundColor Yellow
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "Estrutura da tabela company_addresses:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host @"
- id (UUID)
- company_id (UUID) - Referência à empresa
- cep (VARCHAR 10)
- logradouro (VARCHAR 255) *
- numero (VARCHAR 20) *
- complemento (VARCHAR 255)
- bairro (VARCHAR 100) *
- cidade (VARCHAR 100) *
- estado (VARCHAR 2) *
- referencia (VARCHAR 255)
- latitude (DECIMAL)
- longitude (DECIMAL)
- hide_from_customers (BOOLEAN)
- manual_coordinates (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

* Campos obrigatórios
"@ -ForegroundColor Gray

Write-Host "`n✅ Script concluído!" -ForegroundColor Green 

# Fazendo login no Supabase CLI
supabase login 

# Criar arquivo de verificação
@"
-- Verificar tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('company_addresses', 'cardapio_branding', 'media_files', 'agente_ia_config')
ORDER BY table_name;

-- Verificar se a coluna slug existe
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name = 'slug';

-- Verificar buckets do storage
SELECT * FROM storage.buckets WHERE id = 'media';
"@ | Out-File verificar-status.sql

# Copiar para área de transferência
Get-Content verificar-status.sql | clip

Write-Host "SQL de verificação copiado! Cole no SQL Editor do Supabase." -ForegroundColor Green 

# Copiar apenas migrações de branding e AI
@"
-- Aplicar apenas configurações que podem estar faltando

-- Criar tabela de branding se não existir
CREATE TABLE IF NOT EXISTS cardapio_branding (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    logo_url TEXT,
    banner_url TEXT,
    primary_color TEXT DEFAULT '#357dc2',
    secondary_color TEXT DEFAULT '#FF6B6B',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- Criar tabela de configuração AI se não existir  
CREATE TABLE IF NOT EXISTS agente_ia_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    model TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    temperature DECIMAL(2,1) DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 150,
    system_prompt TEXT,
    greeting_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id)
);

-- Adicionar RLS se necessário
ALTER TABLE cardapio_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE agente_ia_config ENABLE ROW LEVEL SECURITY;
"@ | clip

Write-Host "SQL copiado! Cole no SQL Editor para aplicar apenas o que falta." -ForegroundColor Green 