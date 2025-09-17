import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    console.log("🔍 Verificando status do trigger WhatsApp...");

    // Verificar se o trigger existe
    const { data: triggerCheck, error: triggerError } = await supabase.rpc('get_trigger_and_rls_status');
    
    if (triggerError) {
      console.error("❌ Erro ao verificar trigger:", triggerError);
      throw triggerError;
    }

    console.log("📊 Status do trigger:", triggerCheck);

    // Verificar últimos logs de notification_logs
    const { data: recentLogs, error: logsError } = await supabase
      .from('notification_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError && !logsError.message.includes('does not exist')) {
      console.error("❌ Erro ao buscar logs:", logsError);
    }

    // Verificar registros em notification_queue
    const { data: queueRecords, error: queueError } = await supabase
      .from('notification_queue')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (queueError && !queueError.message.includes('does not exist')) {
      console.error("❌ Erro ao buscar queue:", queueError);
    }

    // Verificar se extensão http está habilitada
    const { data: httpExtension, error: httpError } = await supabase
      .from('pg_extension')
      .select('extname, extversion')
      .eq('extname', 'http')
      .maybeSingle();

    if (httpError) {
      console.error("❌ Erro ao verificar extensão http:", httpError);
    }

    // Verificar integração WhatsApp ativa
    const { data: activeIntegration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('id, company_id, purpose, host, instance_key, created_at')
      .eq('purpose', 'orders')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (integrationError) {
      console.error("❌ Erro ao verificar integração:", integrationError);
    }

    // Verificar últimos pedidos
    const { data: recentOrders, error: ordersError } = await supabase
      .from('pedidos')
      .select('id, numero_pedido, telefone, company_id, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (ordersError) {
      console.error("❌ Erro ao verificar pedidos:", ordersError);
    }

    const diagnostics = {
      trigger_status: {
        exists: triggerCheck?.trigger || false,
        rls_enabled: triggerCheck?.rls || false
      },
      http_extension: {
        enabled: !!httpExtension,
        version: httpExtension?.extversion || null
      },
      whatsapp_integration: {
        active: !!activeIntegration,
        company_id: activeIntegration?.company_id || null,
        host: activeIntegration?.host || null
      },
      recent_logs: {
        count: recentLogs?.length || 0,
        logs: recentLogs || []
      },
      notification_queue: {
        count: queueRecords?.length || 0,
        records: queueRecords || []
      },
      recent_orders: {
        count: recentOrders?.length || 0,
        orders: recentOrders?.map(order => ({
          id: order.id,
          numero_pedido: order.numero_pedido,
          has_phone: !!order.telefone,
          company_id: order.company_id,
          created_at: order.created_at
        })) || []
      },
      summary: {
        trigger_ok: triggerCheck?.trigger || false,
        http_extension_ok: !!httpExtension,
        integration_ok: !!activeIntegration,
        overall_status: (triggerCheck?.trigger && !!httpExtension && !!activeIntegration) ? 'healthy' : 'issues_detected'
      }
    };

    console.log("✅ Diagnóstico completo:", diagnostics);

    return new Response(JSON.stringify(diagnostics, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ Erro na verificação:", error);
    
    return new Response(JSON.stringify({ 
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});