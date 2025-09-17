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

    console.log('🔍 INVESTIGAÇÃO PROFUNDA: Verificando provedor WhatsApp');

    // Buscar todas as instâncias relevantes
    const { data: integrations } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .in('instance_key', ['megacode-MSjGIvEZJFk', 'megacode-MDT3OHEGIyu']);

    const results = [];

    for (const integration of integrations || []) {
      console.log(`🔍 Verificando ${integration.instance_key}...`);
      
      try {
        // 1. Verificar configuração geral da instância
        const instanceConfig = await fetch(`https://${integration.host}/rest/instance/${integration.instance_key}`, {
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const configData = await instanceConfig.json();
        
        // 2. Verificar configurações de webhook específicas
        const webhookConfig = await fetch(`https://${integration.host}/rest/webhook/${integration.instance_key}`, {
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const webhookData = await webhookConfig.json();
        
        // 3. Verificar se há autoresponder ativo
        const autoresponderConfig = await fetch(`https://${integration.host}/rest/autoresponder/${integration.instance_key}`, {
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const autoresponderData = await autoresponderConfig.json();
        
        // 4. Verificar configurações de chatbot/AI
        const chatbotConfig = await fetch(`https://${integration.host}/rest/chatbot/${integration.instance_key}`, {
          headers: {
            'Authorization': `Bearer ${integration.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const chatbotData = await chatbotConfig.json();

        results.push({
          instance_key: integration.instance_key,
          company_id: integration.company_id,
          instance_config: configData,
          webhook_config: webhookData,
          autoresponder_config: autoresponderData,
          chatbot_config: chatbotData,
          status: 'success'
        });

        console.log(`✅ ${integration.instance_key} verificado`);

      } catch (error) {
        console.error(`❌ Erro ao verificar ${integration.instance_key}:`, error);
        results.push({
          instance_key: integration.instance_key,
          company_id: integration.company_id,
          error: error.message,
          status: 'error'
        });
      }
    }

    return new Response(JSON.stringify({
      investigation_results: results,
      timestamp: new Date().toISOString(),
      message: 'Investigação completa do provedor WhatsApp'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Erro na investigação:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});