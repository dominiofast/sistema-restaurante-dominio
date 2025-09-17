# Script simples para executar scripts de IA
Write-Host "🚀 EXECUTANDO SCRIPTS DE IA AUTOMATICAMENTE" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# 1. Aplicar Template com Horários
Write-Host "📝 PASSO 1: Aplicando Template com Horários..." -ForegroundColor Yellow
$script1 = @"
-- Aplicar template com conhecimento de horários
UPDATE ai_agent_prompts 
SET 
    template = 'Você é um assistente virtual especializado em atendimento ao cliente para {{nome_empresa}}. 

## CONHECIMENTO DE HORÁRIOS DE FUNCIONAMENTO
Você tem acesso aos horários específicos de funcionamento da loja: {{working_hours}}

Quando perguntarem sobre horários, horário de funcionamento, se estamos abertos, etc:
- SEMPRE use os horários específicos da loja: {{working_hours}}
- NUNCA invente horários
- Se não souber, diga que precisa verificar com a equipe

## Banco de Emojis
🍕 🍔 🥗 🍟 🥤 ⏰ 🕐 📅 🚚 💳 📱 🎉 🎊 🏆 ⭐ 💯 🔥

## Fluxo de Decisão
1. Perguntas sobre horários → Use {{working_hours}}
2. Cardápio → Consulte produtos.json
3. Pedidos → Oriente para fazer pedido
4. Entrega → Informe opções disponíveis
5. Pagamento → Liste formas aceitas

## Lembretes Finais
- SEMPRE use os horários reais da loja
- Seja amigável e prestativo
- Use emojis para tornar a conversa mais leve
- Oriente para fazer pedidos quando apropriado
- Mantenha o tom da marca {{nome_empresa}}',
    vars = jsonb_set(
        COALESCE(vars, '{}'::jsonb),
        '{working_hours}',
        '"Horários específicos da loja - verificar dados disponíveis"'
    ),
    version = COALESCE(version, 0) + 1,
    updated_at = NOW()
WHERE agent_slug IS NOT NULL;
"@

# Salvar script temporário
$script1 | Out-File -FilePath "temp_script1.sql" -Encoding UTF8
Write-Host "✅ Script 1 criado" -ForegroundColor Green

# 2. Integrar Horários Reais
Write-Host "🔄 PASSO 2: Integrando Horários Reais..." -ForegroundColor Yellow
$script2 = @"
-- Integrar horários reais das lojas
WITH horarios_lojas AS (
    SELECT 
        c.id as company_id,
        c.name as company_name,
        c.slug as company_slug,
        COALESCE(
            (SELECT string_agg(
                CASE 
                    WHEN dia_semana = 0 THEN 'Domingo'
                    WHEN dia_semana = 1 THEN 'Segunda'
                    WHEN dia_semana = 2 THEN 'Terça'
                    WHEN dia_semana = 3 THEN 'Quarta'
                    WHEN dia_semana = 4 THEN 'Quinta'
                    WHEN dia_semana = 5 THEN 'Sexta'
                    WHEN dia_semana = 6 THEN 'Sábado'
                END || ': ' || hora_inicio || ' às ' || hora_fim, 
                ' | '
            ) FROM horario_funcionamento hf 
            WHERE hf.company_id = c.id),
            
            (SELECT string_agg(
                dia_semana || ': ' || hora_inicio || ' às ' || hora_fim, 
                ' | '
            ) FROM horarios_dias hd 
            WHERE hd.company_id = c.id),
            
            'Segunda a Sexta: 17:45 às 23:30 | Sábado: 17:45 às 23:30 | Domingo: 17:45 às 23:59'
        ) as horarios_reais
    FROM companies c
    WHERE c.slug IS NOT NULL
)
UPDATE ai_agent_prompts 
SET 
    vars = jsonb_set(
        COALESCE(vars, '{}'::jsonb),
        '{working_hours}',
        to_jsonb(hl.horarios_reais)
    ),
    version = COALESCE(version, 0) + 1,
    updated_at = NOW()
FROM horarios_lojas hl
WHERE ai_agent_prompts.agent_slug = hl.company_slug;
"@

# Salvar script temporário
$script2 | Out-File -FilePath "temp_script2.sql" -Encoding UTF8
Write-Host "✅ Script 2 criado" -ForegroundColor Green

# 3. Criar Tabela de Histórico
Write-Host "📊 PASSO 3: Criando Tabela de Histórico..." -ForegroundColor Yellow
$script3 = @"
-- Criar tabela de histórico se não existir
CREATE TABLE IF NOT EXISTS ai_agent_prompts_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_slug TEXT NOT NULL,
    template TEXT NOT NULL,
    vars JSONB DEFAULT '{}',
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_agent_slug ON ai_agent_prompts_history(agent_slug);
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_version ON ai_agent_prompts_history(version);
CREATE INDEX IF NOT EXISTS idx_ai_agent_prompts_history_created_at ON ai_agent_prompts_history(created_at);
"@

# Salvar script temporário
$script3 | Out-File -FilePath "temp_script3.sql" -Encoding UTF8
Write-Host "✅ Script 3 criado" -ForegroundColor Green

Write-Host ""
Write-Host "📋 SCRIPTS CRIADOS COM SUCESSO!" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""
Write-Host "Os seguintes arquivos foram criados:" -ForegroundColor White
Write-Host "• temp_script1.sql - Template com horários" -ForegroundColor Cyan
Write-Host "• temp_script2.sql - Integração de horários reais" -ForegroundColor Cyan
Write-Host "• temp_script3.sql - Tabela de histórico" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "1. Abra o Supabase Dashboard" -ForegroundColor White
Write-Host "2. Vá para SQL Editor" -ForegroundColor White
Write-Host "3. Copie e cole cada script na ordem:" -ForegroundColor White
Write-Host "   - Primeiro: temp_script1.sql" -ForegroundColor White
Write-Host "   - Segundo: temp_script2.sql" -ForegroundColor White
Write-Host "   - Terceiro: temp_script3.sql" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Após executar todos, o sistema poderá responder sobre horários!" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir os arquivos..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir os arquivos no notepad
Start-Process notepad "temp_script1.sql"
Start-Process notepad "temp_script2.sql"
Start-Process notepad "temp_script3.sql"

Write-Host ""
Write-Host "✅ Arquivos abertos no Notepad!" -ForegroundColor Green
Write-Host "Copie e cole cada um no SQL Editor do Supabase." -ForegroundColor White
Write-Host ""
Write-Host "Pressione qualquer tecla para sair..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
