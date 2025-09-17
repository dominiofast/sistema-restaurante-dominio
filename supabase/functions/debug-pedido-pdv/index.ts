import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🔍 Debug Pedido PDV - Iniciando verificação...')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Verificar últimos pedidos
    console.log('📋 Verificando últimos pedidos...')
    const { data: ultimosPedidos, error: pedidosError } = await supabase
      .from('pedidos')
      .select('numero_pedido, nome, created_at, total')
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .order('created_at', { ascending: false })
      .limit(5)

    if (pedidosError) {
      console.error('❌ Erro ao buscar pedidos:', pedidosError)
      throw pedidosError
    }

    console.log('✅ Últimos pedidos encontrados:', ultimosPedidos)

    // 2. Verificar se existe pedido #475
    const { data: pedido475, error: error475 } = await supabase
      .from('pedidos')
      .select('*')
      .eq('numero_pedido', 475)
      .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
      .maybeSingle()

    console.log('🔍 Pedido #475 existe?', !!pedido475)
    if (pedido475) {
      console.log('📄 Dados do pedido #475:', pedido475)
    }

    // 3. Verificar função RPC criar_pedido_pdv_completo
    console.log('⚙️ Testando função criar_pedido_pdv_completo...')
    const testData = {
      p_company_id: '550e8400-e29b-41d4-a716-446655440001',
      p_nome: 'TESTE DEBUG',
      p_telefone: '69999999999',
      p_itens: JSON.stringify([{
        produto_id: 'test-id',
        nome_produto: 'Produto Teste',
        quantidade: 1,
        preco_unitario: 10.00,
        adicionais: [{
          nome: 'Adicional Teste',
          preco: 2.00,
          quantidade: 1,
          categoria: 'Teste'
        }]
      }]),
      p_tipo: 'balcao',
      p_total: 12.00,
      p_observacoes: 'TESTE DEBUG - PODE DELETAR'
    }

    const { data: rpcResult, error: rpcError } = await supabase.rpc('criar_pedido_pdv_completo', testData)
    
    console.log('📊 Resultado do teste RPC:', rpcResult)
    if (rpcError) {
      console.error('❌ Erro no teste RPC:', rpcError)
    }

    // 4. Verificar adicionais do último pedido real
    const ultimoPedidoReal = ultimosPedidos?.[0]
    if (ultimoPedidoReal) {
      const { data: itensComAdicionais, error: adicionaisError } = await supabase
        .from('pedido_itens')
        .select(`
          id,
          nome_produto,
          quantidade,
          valor_total,
          pedido_item_adicionais (
            categoria_nome,
            nome_adicional,
            quantidade,
            valor_unitario
          )
        `)
        .eq('pedido_id', (await supabase
          .from('pedidos')
          .select('id')
          .eq('numero_pedido', ultimoPedidoReal.numero_pedido)
          .eq('company_id', '550e8400-e29b-41d4-a716-446655440001')
          .single()
        ).data?.id)

      console.log('🍕 Itens com adicionais do último pedido:', itensComAdicionais)
    }

    const resultado = {
      ultimosPedidos,
      pedido475Existe: !!pedido475,
      pedido475Dados: pedido475,
      testeRPC: {
        sucesso: !rpcError,
        resultado: rpcResult,
        erro: rpcError
      },
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(resultado, null, 2),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 Erro no debug:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Erro no debug',
        details: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})