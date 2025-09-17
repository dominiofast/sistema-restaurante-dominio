import { supabase } from '@/integrations/supabase/client'

export interface PedidoData {
  companyId: string
  cliente: {
    nome: string
    telefone: string
  }
  carrinho: Array<{
    id: string
    name: string
    price: number
    quantity: number
    adicionais?: Array<{
      id: string
      name: string
      price: number
      quantity: number
    }>
  }>
  total: number
  forma_pagamento?: string
  pagamento?: string
  tipo?: string
  tipo_pedido?: string
  observacoes?: string
  endereco?: any
  pix_data?: any
}

export interface CriarPedidoResponse {
  success: boolean
  pedido_id: string
  numero_pedido: string
  total: number
  status: string
  message: string
  empresa: string
  itens_processados: number
  itens_salvos: number
  itens_com_produto_id: number
  itens_sem_produto_id: number
  warnings: string[]
  endpoint: string
}

export async function criarPedidoLocal(pedidoData: PedidoData): Promise<CriarPedidoResponse> {
  console.log('🛒 DEBUG LOCAL: Criando pedido local...', pedidoData)

  try {
    // 1. Buscar empresa
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', pedidoData.companyId)
      .single()

    if (companyError || !company) {
      console.error('❌ Empresa não encontrada:', companyError)
      throw new Error('Empresa não encontrada')
    }

    console.log('✅ Empresa encontrada:', company.name)

    // 2. Gerar número do pedido
    const numeroPedido = Math.floor(Math.random() * 10000) + 1000

    // 3. Criar pedido (COLUNAS CORRETAS!)
    const { data: novoPedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        company_id: pedidoData.companyId,
        numero_pedido: numeroPedido,
        nome: pedidoData.cliente.nome,
        telefone: pedidoData.cliente.telefone,
        status: 'analise',
        total: pedidoData.total,
        pagamento: pedidoData.forma_pagamento || pedidoData.pagamento,
        tipo: pedidoData.tipo || 'delivery',
        observacoes: pedidoData.observacoes || null,
        origem: 'cardapio_publico_local',
        created_at: new Date().toISOString()
      } as any)
      .select()
      .single()

    if (pedidoError) {
      console.error('❌ Erro ao criar pedido:', pedidoError)
      throw new Error(`Erro ao criar pedido: ${pedidoError.message}`)
    }

    console.log('✅ Pedido criado LOCAL:', {
      pedido_id: novoPedido.id,
      numero_pedido: novoPedido.numero_pedido,
      total: pedidoData.total,
      itens_count: pedidoData.carrinho.length
    })

    // Contadores para relatório
    let itensProcessados = 0
    let itensSalvos = 0
    let itensComProdutoId = 0
    let itensSemProdutoId = 0
    const warnings: string[] = []

    // 4. Salvar itens (LÓGICA CORRIGIDA!)
    for (const item of pedidoData.carrinho) {
      itensProcessados++
      console.log('🔍 DEBUG LOCAL: Processando item:', item)
      
      const valorTotalItem = item.price * item.quantity

      // VALIDAÇÃO: Verificar se produto existe
      const { data: produtoExiste, error: produtoError } = await supabase
        .from('produtos')
        .select('id')
        .eq('id', item.id)
        .eq('company_id', pedidoData.companyId)
        .single()

      let itemSalvo = null

      if (produtoError || !produtoExiste) {
        console.warn('⚠️ PRODUTO NÃO ENCONTRADO - inserindo sem produto_id:', {
          produto_id: item.id,
          nome: item.name
        })
        
        // Inserir item SEM produto_id (FALLBACK SEGURO)
        const { data: itemResult, error: itemError } = await supabase
          .from('pedido_itens')
          .insert({
            pedido_id: novoPedido.id,
            produto_id: null, // NULL para IDs inválidos
            nome_produto: item.name,
            quantidade: item.quantity,
            valor_unitario: item.price,
            valor_total: valorTotalItem
          })
          .select()
          .single()

        if (itemError) {
          console.error('❌ ERRO ao salvar item sem produto_id:', itemError)
          continue
        }

        itemSalvo = itemResult
        itensSalvos++
        itensSemProdutoId++
        warnings.push(`Item "${item.name}" salvo sem produto_id (produto não encontrado)`)
        console.log('✅ Item salvo SEM produto_id:', item.name)

      } else {
        // Produto existe - inserir normalmente
        const { data: itemResult, error: itemError } = await supabase
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
          console.error('❌ ERRO ao salvar item:', itemError)
          continue
        }

        itemSalvo = itemResult
        itensSalvos++
        itensComProdutoId++
        console.log('✅ Item salvo COM produto_id:', item.name)
      }

      // Salvar adicionais se existirem
      if (item.adicionais && item.adicionais.length > 0 && itemSalvo) {
        console.log('🔍 DEBUG LOCAL: Processando adicionais:', item.adicionais.length)
        
        for (const adicional of item.adicionais) {
          const valorTotalAdicional = adicional.price * adicional.quantity
          
          const { error: adicionalError } = await supabase
            .from('pedido_item_adicionais')
            .insert({
              pedido_item_id: itemSalvo.id,
              categoria_nome: 'Adicional',
              nome_adicional: adicional.name,
              quantidade: adicional.quantity,
              valor_unitario: adicional.price,
              valor_total: valorTotalAdicional
            })

          if (adicionalError) {
            console.error('❌ ERRO ao salvar adicional:', adicionalError)
          } else {
            console.log('✅ Adicional salvo:', adicional.name)
          }
        }
      }
    }

    // Log estatísticas finais
    console.log('📊 ESTATÍSTICAS FINAIS LOCAL:', {
      itens_processados: itensProcessados,
      itens_salvos: itensSalvos,
      itens_com_produto_id: itensComProdutoId,
      itens_sem_produto_id: itensSemProdutoId,
      warnings_count: warnings.length
    })

    // Resposta de sucesso
    return {
      success: true,
      pedido_id: novoPedido.id,
      numero_pedido: novoPedido.numero_pedido,
      total: pedidoData.total,
      status: 'analise',
      message: 'Pedido criado com sucesso via função local',
      empresa: company.name,
      // Estatísticas detalhadas
      itens_processados: itensProcessados,
      itens_salvos: itensSalvos,
      itens_com_produto_id: itensComProdutoId,
      itens_sem_produto_id: itensSemProdutoId,
      warnings: warnings,
      endpoint: 'local-frontend'
    }

  } catch (error) {
    console.error('💥 ERRO na função local:', error)
    throw new Error(`Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}