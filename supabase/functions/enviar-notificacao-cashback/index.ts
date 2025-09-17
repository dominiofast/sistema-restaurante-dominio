import { serve } from "https://deno.land/std@0.223.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CashbackNotification {
  company_id: string
  customer_phone: string
  customer_name: string
  pedido_id: number
  cashback_value: number
  message_content: string
  notification_type: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar método HTTP
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método não permitido. Use POST.' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação não fornecido' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extrair token
    const token = authHeader.replace('Bearer ', '')
    
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Verificar token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token inválido ou expirado' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar dados da requisição
    const { pedido_id, company_id } = await req.json()
    
    if (!pedido_id || !company_id) {
      return new Response(
        JSON.stringify({ error: 'pedido_id e company_id são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se usuário tem acesso à empresa
    const { data: userCompany, error: companyError } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .eq('company_id', company_id)
      .single()

    if (companyError || !userCompany) {
      return new Response(
        JSON.stringify({ error: 'Usuário não tem acesso a esta empresa' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar informações do pedido e cashback
    const { data: pedidoInfo, error: pedidoError } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        company_id,
        nome,
        telefone,
        total,
        status,
        created_at,
        companies!inner(name, domain, logo)
      `)
      .eq('id', pedido_id)
      .eq('company_id', company_id)
      .single()

    if (pedidoError || !pedidoInfo) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar se pedido foi finalizado
    if (!['entregue', 'finalizado'].includes(pedidoInfo.status)) {
      return new Response(
        JSON.stringify({ 
          error: 'Pedido ainda não foi finalizado',
          current_status: pedidoInfo.status 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar informações de cashback
    const { data: cashbackInfo, error: cashbackError } = await supabase
      .from('cashback_transactions')
      .select(`
        valor,
        created_at,
        customer_cashback!inner(saldo_disponivel)
      `)
      .eq('pedido_id', pedido_id)
      .eq('tipo', 'credito')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (cashbackError || !cashbackInfo) {
      return new Response(
        JSON.stringify({ error: 'Cashback não encontrado para este pedido' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Buscar configuração da empresa
    const { data: companyConfig, error: configError } = await supabase
      .from('whatsapp_integrations')
      .select('whatsapp_phone, ia_model, ia_temperature')
      .eq('company_id', company_id)
      .eq('is_active', true)
      .single()

    if (configError || !companyConfig) {
      return new Response(
        JSON.stringify({ error: 'Integração WhatsApp não configurada' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Preparar mensagem de cashback
    const messageContent = `✅ *Pedido #${pedidoInfo.numero_pedido} Finalizado*

Cliente: ${pedidoInfo.nome}
Total: R$ ${pedidoInfo.total.toFixed(2)}
Data: ${new Date(pedidoInfo.created_at).toLocaleDateString('pt-BR')} ${new Date(pedidoInfo.created_at).toLocaleTimeString('pt-BR')}

🎁 *Cashback Creditado: R$ ${cashbackInfo.valor.toFixed(2)}*
💳 Saldo Total: R$ ${cashbackInfo.customer_cashback.saldo_disponivel.toFixed(2)}

Acesse: https://${pedidoInfo.companies.domain}.dominio.tech

${pedidoInfo.companies.logo}`

    // Enviar notificação via WhatsApp (simulado)
    // Aqui você pode integrar com sua API de WhatsApp real
    console.log('📱 Enviando notificação de cashback:', {
      customer_phone: pedidoInfo.telefone,
      message: messageContent
    })

    // Registrar notificação enviada
    const { data: notification, error: notificationError } = await supabase
      .from('cashback_notifications')
      .insert({
        company_id: company_id,
        customer_phone: pedidoInfo.telefone,
        customer_name: pedidoInfo.nome,
        pedido_id: pedido_id,
        cashback_value: cashbackInfo.valor,
        message_content: messageContent,
        notification_type: 'whatsapp',
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single()

    if (notificationError) {
      console.error('❌ Erro ao registrar notificação:', notificationError)
      return new Response(
        JSON.stringify({ error: 'Erro ao registrar notificação' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Registrar log da operação
    await supabase
      .from('ai_conversation_logs')
      .insert({
        company_id: company_id,
        customer_phone: pedidoInfo.telefone,
        customer_name: pedidoInfo.nome,
        message_content: messageContent,
        message_type: 'cashback_notification',
        created_at: new Date().toISOString()
      })

    // Retornar sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notificação de cashback enviada com sucesso',
        notification_id: notification.id,
        customer_phone: pedidoInfo.telefone,
        cashback_value: cashbackInfo.valor,
        message_content: messageContent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro no endpoint enviar-notificacao-cashback:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
