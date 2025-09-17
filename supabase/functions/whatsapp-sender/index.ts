import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SendMessageRequest {
  phoneNumber: string
  message: string
  instanceKey: string
  companyId: string
  customerName?: string
}

interface SendMessageResponse {
  success: boolean
  messageId?: string
  error?: string
  statusCode?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { phoneNumber, message, instanceKey, companyId, customerName }: SendMessageRequest = await req.json()

    // Validações básicas
    if (!phoneNumber || !message || !instanceKey || !companyId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Dados obrigatórios não fornecidos'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar configuração da integração
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('instance_key', instanceKey)
      .eq('company_id', companyId)
      .single()

    if (integrationError || !integration) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Configuração de integração não encontrada'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Preparar payload para MegaAPI
    const payload = {
      messageData: {
        to: phoneNumber + '@s.whatsapp.net',
        text: message
      }
    }

    // Enviar mensagem via MegaAPI
    const sendResponse = await fetch(`https://${integration.host}/rest/sendMessage/${integration.instance_key}/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const sendResult = await sendResponse.json()

    // Log do envio
    await supabase.from('ai_conversation_logs').insert({
      company_id: companyId,
      customer_phone: phoneNumber,
      customer_name: customerName || 'Unknown',
      message_content: `ENVIO ISOLADO: ${message} | Status: ${sendResponse.status} | Result: ${JSON.stringify(sendResult)}`,
      message_type: 'whatsapp_sent_isolated'
    })

    if (sendResponse.ok && sendResult.statusCode === 200) {
      return new Response(JSON.stringify({
        success: true,
        messageId: sendResult.key?.id,
        statusCode: sendResponse.status
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: sendResult.message || 'Erro ao enviar mensagem',
        statusCode: sendResponse.status
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

  } catch (error) {
    console.error('❌ Erro no WhatsApp Sender:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
