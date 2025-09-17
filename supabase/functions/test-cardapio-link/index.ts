import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { slug_empresa } = body || { slug_empresa: 'quadratapizzas' }

    console.log('🧪 Testando link do cardápio para:', slug_empresa)

    // Testar diferentes cenários
    const testCases = [
      { message: 'oi', description: 'Primeira mensagem - saudação' },
      { message: 'quero ver o cardápio', description: 'Pedido direto do cardápio' },
      { message: 'tem promoção hoje?', description: 'Pergunta sobre promoções' },
      { message: 'qual o preço da pizza?', description: 'Pergunta sobre preços' }
    ]

    const results = []

    for (const testCase of testCases) {
      console.log(`\n🔍 Testando: "${testCase.message}"`)
      
      try {
        // Chamar a função de IA
        const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/agente-ia-conversa-v2`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slug_empresa: slug_empresa,
            user_message: testCase.message,
            historico: testCase.message === 'oi' ? [] : [
              { role: 'user', content: 'oi' },
              { role: 'assistant', content: 'Olá! Como posso ajudar?' }
            ]
          })
        })

        const data = await response.json()
        const resposta = data.resposta || 'Sem resposta'
        
        const hasLink = resposta.includes('pedido.dominio.tech')
        const linkCount = (resposta.match(/pedido\.dominio\.tech/g) || []).length
        
        results.push({
          test: testCase.description,
          message: testCase.message,
          hasLink: hasLink,
          linkCount: linkCount,
          response: resposta.substring(0, 200) + (resposta.length > 200 ? '...' : ''),
          status: hasLink ? '✅ PASSOU' : '❌ FALHOU'
        })

        console.log(`${hasLink ? '✅' : '❌'} ${testCase.description}: ${hasLink ? 'Link presente' : 'Link ausente'}`)
        
      } catch (error) {
        results.push({
          test: testCase.description,
          message: testCase.message,
          hasLink: false,
          linkCount: 0,
          response: `Erro: ${error.message}`,
          status: '❌ ERRO'
        })
      }
    }

    const passedTests = results.filter(r => r.hasLink).length
    const totalTests = results.length

    return new Response(JSON.stringify({
      success: true,
      summary: `${passedTests}/${totalTests} testes passaram`,
      slug_empresa: slug_empresa,
      expected_link: `https://pedido.dominio.tech/${slug_empresa}`,
      results: results,
      recommendations: passedTests < totalTests ? [
        "🔧 Execute 'Corrigir Agora' na interface",
        "🔄 Verifique se o Assistant foi sincronizado",
        "📝 Confirme se o prompt inclui instruções sobre links"
      ] : [
        "✅ Todos os testes passaram!",
        "🎉 Links funcionando corretamente"
      ]
    }, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})