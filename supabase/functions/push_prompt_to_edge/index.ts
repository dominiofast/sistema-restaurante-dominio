import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Push prompt to edge function triggered');
    
    const { agent_slug } = await req.json();
    
    if (!agent_slug) {
      throw new Error('agent_slug is required');
    }

    console.log(`📝 Processing prompt update for agent: ${agent_slug}`);

    // Inicializar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Buscar prompt atualizado
    const { data, error } = await supabase
      .from('ai_agent_prompts')
      .select('template,vars')
      .eq('agent_slug', agent_slug)
      .single();

    if (error) {
      console.error('❌ Error fetching prompt:', error);
      return new Response(error.message, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    console.log('✅ Prompt data retrieved for:', agent_slug);

    // Como o agente-ia-conversa já busca diretamente do Supabase,
    // não precisamos mais do Edge Config. O prompt já está salvo no Supabase.
    console.log('📤 Prompt successfully stored in Supabase and ready for use');

    return new Response('ok', {
      headers: corsHeaders,
      status: 200
    });

  } catch (error) {
    console.error('❌ Error in push_prompt_to_edge:', error);
    
    return new Response(error.message, {
      headers: corsHeaders,
      status: 500
    });
  }
});