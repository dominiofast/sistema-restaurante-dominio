import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Iniciando execução automática dos scripts de IA...')

    // Script 1: Aplicar Template com Horários
    console.log('📝 Executando: Aplicar Template com Horários')
    const script1 = `
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
- Exemplos de respostas:
  * "Nossos horários são: {{working_hours}}"
  * "Estamos abertos nos seguintes horários: {{working_hours}}"
  * "Para confirmar os horários exatos, posso verificar com a equipe"

## Banco de Emojis
🍕 🍔 🥗 🍟 🥤 ⏰ 🕐 📅 🚚 💳 📱 🎉 🎊 🏆 ⭐ 💯 🔥

## Fluxo de Decisão
1. Perguntas sobre horários → Use {{working_hours}}
2. Cardápio → Consulte produtos.json
3. Pedidos → Oriente para fazer pedido
4. Entrega → Informe opções disponíveis
5. Pagamento → Liste formas aceitas

## Exemplos de Respostas para Horários
Cliente: "Que horas vocês abrem?"
IA: "Nossos horários são: {{working_hours}} 🕐"

Cliente: "Estão abertos agora?"
IA: "Para verificar se estamos abertos agora, preciso saber que dia e horário é. Nossos horários são: {{working_hours}} ⏰"

Cliente: "Até que horas vocês ficam abertos?"
IA: "Nossos horários de funcionamento são: {{working_hours}} 📅"

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
    `

    const { error: error1 } = await supabaseClient.rpc('exec_sql', { sql_query: script1 })
    if (error1) {
      console.error('❌ Erro no script 1:', error1)
    } else {
      console.log('✅ Script 1 executado com sucesso')
    }

    // Script 2: Integrar Horários Reais
    console.log('🔄 Executando: Integrar Horários Reais')
    const script2 = `
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
    `

    const { error: error2 } = await supabaseClient.rpc('exec_sql', { sql_query: script2 })
    if (error2) {
      console.error('❌ Erro no script 2:', error2)
    } else {
      console.log('✅ Script 2 executado com sucesso')
    }

    // Script 3: Criar Tabela de Histórico
    console.log('📊 Executando: Criar Tabela de Histórico')
    const script3 = `
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
    `

    const { error: error3 } = await supabaseClient.rpc('exec_sql', { sql_query: script3 })
    if (error3) {
      console.error('❌ Erro no script 3:', error3)
    } else {
      console.log('✅ Script 3 executado com sucesso')
    }

    console.log('🎉 Todos os scripts foram executados!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scripts de IA executados com sucesso!',
        details: {
          template_applied: !error1,
          hours_integrated: !error2,
          history_table_created: !error3
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Erro geral:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
