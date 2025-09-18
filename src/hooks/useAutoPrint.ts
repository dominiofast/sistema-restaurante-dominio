import { useEffect } from 'react';
// // SUPABASE REMOVIDO
// DESABILITADO - Sistema migrado para PostgreSQL
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Função para fazer requests à API PostgreSQL
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const useAutoPrint = () => {
  const { currentCompany } = useAuth();
  
  console.log('🎯 useAutoPrint - Hook iniciado, currentCompany:', currentCompany);

  // Função para impressão automática baseada na lógica existente
  const printPedidoAutomatico = async (pedidoId: number) => {
    try {
      console.log('🖨️ Iniciando impressão automática do pedido:', pedidoId);

      // Buscar dados do pedido
      console.log('🔍 Buscando dados do pedido:', pedidoId);
      const pedido = await apiRequest(`/api/pedidos/${pedidoId}`);

      console.log('📋 Dados do pedido encontrado:', pedido);

      // Buscar dados completos da empresa
      const empresaInfo = await apiRequest(`/api/company-info?company_id=${currentCompany?.id}`);

      // Buscar endereço da empresa
      const empresaEndereco = await apiRequest(`/api/company-addresses?company_id=${currentCompany?.id}&is_principal=true`);

      // Buscar configurações da impressora
      const printerConfig = await apiRequest(`/api/company-settings?company_id=${currentCompany?.id}`);

      // Buscar itens do pedido com adicionais
      console.log('🔍 Buscando itens do pedido:', pedidoId);
      const itens = await apiRequest(`/api/pedido-itens?pedido_id=${pedidoId}`);

      console.log('📝 Itens encontrados:', itens?.length || 0);
      console.log('📝 Dados dos itens:', itens);
      
      // Debug detalhado dos adicionais
      if (itens && itens.length > 0) {
        itens.forEach((item, index) => {
          console.log(`📦 Item ${index + 1}:`, {
            nome: item.nome_produto,
            observacoes: item.observacoes,
            adicionais: item.pedido_item_adicionais
          });
        });
      }

      // Verificar se há itens antes de prosseguir
      if (!itens || itens.length === 0) {
        console.warn('⚠️ Nenhum item encontrado para o pedido', pedidoId);
        throw new Error('Nenhum item encontrado no pedido');
      }

      // Preparar dados para impressão
      const empresaNome = empresaInfo?.nome_estabelecimento || 'ESTABELECIMENTO';
      const empresaEnderecoPrincipal = empresaEndereco ? 
        `${empresaEndereco.logradouro}, ${empresaEndereco.numero}${empresaEndereco.complemento ? `, ${empresaEndereco.complemento}` : ''}\n${empresaEndereco.bairro} - ${empresaEndereco.cidade}/${empresaEndereco.estado}\nCEP: ${empresaEndereco.cep || 'N/A'}` :
        (empresaInfo?.endereco || '');
      const empresaTelefone = empresaInfo?.contato || '';

      // Formatar texto do pedido
      const pedidoFormatado = `
========================================
           ${empresaNome}
========================================
${empresaEnderecoPrincipal}
Tel: ${empresaTelefone}
${empresaInfo?.cnpj_cpf ? `CNPJ: ${empresaInfo.cnpj_cpf}` : ''}

PEDIDO #${pedido.numero_pedido || pedido.id}
Data/Hora: ${new Date().toLocaleString('pt-BR')}
${pedido.nome ? `Cliente: ${pedido.nome}` : ''}
${pedido.telefone ? `Tel: ${pedido.telefone}` : ''}
${pedido.endereco ? `End: ${pedido.endereco}` : ''}

----------------------------------------
ITENS:
----------------------------------------
${itens?.map(item => {
  // Calcular valor base do item (quantidade x valor unitário)
  let valorBaseItem = item.quantidade * item.valor_unitario;
  
  // Calcular total dos adicionais
  let valorAdicionais = 0;
  if (item.pedido_item_adicionais && item.pedido_item_adicionais.length > 0) {
    valorAdicionais = item.pedido_item_adicionais.reduce((acc, adicional) => {
      return acc + (adicional.quantidade * adicional.valor_unitario);
    }, 0);
  }
  
  // Subtotal correto = valor base + adicionais
  let subtotalCorreto = valorBaseItem + valorAdicionais;
  
  let itemText = `${item.quantidade}x ${item.nome_produto} - R$ ${item.valor_unitario.toFixed(2)}`;
  
  // Adicionar observações do item se existirem
  if (item.observacoes && item.observacoes.trim()) {
    itemText += `\n   Obs: ${item.observacoes.trim()}`;
  }
  
  // Adicionar adicionais se existirem
  if (item.pedido_item_adicionais && item.pedido_item_adicionais.length > 0) {
    itemText += '\n   Adicionais:';
    item.pedido_item_adicionais.forEach(adicional => {
      const precoAdicional = adicional.valor_unitario || 0;
      itemText += `\n   + ${adicional.quantidade}x ${adicional.nome_adicional}${precoAdicional > 0 ? ` - R$ ${precoAdicional.toFixed(2)}` : ''}`;
    });
  }
  
  itemText += `\n   Subtotal: R$ ${subtotalCorreto.toFixed(2)}\n`;
  return itemText;
}).join('') || 'Nenhum item encontrado'}
----------------------------------------
TOTAL: R$ ${pedido.total?.toFixed(2) || '0.00'}
Pagamento: ${pedido.pagamento || 'Não informado'}
----------------------------------------

Obrigado pela preferencia!
========================================

\x1B\x6D
      `.trim();

      // Enviar para Dominio Printer
      const printData = {
        printerName: printerConfig?.dominio_printer_name || 'MP-4200 TH',
        text: pedidoFormatado,
        rawMode: true  // v2.2.1 - Impressão sem alterações, controle total pelo app
      };

      console.log('🖨️ Enviando para Dominio Printer...');
      
      const printResponse = await fetch('http://localhost:3001/print-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(printData)
      });

      const printResult = await printResponse.json();
      
      if (printResult.success) {
        console.log('✅ Pedido impresso automaticamente com sucesso!');
        return true;
      } else {
        console.error('❌ Falha na impressão automática:', printResult.error);
        throw new Error(`Falha na impressão: ${printResult.error}`);
      }

    } catch (error) {
      console.error('💥 Erro na impressão automática:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('🚀 useAutoPrint useEffect executado');
    console.log('🏢 currentCompany:', currentCompany);
    
    if (!currentCompany?.id) {
      console.log('❌ useAutoPrint - Empresa não encontrada, currentCompany:', currentCompany);
      return;
    }

    console.log('🔔 Configurando escuta para novos pedidos da empresa:', currentCompany.id);

    // Escutar novos pedidos em tempo real - DESABILITADO (Supabase removido)
    // const channel = supabase
    //   .channel('new-orders-auto-print')
    //   .on(
    //     'postgres_changes',
    //     {
    //       event: 'INSERT',
    //       schema: 'public',
    //       table: 'pedidos',
    //       filter: `company_id=eq.${currentCompany.id}`
    //     },
    //     async (payload) => {
    //       console.log('🆕 Novo pedido detectado para impressão automática:', payload.new);
    //       
    //       const pedido = payload.new;
    //       
    //       // Aguardar mais tempo para garantir que o pedido e itens foram salvos
    //       setTimeout(async () => {
    //         try {
    //           console.log('⏰ Tentando impressão automática após delay...');
    //           let success = await printPedidoAutomatico(pedido.id);
    //           
    //           // Se não conseguir na primeira tentativa, tentar novamente
    //           if (!success) {
    //             console.log('🔄 Primeira tentativa falhou, tentando novamente em 3 segundos...');
    //             setTimeout(async () => {
    //               try {
    //                 const retrySuccess = await printPedidoAutomatico(pedido.id);
    //                 if (retrySuccess) {
    //                   toast.success(`Pedido #${pedido.numero_pedido || pedido.id} impresso automaticamente (2ª tentativa)!`);
    //                 } else {
    //                   toast.error(`Erro na impressão automática do pedido #${pedido.numero_pedido || pedido.id} - Verifique se os itens foram salvos`);
    //                 }
    //               } catch (retryErr) {
    //                 console.error('💥 Erro na segunda tentativa:', retryErr);
    //                 toast.error('Erro na segunda tentativa de impressão automática');
    //               }
    //             }, 3000);
    //           } else {
    //             toast.success(`Pedido #${pedido.numero_pedido || pedido.id} impresso automaticamente!`);
    //           }
    //         } catch (err) {
    //           console.error('💥 Erro ao executar impressão automática:', err);
    //           toast.error('Erro ao executar impressão automática');
    //         }
    //       }, 5000); // Aumentado para 5 segundos
    //     }
    //   )
    //   .subscribe((status) => {
    //     console.log('📡 Status da subscrição do canal:', status);
    //     if (status === 'SUBSCRIBED') {
    //       console.log('✅ Canal de escuta configurado com sucesso!');
    //     }
    //   });

    return () => {
      console.log('🔕 Removendo escuta de novos pedidos');
      // channel?.unsubscribe();
    };
  }, [currentCompany?.id]); // Removida dependência da função para evitar loop

  return {
    // Função para impressão manual quando necessário
    triggerAutoPrint: async (pedidoId: number) => {
      if (!currentCompany?.id) {
        toast.error('Empresa não encontrada');
        return false;
      }

      try {
        console.log('🖨️ Disparando impressão manual...');
        
        const success = await printPedidoAutomatico(pedidoId);
        
        if (success) {
          toast.success(`Pedido #${pedidoId} impresso com sucesso!`);
          return true;
        } else {
          toast.error(`Erro na impressão do pedido #${pedidoId}`);
          return false;
        }
      } catch (err) {
        console.error('💥 Erro ao executar impressão manual:', err);
        toast.error('Erro ao executar impressão');
        return false;
      }
    }
  };
};