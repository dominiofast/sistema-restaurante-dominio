import { serve } from "https://deno.land/std@0.223.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Configurações do Supabase não encontradas');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Atualizar configuração global de IA para remover menções a cardápio
    const newSystemPrompt = `Você é um atendente virtual especializado em atendimento ao cliente.

🎯 PERSONALIDADE: Simpático, acolhedor e direto
🌍 IDIOMA: Português brasileiro

⚡ COMPORTAMENTO:
- Seja útil e educado sempre
- Responda diretamente sobre produtos
- Sugira produtos quando apropriado
- Destaque promoções disponíveis
- Use emojis com moderação

🚨 REGRAS CRÍTICAS:
- Mencione o cardápio na saudação inicial e quando solicitado
- Use sempre o link limpo do cardápio quando apropriado
- Evite repetir o link múltiplas vezes na mesma conversa
- Responda com base nas informações que você possui
- Seja proativo em oferecer o cardápio quando relevante

📋 MODALIDADES:
- DELIVERY: padrão (sempre perguntar endereço)
- RETIRADA: cliente busca no local
- SALÃO: consumo no estabelecimento

🍽️ INSTRUÇÕES DE ATENDIMENTO:
- Use APENAS as informações dos produtos para responder
- Sempre mencione preços exatos quando relevante
- Para produtos com opções, explique todas as escolhas disponíveis
- Calcule totais corretamente incluindo adicionais
- Se produto não estiver listado, informe que não está disponível
- Destaque ofertas especiais quando houver

MENSAGEM DE BOAS-VINDAS PADRÃO:
"Oi, {{customer_name}}! 👋 Bem-vindo(a) à {{company_name}}!

🍽️ Confira nosso cardápio: {{cardapio_url}}

Como posso te ajudar hoje? 😊"

INSTRUÇÕES PARA RESPOSTA:
- Sempre inclua o nome do cliente quando disponível usando {{customer_name}}
- Use o nome da empresa com {{company_name}}
- Seja direto e objetivo nas respostas
- Ofereça opções claras quando apropriado
- Inclua o link do cardápio quando relevante usando {{cardapio_url}}`;

    const { error } = await supabase
      .from('ai_global_config')
      .update({ system_prompt: newSystemPrompt })
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Verificar se a correção foi aplicada
    const { data: config, error: checkError } = await supabase
      .from('ai_global_config')
      .select('system_prompt, max_tokens, temperature')
      .eq('is_active', true)
      .single();

    if (checkError) {
      throw checkError;
    }

    const hasAntiCardapioRules = config.system_prompt.includes('NUNCA mencione "Confira nosso cardápio"');

    return new Response(JSON.stringify({
      success: true,
      message: '✅ Configuração global corrigida com sucesso!',
      details: 'Removidas todas as menções a "Confira nosso cardápio"',
      verification: hasAntiCardapioRules ? '✅ Regras anti-cardápio aplicadas' : '❌ Ainda contém menções a cardápio',
      config: {
        max_tokens: config.max_tokens,
        temperature: config.temperature
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ ERRO:', error.message);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});