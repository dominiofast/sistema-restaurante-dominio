import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('📥 [WEBHOOK v2.0] Webhook recebido')
    const body = await req.json()
    console.log('📥 [WEBHOOK v2.0] Body:', JSON.stringify(body, null, 2))

    // Extrair dados da mensagem
    const message = body.message?.extendedTextMessage?.text || 
                   body.message?.conversation || 
                   body.message?.imageMessage?.caption ||
                   'Mensagem não suportada'

    const phoneNumber = body.key?.remoteJid?.replace('@s.whatsapp.net', '') || 
                       body.jid?.replace('@s.whatsapp.net', '')

    const senderName = body.pushName || 'Cliente'

    // Extrair instance_key da URL
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    const instanceKey = pathParts[pathParts.length - 1]

    console.log('📋 Dados extraídos:')
    console.log('De:', phoneNumber)
    console.log('Nome:', senderName)
    console.log('Mensagem:', message)
    console.log('Instance Key:', instanceKey)

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar configuração da integração
    const { data: integration, error: integrationError } = await supabase
      .from('whatsapp_integrations')
      .select('*')
      .eq('instance_key', instanceKey)
      .eq('purpose', 'primary')
      .single()

    if (integrationError || !integration) {
      console.error('❌ Integração não encontrada:', integrationError)
      return new Response(JSON.stringify({ status: 'error', message: 'Integração não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Buscar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', integration.company_id)
      .single()

    if (companyError || !company) {
      console.error('❌ Empresa não encontrada:', companyError)
      return new Response(JSON.stringify({ status: 'error', message: 'Empresa não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // ===== USAR COMPONENTES ISOLADOS =====

    // 1. LOG DA MENSAGEM RECEBIDA
    console.log('📝 1. Logando mensagem recebida...')
    try {
      await fetch(`${supabaseUrl}/functions/v1/message-logger`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          companyId: company.id,
          customerPhone: phoneNumber,
          customerName: senderName,
          messageContent: message,
          messageType: 'user_message',
          metadata: { instanceKey, source: 'webhook' }
        })
      })
    } catch (logError) {
      console.error('⚠️ Erro ao logar mensagem (não crítico):', logError)
    }

    // 2. PROCESSAR COM IA
    console.log('🤖 2. Processando com IA...')
    let aiResponse = null
    try {
      const aiResult = await fetch(`${supabaseUrl}/functions/v1/ai-processor`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          phoneNumber: phoneNumber,
          companyId: company.id,
          customerName: senderName,
          context: `Empresa: ${company.name}`
        })
      })

      const aiData = await aiResult.json()
      if (aiData.success) {
        aiResponse = aiData.response
        console.log('✅ IA processou com sucesso:', aiResponse)
      } else {
        console.error('❌ Erro no AI Processor:', aiData.error)
        aiResponse = 'Desculpe, não consegui processar sua mensagem no momento.'
      }
    } catch (aiError) {
      console.error('❌ Erro ao chamar AI Processor:', aiError)
      aiResponse = 'Desculpe, estou com dificuldades técnicas no momento.'
    }

    // 3. ENVIAR RESPOSTA VIA WHATSAPP
    console.log('📤 3. Enviando resposta...')
    let sendSuccess = false
    try {
      const sendResult = await fetch(`${supabaseUrl}/functions/v1/whatsapp-sender`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: aiResponse,
          instanceKey: instanceKey,
          companyId: company.id,
          customerName: senderName
        })
      })

      const sendData = await sendResult.json()
      if (sendData.success) {
        sendSuccess = true
        console.log('✅ Mensagem enviada com sucesso')
      } else {
        console.error('❌ Erro ao enviar mensagem:', sendData.error)
      }
    } catch (sendError) {
      console.error('❌ Erro ao chamar WhatsApp Sender:', sendError)
    }

    // 4. LOG DO RESULTADO FINAL
    console.log('📝 4. Logando resultado final...')
    try {
      await fetch(`${supabaseUrl}/functions/v1/message-logger`, {
          method: 'POST',
          headers: {
          'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
          companyId: company.id,
          customerPhone: phoneNumber,
          customerName: senderName,
          messageContent: `RESULTADO FINAL: ${sendSuccess ? 'SUCESSO' : 'FALHA'} | Resposta IA: ${aiResponse}`,
          messageType: 'webhook_result',
          metadata: { 
            instanceKey, 
            sendSuccess, 
            aiResponse: aiResponse?.substring(0, 100) + '...' 
          }
        })
      })
    } catch (finalLogError) {
      console.error('⚠️ Erro ao logar resultado final (não crítico):', finalLogError)
    }

    // Retornar sucesso
    return new Response(JSON.stringify({ 
      status: 'success', 
      response_sent: sendSuccess,
      message: 'Mensagem processada com componentes isolados'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro no webhook principal:', error)
    
    return new Response(JSON.stringify({ 
      status: 'error', 
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})