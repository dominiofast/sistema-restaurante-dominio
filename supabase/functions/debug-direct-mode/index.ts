import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { company_id } = await req.json();
    
    console.log('🔍 [DEBUG] Investigando company_id:', company_id);

    // 1. Verificar se a empresa existe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .maybeSingle();

    console.log('🏢 [DEBUG] Company data:', company);
    console.log('❌ [DEBUG] Company error:', companyError);

    if (!company) {
      throw new Error(`Empresa não encontrada: ${company_id}`);
    }

    // 2. Verificar ai_agent_assistants
    const { data: assistantMap, error: assistantError } = await supabase
      .from('ai_agent_assistants')
      .select('*')
      .eq('company_id', company_id)
      .maybeSingle();

    console.log('🤖 [DEBUG] AssistantMap data:', assistantMap);
    console.log('❌ [DEBUG] AssistantMap error:', assistantError);

    // 3. Verificar ai_global_config
    const { data: globalConfig, error: globalError } = await supabase
      .from('ai_global_config')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();

    console.log('🌍 [DEBUG] Global config:', globalConfig);
    console.log('❌ [DEBUG] Global error:', globalError);

    // 4. Verificar ai_agent_prompts
    const { data: promptData, error: promptError } = await supabase
      .from('ai_agent_prompts')
      .select('*')
      .eq('agent_slug', company.slug)
      .maybeSingle();

    console.log('📝 [DEBUG] Prompt data:', promptData);
    console.log('❌ [DEBUG] Prompt error:', promptError);

    // 5. Testar a lógica da condição
    const shouldUseDirectMode = assistantMap?.use_direct_mode === true;
    console.log('🔥 [DEBUG] Should use direct mode?', shouldUseDirectMode);
    console.log('🔥 [DEBUG] assistantMap?.use_direct_mode:', assistantMap?.use_direct_mode);
    console.log('🔥 [DEBUG] typeof:', typeof assistantMap?.use_direct_mode);
    console.log('🔥 [DEBUG] === true?', assistantMap?.use_direct_mode === true);

    const result = {
      company,
      assistantMap,
      globalConfig,
      promptData,
      shouldUseDirectMode,
      debug: {
        use_direct_mode_value: assistantMap?.use_direct_mode,
        use_direct_mode_type: typeof assistantMap?.use_direct_mode,
        strict_equality_check: assistantMap?.use_direct_mode === true,
        loose_equality_check: assistantMap?.use_direct_mode == true,
        boolean_cast: Boolean(assistantMap?.use_direct_mode)
      }
    };

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ [DEBUG] Erro:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});