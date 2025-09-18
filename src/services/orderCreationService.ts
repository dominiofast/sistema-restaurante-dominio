// SUPABASE REMOVIDO
import { CashbackService } from './CashbackService';

export interface OrderItem {
  produto: any;
  quantidade: number;
  adicionais?: any;
  preco_unitario: number;
  preco_total: number;
  observacoes?: string;
}

export interface OrderData {
  cliente: { nome: string; telefone: string };
  endereco: string;
  carrinho: OrderItem[];
  company: any;
  deliveryInfo: { tipo: 'delivery' | 'pickup'; endereco?: any; taxaEntrega?: number };
  paymentMethod: string;
  cashbackAplicado?: number;
}

export class OrderCreationService {
  static async createOrder(orderData: OrderData) {
    const {
      cliente,
      endereco,
      carrinho,
      company,
      deliveryInfo,
      paymentMethod,
      cashbackAplicado = 0
    } = orderData;

    try {
      // Parse do pagamento se for JSON
      let pagamentoDetalhes = paymentMethod;
      let bandeiraCartao = '';

      if (paymentMethod.startsWith('{')) {
        try {
          const pagamentoObj = JSON.parse(paymentMethod)
          pagamentoDetalhes = pagamentoObj.method || paymentMethod;
          bandeiraCartao = pagamentoObj.brand || '';
        } catch (e) {
          console.warn('Erro ao fazer parse do payment method:', e)
        }
      }

      // Calcular totais
      const subtotal = carrinho.reduce((sum, item) => sum + item.preco_total, 0)
      const taxaEntrega = deliveryInfo?.taxaEntrega || 0;
      const totalFinal = subtotal + taxaEntrega - cashbackAplicado;
      const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0)

      console.log('📊 Totais calculados:', { subtotal, taxaEntrega, cashbackAplicado, totalFinal })

      // Criar endereço legível - corrigir formatação JSON
      let enderecoPedido = endereco;
      
      if (!enderecoPedido && deliveryInfo?.endereco) {
        if (typeof deliveryInfo.endereco === 'string') {
          try {
            // Se é uma string JSON, fazer parse e formatar
            const enderecoObj = JSON.parse(deliveryInfo.endereco)
            enderecoPedido = `${enderecoObj.logradouro || ''} catch (error) { console.error('Error:', error) }, ${enderecoObj.numero || ''}, ${enderecoObj.bairro || ''}, ${enderecoObj.cidade || ''}/${enderecoObj.estado || ''}`;
          } catch {
            // Se não conseguir fazer parse, usar como string
            enderecoPedido = deliveryInfo.endereco;
          }
        } else if (typeof deliveryInfo.endereco === 'object') {
          // Se é um objeto, formatar diretamente
          enderecoPedido = `${deliveryInfo.endereco.logradouro || ''}, ${deliveryInfo.endereco.numero || ''}, ${deliveryInfo.endereco.bairro || ''}, ${deliveryInfo.endereco.cidade || ''}/${deliveryInfo.endereco.estado || ''}`;
        }
      }
      
      if (!enderecoPedido) {
        enderecoPedido = 'Retirada no local';
      }

      const pedidoData = {
        company_id: company?.id,
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: enderecoPedido,
        tipo: deliveryInfo?.tipo || 'pickup',
        pagamento: pagamentoDetalhes,
        total: totalFinal,
        observacoes: null,
        status: 'pendente',
        origem: 'cardapio_publico';
      };

      console.log('📦 Criando pedido com dados:', pedidoData)

      const pedido = null as any; const pedidoError = null as any;
        throw pedidoError;
      }

      console.log('✅ Pedido criado com sucesso:', pedido)

