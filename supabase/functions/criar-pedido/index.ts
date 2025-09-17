
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface PedidoData {
  nome: string
  telefone: string
  endereco?: string
  tipo: 'delivery' | 'retirada'
  pagamento?: string
  horario?: string
  taxaEntrega?: number
  cashbackUsado?: number
  itens: Array<{
    produto_id: string
    nome_produto: string
    quantidade: number
    preco_unitario: number
    adicionais?: Array<{
      nome: string
      preco: number
      quantidade: number
      adicional_id?: string // Adicionado para identificar a categoria
    }>
  }>
  observacoes?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  try {
    // Verificar autenticação via token
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticação necessário' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verificar se o token pertence a uma empresa com configuração de IA ativa
    const { data: config, error: configError } = await supabase
      .from('agente_ia_config')
      .select('company_id, token_pedidos, habilitar_lancamento_pedidos')
      .eq('token_pedidos', token)
      .eq('habilitar_lancamento_pedidos', true)
      .eq('ativo', true)
      .single()

    if (configError || !config) {
      console.error('Erro ao verificar token:', configError)
      return new Response(
        JSON.stringify({ error: 'Token inválido ou configuração não encontrada' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse dos dados do pedido
    const pedidoData: PedidoData = await req.json()
    
    // Validações básicas
    if (!pedidoData.nome || !pedidoData.telefone || !pedidoData.itens || pedidoData.itens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos (nome, telefone, itens)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calcular total do pedido
    const subtotalPedido = pedidoData.itens.reduce((acc, item) => {
      const subtotalItem = item.preco_unitario * item.quantidade
      const subtotalAdicionais = item.adicionais?.reduce((accAd, ad) => 
        accAd + (ad.preco * ad.quantidade), 0) || 0
      return acc + subtotalItem + subtotalAdicionais
    }, 0)

    // Adicionar taxa de entrega se houver
    const totalSemDesconto = subtotalPedido + (pedidoData.taxaEntrega || 0)
    
    // Aplicar desconto de cashback se fornecido
    const descontoCashback = pedidoData.cashbackUsado || 0
    const totalFinal = Math.max(0, totalSemDesconto - descontoCashback)

    // Criar pedido no banco
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        company_id: config.company_id,
        nome: pedidoData.nome,
        telefone: pedidoData.telefone,
        endereco: pedidoData.endereco || null,
        tipo: pedidoData.tipo || 'delivery',
        pagamento: pedidoData.pagamento || null,
        horario: pedidoData.horario || null,
        total: totalFinal,
        cashback_usado: descontoCashback,
        total_sem_desconto: totalSemDesconto,
        status: 'analise',
        observacoes: pedidoData.observacoes || null
      })
      .select()
      .single()

    if (pedidoError) {
      console.error('Erro ao criar pedido:', pedidoError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pedido no banco de dados' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Pedido criado com sucesso:', {
      pedido_id: novoPedido.id,
      company_id: config.company_id,
      total: totalFinal,
      itens_count: pedidoData.itens.length
    })

    // Processar cashback se configurado - VERSÃO SEGURA
    try {
      const { data: cashbackConfig } = await supabase
        .from('cashback_config')
        .select('*')
        .eq('company_id', config.company_id)
        .eq('is_active', true)
        .single()

      // Só gera cashback se o cliente efetivamente pagou algum valor
      if (cashbackConfig && totalFinal > 0 && totalFinal >= (cashbackConfig.valor_minimo_compra || 0)) {
        const valorCashback = (totalFinal * cashbackConfig.percentual_cashback) / 100
        
        // Usar função segura para creditar cashback
        const { data: creditResult, error: creditError } = await supabase
          .rpc('safe_credit_cashback', {
            p_company_id: config.company_id,
            p_customer_phone: pedidoData.telefone,
            p_customer_name: pedidoData.nome,
            p_amount: valorCashback,
            p_description: `Cashback do pedido #${novoPedido.numero_pedido}`,
            p_pedido_id: novoPedido.numero_pedido,
            p_idempotency_key: `cashback_${config.company_id}_${novoPedido.numero_pedido}`
          });

        if (creditError) {
          console.error('❌ Erro ao creditar cashback com função segura:', creditError);
        } else if (creditResult && creditResult.success) {
          console.log('💰 Cashback creditado com segurança:', {
            cliente: pedidoData.telefone,
            valor: valorCashback,
            percentual: cashbackConfig.percentual_cashback,
            valor_pago: totalFinal,
            total_sem_desconto: totalSemDesconto,
            desconto_aplicado: descontoCashback,
            transaction_id: creditResult.transaction_id,
            message: creditResult.message || 'Crédito processado'
          });
        } else {
          console.error('❌ Falha ao creditar cashback:', creditResult);
        }
      }
    } catch (cashbackError) {
      console.error('⚠️ Erro ao processar cashback:', cashbackError)
      // Não falha o pedido por causa do cashback
    }

    // Salvar itens do pedido
    for (const item of pedidoData.itens) {
      const { data: itemSalvo, error: itemError } = await supabase
        .from('pedido_itens')
        .insert({
          pedido_id: novoPedido.id,
          produto_id: item.produto_id,
          nome_produto: item.nome_produto,
          quantidade: item.quantidade,
          valor_unitario: item.preco_unitario,
          valor_total: item.preco_unitario * item.quantidade
        })
        .select()
        .single()

      if (itemError) {
        console.error('Erro ao salvar item:', itemError)
        continue
      }

      console.log('Item salvo:', itemSalvo)

      // Salvar adicionais do item se existirem
      if (item.adicionais && item.adicionais.length > 0) {
        for (const adicional of item.adicionais) {
          // Buscar o nome real da categoria do adicional
          let categoriaNome = 'Adicional'; // Fallback
          if (adicional.adicional_id) {
            try {
              const { data: adicionalCompleto } = await supabase
                .from('adicionais')
                .select(`
                  categorias_adicionais!inner(name)
                `)
                .eq('id', adicional.adicional_id)
                .single();
              
              if (adicionalCompleto?.categorias_adicionais?.name) {
                categoriaNome = adicionalCompleto.categorias_adicionais.name;
              }
            } catch (error) {
              console.warn('⚠️ Não foi possível buscar categoria do adicional:', adicional.adicional_id);
            }
          }
          
          const { error: adicionalError } = await supabase
            .from('pedido_item_adicionais')
            .insert({
              pedido_item_id: itemSalvo.id,
              categoria_nome: categoriaNome, // Usar nome real da categoria
              nome_adicional: adicional.nome,
              quantidade: adicional.quantidade,
              valor_unitario: adicional.preco,
              valor_total: adicional.preco * adicional.quantidade
            })

          if (adicionalError) {
            console.error('Erro ao salvar adicional:', adicionalError)
          } else {
            console.log('✅ Adicional salvo:', {
              nome: adicional.nome,
              categoria: categoriaNome, // Log da categoria real
              quantidade: adicional.quantidade,
              valor: adicional.preco * adicional.quantidade
            })
          }
        }
      }
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        pedido_id: novoPedido.id,
        numero_pedido: novoPedido.numero_pedido,
        total: totalFinal,
        status: 'analise',
        message: 'Pedido criado com sucesso'
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Erro no endpoint criar-pedido:', error)
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
