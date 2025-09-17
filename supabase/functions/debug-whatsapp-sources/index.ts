import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log('🔍 DEBUG: Investigando problema de pausa da IA');

    // 1. Verificar todos os chats recentes
    const recentChats = await supabase
      .from('whatsapp_chats')
      .select(`
        chat_id,
        contact_phone,
        ai_paused,
        updated_at,
        contact_name,
        companies (
          name
        )
      `)
      .order('updated_at', { ascending: false })
      .limit(10);

    console.log('📱 Chats recentes:', recentChats.data);

    // 2. Verificar chats com número testado (69992254080)
    const testNumberChats = await supabase
      .from('whatsapp_chats')
      .select(`
        chat_id,
        contact_phone,
        ai_paused,
        company_id,
        companies (
          name
        )
      `)
      .or('contact_phone.like.%69992254080%,chat_id.like.%69992254080%');

    console.log('🔍 Chats com número testado:', testNumberChats.data);

    // 3. Verificar todos os chats pausados
    const pausedChats = await supabase
      .from('whatsapp_chats')
      .select(`
        chat_id,
        contact_phone,
        ai_paused,
        updated_at,
        companies (
          name
        )
      `)
      .eq('ai_paused', true)
      .order('updated_at', { ascending: false });

    console.log('⏸️ Chats pausados:', pausedChats.data);

    // 4. Testar as APIs do WhatsApp para ver se há webhooks duplicados
    const testResults = [];
    
    for (const integration of integrations.data || []) {
      try {
        // Verificar configuração de webhook no provedor
        const webhookCheck = await fetch(`https://${integration.host}/rest/instance/${integration.instance_key}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });

        const webhookData = await webhookCheck.json();
        console.log(`🔗 Webhook config para ${integration.instance_key}:`, webhookData);
        
        testResults.push({
          instance_key: integration.instance_key,
          webhook_config: webhookData,
          company_id: integration.company_id
        });

      } catch (error) {
        console.error(`❌ Erro ao verificar ${integration.instance_key}:`, error);
        testResults.push({
          instance_key: integration.instance_key,
          error: error.message,
          company_id: integration.company_id
        });
      }
    }

    return new Response(JSON.stringify({
      integrations: integrations.data,
      recent_logs: logs.data,
      chat_status: chats.data,
      webhook_tests: testResults,
      debug_timestamp: new Date().toISOString(),
      conclusion: 'Verificação completa de todas as fontes possíveis de resposta WhatsApp'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});