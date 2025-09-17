import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  category?: string
  adicionais?: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

interface Cliente {
  nome: string
  telefone: string
  email?: string
}

interface Endereco {
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  cep: string
  estado: string
  latitude?: number
  longitude?: number
}

interface PedidoPublicoData {
  companyId: string
  cliente: Cliente
  endereco?: Endereco
  carrinho: CartItem[]
  tipo: 'delivery' | 'retirada' | 'balcao'
  pagamento: string
  observacoes?: string
  subtotal: number
  taxaEntrega: number
  total: number
  cashbackAplicado?: number
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
    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse dos dados do pedido
    const pedidoData: PedidoPublicoData = await req.json()
    console.log('📦 Dados do pedido recebidos:', JSON.stringify(pedidoData, null, 2))
    
    // Validações básicas
    if (!pedidoData.companyId || !pedidoData.cliente?.nome || !pedidoData.cliente?.telefone || !pedidoData.carrinho || pedidoData.carrinho.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Dados obrigatórios não fornecidos (companyId, cliente.nome, cliente.telefone, carrinho)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // VERIFICAÇÃO ANTI-DUPLICAÇÃO: Se for pagamento PIX, verificar se já existe pedido para este pagamento
    let pixPaymentId = null;
    try {
      const parsedPayment = JSON.parse(pedidoData.pagamento);
      if (parsedPayment.method === 'pix' && parsedPayment.id) {
        pixPaymentId = parsedPayment.id;
      }
    } catch {
      // Se não conseguir fazer parse, continuar normalmente
    }

    // Verificação anti-duplicação robusta usando RPC
    console.log('🔍 Verificando duplicação com RPC para:', {
      company_id: pedidoData.companyId,
      payment_id: pixPaymentId,
      customer_phone: pedidoData.cliente.telefone,
      amount: pedidoData.total
    });
    
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .rpc('rpc_check_existing_order', {
        p_company_id: pedidoData.companyId,
        p_payment_id: pixPaymentId,
        p_customer_phone: pedidoData.cliente.telefone,
        p_amount: pedidoData.total
      });

    if (duplicateError) {
      console.error('❌ Erro na verificação anti-duplicação RPC:', duplicateError);
      // Continua com a criação do pedido em caso de erro na verificação
    } else if (duplicateCheck?.has_duplicates) {
      console.log('⚠️ DUPLICAÇÃO DETECTADA E PREVENIDA via RPC:', duplicateCheck);
      const existingOrder = duplicateCheck.existing_order;
      
      // Log adicional da prevenção
      await supabase
        .from('ai_conversation_logs')
        .insert({
          company_id: pedidoData.companyId,
          customer_phone: pedidoData.cliente.telefone,
          customer_name: pedidoData.cliente.nome,
          message_content: `DUPLICAÇÃO PREVENIDA: Tentativa de criar pedido duplicado. Pedido existente: ${existingOrder.id}. Payment ID: ${pixPaymentId || 'N/A'}`,
          message_type: 'duplicate_prevention_success',
          created_at: new Date().toISOString()
        });
      
      return new Response(
        JSON.stringify({
          success: true,
          pedido_id: existingOrder.id,
          numero_pedido: existingOrder.numero_pedido || existingOrder.id,
          message: 'Pedido já existe - duplicação prevenida com sucesso',
          duplicate_prevented: true,
          duplicate_details: duplicateCheck
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log('✅ Verificação anti-duplicação RPC concluída - prosseguindo com criação');

    // Verificar se a empresa existe
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', pedidoData.companyId)
      .single()

    if (companyError || !company) {
      console.error('Empresa não encontrada:', companyError)
      return new Response(
        JSON.stringify({ error: 'Empresa não encontrada' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Gerar número do pedido único para evitar conflitos
    const numeroPedido = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
    console.log('🔢 Número do pedido gerado:', numeroPedido)

    // Parse do pagamento se for JSON
    let pagamentoDetalhes = pedidoData.pagamento
    try {
      const parsedPayment = JSON.parse(pedidoData.pagamento)
      if (parsedPayment.method) {
        pagamentoDetalhes = parsedPayment.method
        console.log('💳 Detalhes do pagamento:', parsedPayment)
      }
    } catch {
      // Se não conseguir fazer parse, usar como string simples
    }

    // Criar pedido no banco
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        numero_pedido: numeroPedido,
        company_id: pedidoData.companyId,
        nome: pedidoData.cliente.nome,
        telefone: pedidoData.cliente.telefone,
        endereco: pedidoData.endereco ? 
          `${pedidoData.endereco.logradouro}, ${pedidoData.endereco.numero}${pedidoData.endereco.complemento ? ', ' + pedidoData.endereco.complemento : ''}, ${pedidoData.endereco.bairro}, ${pedidoData.endereco.cidade} - ${pedidoData.endereco.estado}, CEP: ${pedidoData.endereco.cep}` 
          : null,
        tipo: pedidoData.tipo,
        pagamento: pagamentoDetalhes,
        total: pedidoData.total,
        status: 'analise',
        observacoes: pedidoData.observacoes || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (pedidoError) {
      console.error('❌ Erro ao criar pedido:', pedidoError)
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao criar pedido no banco de dados',
          details: pedidoError.message
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ Pedido criado com sucesso:', {
      pedido_id: novoPedido.id,
      company_id: pedidoData.companyId,
      total: pedidoData.total,
      itens_count: pedidoData.carrinho.length
    })

    // DEBUG: Log do carrinho completo
    console.log('🛒 DEBUG: Carrinho completo recebido:', JSON.stringify(pedidoData.carrinho, null, 2))

    // Salvar itens do pedido
    for (const item of pedidoData.carrinho) {
      console.log('🔍 DEBUG: Processando item:', JSON.stringify(item, null, 2))
      const valorTotalItem = item.price * item.quantity
      
      console.log('💾 DEBUG: Tentando inserir item:', {
        pedido_id: novoPedido.id,
        produto_id: item.id,
        nome_produto: item.name,
        quantidade: item.quantity,
        valor_unitario: item.price,
        valor_total: valorTotalItem
      })

      const { data: itemSalvo, error: itemError } = await supabase
        .from('pedido_itens')
        .insert({
          pedido_id: novoPedido.id,
          produto_id: item.id,
          nome_produto: item.name,
          quantidade: item.quantity,
          valor_unitario: item.price,
          valor_total: valorTotalItem
        })
        .select()
        .single()

      if (itemError) {
        console.error('❌ ERRO CRÍTICO ao salvar item:', {
          error: itemError,
          item: item,
          pedido_id: novoPedido.id
        })
        continue
      }

      console.log('✅ Item salvo:', {
        item_id: itemSalvo.id,
        nome: item.name,
        quantidade: item.quantity,
        valor: valorTotalItem
      })

      // Salvar adicionais do item se existirem
      if (item.adicionais && item.adicionais.length > 0) {
        for (const adicional of item.adicionais) {
          const valorTotalAdicional = adicional.price * adicional.quantity
          
          // Buscar o nome real da categoria do adicional
          let categoriaNome = 'Adicional'; // Fallback
          if (adicional.id) {
            try {
              const { data: adicionalCompleto } = await supabase
                .from('adicionais')
                .select(`
                  categorias_adicionais!inner(name)
                `)
                .eq('id', adicional.id)
                .single();
              
              if (adicionalCompleto?.categorias_adicionais?.name) {
                categoriaNome = adicionalCompleto.categorias_adicionais.name;
              }
            } catch (error) {
              console.warn('⚠️ Não foi possível buscar categoria do adicional:', adicional.id);
            }
          }
          
          const { error: adicionalError } = await supabase
            .from('pedido_item_adicionais')
            .insert({
              pedido_item_id: itemSalvo.id,
              categoria_nome: categoriaNome, // Usar nome real da categoria
              nome_adicional: adicional.name,
              quantidade: adicional.quantity,
              valor_unitario: adicional.price,
              valor_total: valorTotalAdicional
            })

          if (adicionalError) {
            console.error('❌ Erro ao salvar adicional:', adicionalError)
          } else {
            console.log('✅ Adicional salvo:', {
              nome: adicional.name,
              categoria: categoriaNome, // Log da categoria real
              quantidade: adicional.quantity,
              valor: valorTotalAdicional
            })
          }
        }
      }
    }

    // Processar débito de cashback se foi aplicado - VERSÃO SEGURA
    if (pedidoData.cashbackAplicado && pedidoData.cashbackAplicado > 0) {
      console.log('💰 Processando débito de cashback SEGURO:', pedidoData.cashbackAplicado);
      
      try {
        // Usar função segura para debitar cashback
        const { data: debitResult, error: debitError } = await supabase
          .rpc('safe_debit_cashback', {
            p_company_id: pedidoData.companyId,
            p_customer_phone: pedidoData.cliente.telefone,
            p_amount: pedidoData.cashbackAplicado,
            p_description: `Cashback utilizado no pedido #${novoPedido.numero_pedido}`,
            p_pedido_id: novoPedido.numero_pedido
          });

        if (debitError) {
          console.error('❌ Erro ao debitar cashback com função segura:', debitError);
          return new Response(
            JSON.stringify({ 
              error: 'Erro ao processar cashback', 
              details: debitError.message 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        if (!debitResult.success) {
          console.error('❌ Débito de cashback rejeitado:', debitResult);
          return new Response(
            JSON.stringify({ 
              error: 'Cashback insuficiente', 
              message: debitResult.error,
              code: debitResult.code,
              available_balance: debitResult.available_balance || 0
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ Cashback debitado com segurança:', {
          cliente: pedidoData.cliente.telefone,
          valor_debitado: pedidoData.cashbackAplicado,
          saldo_anterior: debitResult.previous_balance,
          saldo_novo: debitResult.new_balance,
          transaction_id: debitResult.transaction_id
        });

      } catch (cashbackError) {
        console.error('❌ Erro no processamento seguro de débito de cashback:', cashbackError);
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno no processamento de cashback' 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    // Salvar endereço do cliente se for delivery
    if (pedidoData.endereco && pedidoData.tipo === 'delivery') {
      const { error: enderecoError } = await supabase
        .from('customer_addresses')
        .upsert({
          company_id: pedidoData.companyId,
          customer_phone: pedidoData.cliente.telefone,
          customer_name: pedidoData.cliente.nome,
          logradouro: pedidoData.endereco.logradouro,
          numero: pedidoData.endereco.numero,
          complemento: pedidoData.endereco.complemento,
          bairro: pedidoData.endereco.bairro,
          cidade: pedidoData.endereco.cidade,
          estado: pedidoData.endereco.estado,
          cep: pedidoData.endereco.cep,
          latitude: pedidoData.endereco.latitude,
          longitude: pedidoData.endereco.longitude
        })

      if (enderecoError) {
        console.error('❌ Erro ao salvar endereço:', enderecoError)
      }
    }

    // Resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        pedido_id: novoPedido.id,
        numero_pedido: novoPedido.numero_pedido || numeroPedido,
        total: pedidoData.total,
        status: 'analise',
        message: 'Pedido criado com sucesso',
        empresa: company.name
      }),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Erro no endpoint criar-pedido-publico:', error)
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