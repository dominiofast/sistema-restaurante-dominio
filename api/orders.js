// ENDPOINT SERVERLESS DESABILITADO - Sistema migrado para PostgreSQL Express
// Este arquivo foi mantido apenas para compatibilidade com deployments antigos

console.warn('⚠️ API Serverless Supabase desabilitada - use /api/orders do Express PostgreSQL');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // MIGRAÇÃO: Redirecionar para PostgreSQL Express endpoint
  return res.status(301).json({
    migrated: true,
    message: 'Sistema migrado para PostgreSQL - use /api/orders do Express',
    new_endpoint: '/api/orders',
    timestamp: new Date().toISOString(),
    environment: 'serverless-deprecated'
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    console.log('🚀 === CRIAÇÃO DE PEDIDO SERVER-SIDE ===');
    
    if (!SUPABASE_URL) {
      console.error('❌ SUPABASE_URL não encontrada');
      return res.status(500).json({ 
        error: 'Configuração URL ausente',
        details: 'Supabase URL não configurada'
      });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ SERVICE ROLE KEY não encontrada - usando cliente público como fallback');
      // FALLBACK: Usar cliente público se não tiver service role
      // Ainda pode funcionar com RLS bem configurado
    }

    // CLIENT COM SERVICE ROLE - ou fallback para cliente público
    const finalKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_PUBLIC_KEY;
    const isServiceRole = !!SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('🔑 Usando chave:', isServiceRole ? 'SERVICE_ROLE' : 'PUBLIC_ANON');
    
    const supabase = createClient(
      SUPABASE_URL, 
      finalKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    const pedidoData = req.body;
    
    console.log('📦 Dados recebidos:', {
      companyId: pedidoData.companyId,
      itemsCount: pedidoData.itens?.length || 0,
      total: pedidoData.total
    });

    // 1. Validação básica
    if (!pedidoData.companyId || !pedidoData.cliente?.nome || !pedidoData.itens?.length) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios: companyId, cliente.nome, itens' 
      });
    }

    // 2. Gerar número do pedido
    const numeroPedido = Math.floor(Math.random() * 10000) + 1000;
    console.log(`🔢 Número do pedido gerado: ${numeroPedido}`);

    // 3. CRIAR PEDIDO - OPERAÇÃO ATÔMICA COM SERVICE ROLE
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        company_id: pedidoData.companyId,
        numero_pedido: numeroPedido,
        nome: pedidoData.cliente.nome,
        telefone: pedidoData.cliente.telefone || '',
        endereco: pedidoData.endereco || '',
        status: 'analise',
        total: pedidoData.total,
        pagamento: pedidoData.forma_pagamento || pedidoData.pagamento || 'dinheiro',
        tipo: pedidoData.tipo || 'delivery',
        observacoes: pedidoData.observacoes || null,
        origem: 'cardapio_server',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (pedidoError) {
      console.error('❌ Erro ao criar pedido:', pedidoError);
      return res.status(500).json({ error: 'Erro ao criar pedido', details: pedidoError.message });
    }

    console.log('✅ Pedido criado:', { id: novoPedido.id, numero: novoPedido.numero_pedido });

    // 4. CRIAR ITENS DO PEDIDO - COM SERVICE ROLE
    const itensSalvos = [];
    
    for (const item of pedidoData.itens) {
      console.log(`📝 Salvando item: ${item.nome} (produto_id: ${item.produto_id})`);
      
      const { data: itemSalvo, error: itemError } = await supabase
        .from('pedido_itens')
        .insert({
          pedido_id: novoPedido.id,
          produto_id: item.produto_id || null, // FALLBACK SEGURO
          nome_produto: item.nome || item.name,
          quantidade: item.quantidade || item.quantity,
          valor_unitario: (item.preco || item.price || 0).toString(),
          valor_total: ((item.preco || item.price || 0) * (item.quantidade || item.quantity || 1)).toString(),
          observacoes: item.observacoes || item.observacoes_item || null
        })
        .select()
        .single();

      if (itemError) {
        console.error(`❌ Erro ao salvar item ${item.nome}:`, itemError);
        // CONTINUA mesmo com erro - salva o que conseguir
        continue;
      }

      console.log(`✅ Item salvo: ${itemSalvo.nome_produto} (ID: ${itemSalvo.id})`);
      itensSalvos.push(itemSalvo);

      // 5. SALVAR ADICIONAIS (se existirem)
      if (item.adicionais && item.adicionais.length > 0) {
        for (const adicional of item.adicionais) {
          const valorTotalAdicional = adicional.price * adicional.quantity;
          
          const { error: adicionalError } = await supabase
            .from('pedido_item_adicionais')
            .insert({
              pedido_item_id: itemSalvo.id,
              categoria_nome: 'Adicional',
              nome_adicional: adicional.name,
              quantidade: adicional.quantity,
              valor_unitario: adicional.price.toString(),
              valor_total: valorTotalAdicional.toString()
            });

          if (adicionalError) {
            console.error('❌ Erro ao salvar adicional:', adicionalError);
          } else {
            console.log(`✅ Adicional salvo: ${adicional.name}`);
          }
        }
      }
    }

    // 6. RESPOSTA DE SUCESSO
    const resposta = {
      success: true,
      pedido: {
        id: novoPedido.id,
        numero_pedido: novoPedido.numero_pedido,
        status: novoPedido.status,
        total: novoPedido.total
      },
      itens_salvos: itensSalvos.length,
      total_itens: pedidoData.itens.length
    };

    console.log('🎉 PEDIDO CRIADO COM SUCESSO:', resposta);
    return res.status(200).json(resposta);

  } catch (error) {
    console.error('💥 ERRO CRÍTICO:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor', 
      details: error.message 
    });
  }
}