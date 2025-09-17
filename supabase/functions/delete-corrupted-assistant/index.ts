import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🗑️ DELETANDO ASSISTENTE CORROMPIDO');
    
    const { assistant_id } = await req.json();

    if (!assistant_id) {
      throw new Error('assistant_id é obrigatório');
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('🔥 Deletando assistente corrompido:', assistant_id);

    // Deletar assistente na OpenAI
    const deleteResponse = await fetch(`https://api.openai.com/v1/assistants/${assistant_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    if (!deleteResponse.ok) {
      const errorData = await deleteResponse.json();
      console.error('❌ Erro ao deletar assistente:', errorData);
      throw new Error(`Erro da OpenAI: ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    console.log('✅ Assistente corrompido deletado com sucesso!');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Assistente corrompido deletado com sucesso!',
      deleted_assistant_id: assistant_id
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