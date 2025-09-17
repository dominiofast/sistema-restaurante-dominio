import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔍 Verificando conexão específica da Domínio Pizzas...')

    // Dados da integração da Domínio
    const integration = {
      host: 'apinocode01.megaapi.com.br',
      instance_key: 'megacode-MDT3OHEGIyu',
      token: 'MDT3OHEGIyu'
    }

    console.log(`📋 Verificando instância: ${integration.instance_key}`)

    // 1. Verificar status atual
    const statusResponse = await fetch(`https://${integration.host}/api/v1/instance/status/${integration.instance_key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      }
    })

    const statusData = await statusResponse.json()
    console.log(`📊 Status atual da Domínio:`, statusData)

    // 2. Verificar detalhes da conexão
    const connectionResponse = await fetch(`https://${integration.host}/api/v1/instance/connection-state/${integration.instance_key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${integration.token}`,
        'Content-Type': 'application/json'
      }
    })

    let connectionData = null
    try {
      connectionData = await connectionResponse.json()
      console.log(`🔗 Estado da conexão:`, connectionData)
    } catch (e) {
      console.log('⚠️ Não foi possível obter estado da conexão:', e.message)
    }

    // 3. Tentar enviar uma mensagem de teste para verificar se está realmente conectado
    const testMessage = {
      number: '+5511999999999', // número de teste
      message: 'Teste de conexão - ' + new Date().toISOString()
    }

    let testResult = null
    try {
      const testResponse = await fetch(`https://${integration.host}/api/v1/message/send-text/${integration.instance_key}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${integration.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testMessage)
      })

      testResult = await testResponse.json()
      console.log(`📱 Teste de mensagem:`, testResult)
    } catch (testError) {
      console.log('⚠️ Erro no teste de mensagem:', testError.message)
      testResult = { error: testError.message }
    }

    // 4. Se detectar problema, sugerir reconexão
    const needsReconnect = statusData.state !== 'open' || (testResult && testResult.error)

    const result = {
      timestamp: new Date().toISOString(),
      instance_key: integration.instance_key,
      host: integration.host,
      status: statusData,
      connection_state: connectionData,
      test_message: testResult,
      is_connected: statusData.state === 'open',
      needs_reconnect: needsReconnect,
      recommendations: []
    }

    if (needsReconnect) {
      result.recommendations.push('Instância precisa ser reconectada')
      result.recommendations.push('Use a função whatsapp-force-reconnect para forçar reconexão')
    }

    if (statusData.state === 'open' && testResult && !testResult.error) {
      result.recommendations.push('Conexão parece estar funcionando normalmente')
    }

    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('❌ Erro na verificação da Domínio:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})