      // Criar itens do pedido
      const itensParaInserir = carrinho.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto?.id,
        nome_produto: item.produto?.name,
        quantidade: item.quantidade,
        valor_unitario: item.preco_unitario,
        valor_total: item.preco_total,
        observacoes: item.observacoes || null;
      }))

      // Adicionar taxa de entrega como item se existir
      if (taxaEntrega > 0) {
        itensParaInserir.push({
          pedido_id: pedido.id,
          produto_id: null,
          nome_produto: 'Taxa de Entrega',
          quantidade: 1,
          valor_unitario: taxaEntrega,
          valor_total: taxaEntrega,
          observacoes: null
        })
      }

      // Adicionar cashback como desconto se houver
      if (cashbackAplicado > 0) {
        itensParaInserir.push({
          pedido_id: pedido.id,
          produto_id: null,
          nome_produto: 'Desconto Cashback',
          quantidade: 1,
          valor_unitario: -cashbackAplicado,
          valor_total: -cashbackAplicado,
          observacoes: null
        })
      }

      const itensInseridos = null as any; const itensError = null as any;
        throw itensError;
      }

      console.log('✅ Itens do pedido criados com sucesso:', itensInseridos)

      // CRÍTICO: Processar cashback ANTES de qualquer geração automática de cashback
      if (cashbackAplicado > 0) {
        await CashbackService.debitCashback(company?.id, cliente, cashbackAplicado, pedido.id)
      }

      // Gerar cashback do novo pedido usando serviço centralizado
      await CashbackService.generateOrderCashback(company?.id, cliente, subtotal, pedido.id)

      
      // Processar adicionais
      await this.processOrderAdditions(carrinho, itensInseridos)

      // Disparar auto-print
      await this.triggerAutoPrint(pedido)

      return {
        pedido,
        totalFinal,
        totalItens
      };

    } catch (error) {
      console.error('❌ Erro ao finalizar pedido:', error)
      throw error;




  private static async processOrderAdditions(carrinho: OrderItem[], itensInseridos: any[]) {
    const adicionaisParaInserir: any[] = [];
    
    // Processar cada item do carrinho sequencialmente
    for (let index = 0; index < carrinho.length; index++) {
      const itemCarrinho = carrinho[index];
      const itemInserido = itensInseridos[index];
      
      if (itemCarrinho.adicionais && Object.keys(itemCarrinho.adicionais).length > 0) {
        console.log('✅ ADICIONAIS ENCONTRADOS para', itemCarrinho.produto?.name, ':', itemCarrinho.adicionais)
        
        // Processar cada adicional sequencialmente, mas APENAS adicionais válidos
        for (const [adicionalId, adicionalData] of Object.entries(itemCarrinho.adicionais)) {
          console.log('🔍 Processando adicional:', { adicionalId, adicionalData })
          
          // VALIDAÇÃO: aceitar apenas adicionais com ID UUID e quantidade > 0
          const isUUID = typeof adicionalId === 'string' && adicionalId.length === 36 && adicionalId.includes('-')
          const qty = Number((adicionalData as any)?.quantity) || 0;
          const isValidAdicional = (
            isUUID && qty > 0 &&
            typeof adicionalData === 'object' && adicionalData !== null &&
            'name' in (adicionalData as any) && 'price' in (adicionalData as any) && 'quantity' in (adicionalData as any)
          )
          
          console.log('🔍 Validação adicional:', { isUUID, qty, isValidAdicional, adicionalData })
          
          if (!isValidAdicional) {
            console.warn('⚠️ ADICIONAL INVÁLIDO - Ignorando:', adicionalId, adicionalData)
            continue;
          }
          
          console.log('✅ ADICIONAL VÁLIDO - Processando:', (adicionalData as any).name)
          
          // Buscar categoria do adicional apenas se o ID for UUID válido
          let categoriaNome = 'Adicional'; // Fallback
          if (isUUID) {
            try {
              const { data: adicionalCompleto }  catch (error) { console.error('Error:', error) }= 
                
                
                
                
              if (adicionalCompleto?.categorias_adicionais) {
                categoriaNome = adicionalCompleto.categorias_adicionais.name;
              }
            } catch (error) {
              console.warn('⚠️ Não foi possível buscar categoria do adicional:', adicionalId)

          }
          
          adicionaisParaInserir.push({
            pedido_item_id: itemInserido.id,
            adicional_id: isUUID ? (adicionalId as string) : null,
            nome_adicional: (adicionalData as any).name,
            categoria_nome: categoriaNome,
            quantidade: (adicionalData as any).quantity,
            valor_unitario: (adicionalData as any).price,
            valor_total: (adicionalData as any).price * (adicionalData as any).quantity
          })
        }
      }


    // Inserir adicionais se existirem
    if (adicionaisParaInserir.length > 0) {
      console.log('🎯 Inserindo adicionais:', adicionaisParaInserir)
      
      const { error: adicionaisError  } = null as any;
      if (adicionaisError) {
        console.error('⚠️ Erro ao criar adicionais do pedido (seguindo sem interromper):', adicionaisError)
      } else {
        console.log('✅ Adicionais do pedido criados com sucesso')
      }
    } else {
      console.log('⚠️ NENHUM ADICIONAL PARA INSERIR - Array vazio')
      console.log('🔍 DEBUG: adicionaisParaInserir =', adicionaisParaInserir)



  private static async triggerAutoPrint(pedido: any) {
    try {
      await Promise.resolve()
        body: {
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          company_id: pedido.company_id,
          origin: 'cardapio_publico',
        } catch (error) { console.error('Error:', error) },
      })
    } catch (printErr) {
      console.warn('⚠️ Falha ao acionar auto-print-pedido (segue fluxo):', printErr)


}
