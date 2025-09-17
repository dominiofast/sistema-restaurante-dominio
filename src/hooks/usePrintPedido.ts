import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Pedido } from '@/types/pedidos';
import { formatPedidoESCPOS, PedidoTemplateData } from '@/utils/printTemplates';
import { useNFCeLogs } from './useNFCeLogs';
import { supabase } from '@/integrations/supabase/client';

// Remove acentos para evitar problemas de codificação na impressora ESC/POS
const stripAccents = (input: string) => {
  try {
    return input ? input.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : input;
  } catch {
    return input;
  }
};

export const usePrintPedido = (companyId: string) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [paperWidth, setPaperWidth] = useState(42); // Padrão mais seguro (58mm)
  const { getNFCeData } = useNFCeLogs(companyId);
  
  // Carregar configuração de largura do banco de dados
  useEffect(() => {
    const loadPrinterConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('printer_configs')
          .select('largura_papel')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.warn('Erro ao carregar configuração de impressora:', error);
          return;
        }

        if (data && data.largura_papel) {
          setPaperWidth(data.largura_papel);
          console.log('📏 Largura carregada do banco:', data.largura_papel);
          console.log('🔍 DEBUG - Estado paperWidth após setPaperWidth:', data.largura_papel);
        } else {
          console.log('🔴 DEBUG - Nenhuma configuração encontrada no banco, usando padrão:', paperWidth);
          console.log('🔍 DEBUG - Dados retornados do banco:', data);
        }
      } catch (error) {
        console.error('Erro ao carregar configuração:', error);
      }
    };

    if (companyId) {
      loadPrinterConfig();
    }
  }, [companyId]);

  // Função para gerar cupom fiscal formatado com ESC/POS (mesmo template base)
  const generateCupomFiscalESCPOS = (cupomData: any): string => {
    // DEBUG: Verificar largura dentro da função de formatação
    console.log('🔍 DEBUG - generateCupomFiscalESCPOS chamada com paperWidth:', paperWidth);
    console.log('🔍 DEBUG - Separador que será usado:', '='.repeat(paperWidth));
    
    let commands = '';
    
    // Reset e configuração inicial
    commands += '\x1B\x40'; // ESC @ - Reset
    commands += '\x1B\x4D\x00'; // ESC M 0 - Fonte A (largura padrão 48 em 80mm / 32 em 58mm)
    
    // Cabeçalho da empresa
    commands += '\x1B\x61\x01'; // Center align
    commands += '\x1B\x21\x30'; // Double size
    commands += (cupomData.empresa?.nome || 'ESTABELECIMENTO') + '\n';
    commands += '\x1B\x21\x00'; // Normal size
    if (cupomData.empresa?.endereco) {
      commands += cupomData.empresa.endereco + '\n';
    }
    if (cupomData.empresa?.telefone) {
      commands += 'Tel: ' + cupomData.empresa.telefone + '\n';
    }
    commands += '\x1B\x61\x00'; // Left align
    commands += '\n';
    
    // Separador exatamente na largura do papel
    const separator = '='.repeat(paperWidth).slice(0, paperWidth);
console.log('🔍 DEBUG - Tamanho real do separador:', separator.length);
    commands += separator + '\n';
    commands += '\x1B\x61\x01'; // Center
    const titulo = cupomData.title || (cupomData.tipo === 'PEDIDO' ? 'PEDIDO' : 'CUPOM FISCAL - NFCe');
    commands += `${titulo}\n`;
    commands += '\x1B\x61\x00'; // Left align
    commands += separator + '\n';
    
    // Informações do pedido
    commands += `Pedido: ${cupomData.numeroPedido}\n`;
    commands += `Data: ${cupomData.dataHora}\n`;
    if (cupomData.cliente?.nome && cupomData.cliente.nome !== 'Consumidor Final') {
      commands += `Cliente: ${cupomData.cliente.nome}\n`;
      if (cupomData.cliente.telefone) {
        commands += `Tel: ${cupomData.cliente.telefone}\n`;
      }
    }
    commands += '\n';
    
    // Separador de itens
    commands += '='.repeat(paperWidth).slice(0, paperWidth) + '\n';
    commands += 'ITENS:\n';
    commands += '-'.repeat(paperWidth).slice(0, paperWidth) + '\n';
    
    // Lista de itens
    let total = 0;
    if (cupomData.items && cupomData.items.length > 0) {
      cupomData.items.forEach((item: any) => {
        const subtotal = item.subtotal || (item.quantity * item.price);
        total += subtotal;
        
        
        if (item.observacoes) {
          commands += `  Obs: ${item.observacoes}\n`;
        }
        
        // Adicionais
        if (item.adicionais && item.adicionais.length > 0) {
          item.adicionais.forEach((adicional: any) => {
            commands += `  + ${adicional.quantity}x ${adicional.name}\n`;
          });
        }
        
        // Preço alinhado à direita usando largura configurada
        const precoStr = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    const buildLine = (l: string, r: string) => {
      const right = r || '';
      const maxLeft = Math.max(0, paperWidth - right.length);
      const base = l || '';
      const leftTrunc = base.length > maxLeft ? base.slice(0, Math.max(0, maxLeft - 3)) + '...' : base;
      const spaces = Math.max(0, paperWidth - (leftTrunc.length + right.length));
      return leftTrunc + ' '.repeat(spaces) + right;
    };
    commands += buildLine(`${item.quantity}x ${item.name}`, precoStr) + '\n';
        commands += '\n';
      });
    }
    
    // Subtotal, cashback, taxa de entrega e total
    commands += '='.repeat(paperWidth).slice(0, paperWidth) + '\n';
    
    // Se houver cashback ou taxa de entrega, mostrar detalhamento
    if (cupomData.cashback || cupomData.taxaEntrega) {
      // Subtotal
      const subtotalStr = `Subtotal: R$ ${total.toFixed(2).replace('.', ',')}`;
      const subtotalSpaces = Math.max(0, paperWidth - subtotalStr.length);
      commands += ' '.repeat(subtotalSpaces) + subtotalStr + '\n';
      
      // Taxa de entrega se houver
      if (cupomData.taxaEntrega && cupomData.taxaEntrega > 0) {
        const taxaStr = `Taxa de Entrega: R$ ${cupomData.taxaEntrega.toFixed(2).replace('.', ',')}`;
        const taxaSpaces = Math.max(0, paperWidth - taxaStr.length);
        commands += ' '.repeat(taxaSpaces) + taxaStr + '\n';
      }
      
      // Cashback se houver
      if (cupomData.cashback && cupomData.cashback > 0) {
        const cashbackStr = `Desconto Cashback: - R$ ${cupomData.cashback.toFixed(2).replace('.', ',')}`;
        const cashbackSpaces = Math.max(0, paperWidth - cashbackStr.length);
        commands += ' '.repeat(cashbackSpaces) + cashbackStr + '\n';
      }
      
      commands += '-'.repeat(paperWidth).slice(0, paperWidth) + '\n';
    }
    
    // Total final em destaque
    commands += '\x1B\x45\x01'; // Bold on
    const totalStr = `TOTAL: R$ ${(cupomData.total || total).toFixed(2).replace('.', ',')}`;
    const totalSpaces = Math.max(0, paperWidth - totalStr.length);
    commands += ' '.repeat(totalSpaces) + totalStr + '\n';
    commands += '\x1B\x45\x00'; // Bold off
    
    // Informações do cupom fiscal
    if (cupomData.cupomFiscal) {
      commands += '\n';
      commands += '='.repeat(paperWidth).slice(0, paperWidth) + '\n';
      commands += '\x1B\x61\x01'; // Center
      commands += 'DADOS FISCAIS\n';
      commands += '\x1B\x61\x00'; // Left align
      commands += '-'.repeat(paperWidth).slice(0, paperWidth) + '\n';
      commands += `NFCe: ${cupomData.cupomFiscal.numero}\n`;
      commands += `Série: ${cupomData.cupomFiscal.serie}\n`;
      if (cupomData.cupomFiscal.chave && cupomData.cupomFiscal.chave !== 'N/A') {
        commands += `Chave: ${cupomData.cupomFiscal.chave}\n`;
      }
      if (cupomData.cupomFiscal.protocolo && cupomData.cupomFiscal.protocolo !== 'N/A') {
        commands += `Protocolo: ${cupomData.cupomFiscal.protocolo}\n`;
      }
    }
    
    // Forma de pagamento
    if (cupomData.pagamento) {
      commands += '\n';
      commands += `Pagamento: ${cupomData.pagamento}\n`;
    }
    
    // Rodapé
    commands += '\n';
    commands += '='.repeat(paperWidth).slice(0, paperWidth) + '\n';
    commands += '\x1B\x61\x01'; // Center
    commands += 'Obrigado pela preferência!\n';
    commands += '\x1B\x61\x00'; // Left align
    
    // Corte
    commands += '\n\n\n';
    commands += '\x1D\x56\x41\x10'; // Partial cut
    
    return commands;
  };

  const printCupomFiscal = async (pedido: Pedido) => {
    try {
      setIsPrinting(true);
      console.log('🧾 Iniciando impressão do cupom fiscal:', pedido.id);

      // Buscar dados da NFCe do pedido
      const nfceData = getNFCeData(pedido.id);

      if (!nfceData) {
        toast.error('Nenhum cupom fiscal encontrado para este pedido');
        return false;
      }

      // Buscar informações da empresa
      const { data: companyInfo, error: companyError } = await supabase
        .from('company_info')
        .select('nome_estabelecimento, endereco, contato')
        .eq('company_id', pedido.company_id)
        .single();

      if (companyError) {
        console.error('Erro ao buscar informações da empresa:', companyError);
      }

      // Buscar itens do pedido com adicionais
      const { data: itens, error: itensError } = await supabase
        .from('pedido_itens')
        .select(`
          id,
          nome_produto, 
          quantidade, 
          valor_unitario, 
          observacoes,
          pedido_item_adicionais(
            nome_adicional,
            categoria_nome,
            quantidade,
            valor_unitario
          )
        `)
        .eq('pedido_id', pedido.id);

      console.log('📋 Itens encontrados:', itens);
      
      if (itensError) {
        console.error('Erro ao buscar itens do pedido:', itensError);
        toast.error('Erro ao buscar itens do pedido');
        return false;
      }

      // Separar itens especiais (cashback, taxa de entrega) dos itens normais
      const itensNormais = itens?.filter(item => 
        item.nome_produto !== 'Desconto Cashback' && 
        item.nome_produto !== 'Taxa de Entrega'
      ) || [];
      
      const cashbackItem = itens?.find(item => item.nome_produto === 'Desconto Cashback');
      const taxaEntregaItem = itens?.find(item => item.nome_produto === 'Taxa de Entrega');
      
      // Log dos valores especiais
      if (cashbackItem) {
        console.log('💰 Cashback encontrado:', cashbackItem.valor_unitario);
      }
      if (taxaEntregaItem) {
        console.log('🚚 Taxa de entrega encontrada:', taxaEntregaItem.valor_unitario);
      }

      // Montar dados para impressão do cupom fiscal
      const printData = {
        nomeEmpresa: companyInfo?.nome_estabelecimento || 'Estabelecimento',
        enderecoEmpresa: companyInfo?.endereco || 'Endereço não informado',
        telefoneEmpresa: companyInfo?.contato || 'Telefone não informado',
        numeroPedido: String(pedido.id),
        cliente: pedido.nome ? {
          nome: pedido.nome,
          telefone: pedido.telefone || '',
          endereco: pedido.endereco || ''
        } : { nome: 'Consumidor Final', telefone: '', endereco: '' },
        itens: itensNormais?.map(item => ({
          nome: item.nome_produto,
          quantidade: item.quantidade,
          preco: item.valor_unitario,
          observacoes: item.observacoes || undefined,
          adicionais: item.pedido_item_adicionais?.map(adicional => ({
            nome: adicional.nome_adicional,
            categoria: adicional.categoria_nome,
            quantidade: adicional.quantidade,
            preco: adicional.valor_unitario
          })) || []
        })) || [
          {
            nome: 'Pedido sem itens detalhados',
            quantidade: 1,
            preco: pedido.total || 0
          }
        ],
        formaPagamento: pedido.pagamento || 'Não informado',
        cupomFiscal: {
          numero: nfceData.numero_nfce || 'N/A',
          chave: nfceData.chave_nfe || 'N/A',
          protocolo: nfceData.protocolo_autorizacao || 'N/A',
          dataAutorizacao: nfceData.data_autorizacao || new Date().toISOString(),
          serie: nfceData.serie || 1
        },
        config: {
          width: 48,
          removeAccents: true,
          marginLeft: 0
        }
      };

      console.log('🧾 Dados do cupom fiscal preparados:', printData);

      // Buscar configurações da impressora
      const { data: printerConfig, error: printerError } = await supabase
        .from('company_settings')
        .select('dominio_printer_name')
        .eq('company_id', pedido.company_id)
        .single();

      if (printerError) {
        console.warn('⚠️ Configuração de impressora não encontrada');
      }

      // Preparar dados no formato da API do Dominio Printer para cupom fiscal
      const dominioPrintData = {
        printerName: printerConfig?.dominio_printer_name || 'Impressora Padrão',
        empresa: {
          nome: companyInfo?.nome_estabelecimento || 'ESTABELECIMENTO',
          endereco: companyInfo?.endereco || '',
          telefone: companyInfo?.contato || ''
        },
        numeroPedido: `${pedido.id} - NFCe: ${nfceData.numero_nfce || 'N/A'}`,
        dataHora: new Date().toLocaleString('pt-BR'),
        cliente: pedido.nome ? {
          nome: pedido.nome,
          telefone: pedido.telefone || '',
          endereco: pedido.endereco || ''
        } : {
          nome: 'Consumidor Final',
          telefone: '',
          endereco: ''
        },
        items: itensNormais?.map(item => {
          // Calcular valor base do item
          const valorBaseItem = item.quantidade * item.valor_unitario;
          
          // Calcular total dos adicionais
          const valorAdicionais = item.pedido_item_adicionais?.reduce((acc, adicional) => {
            return acc + (adicional.quantidade * adicional.valor_unitario);
          }, 0) || 0;
          
          // Subtotal correto = valor base + adicionais
          const subtotalCorreto = valorBaseItem + valorAdicionais;
          
          return {
            name: item.nome_produto,
            quantity: item.quantidade,
            price: item.valor_unitario,
            subtotal: subtotalCorreto,
            observacoes: item.observacoes || undefined,
            adicionais: item.pedido_item_adicionais?.length > 0 ? 
              item.pedido_item_adicionais.map(adicional => ({
                name: adicional.nome_adicional,
                quantity: adicional.quantidade,
                price: adicional.valor_unitario
              })) : undefined
          };
        }) || [{
          name: 'Pedido sem itens detalhados',
          quantity: 1,
          price: pedido.total || 0,
          subtotal: pedido.total || 0
        }],
        total: pedido.total || 0,
        pagamento: pedido.pagamento || 'Não informado',
        cashback: 0, // cashbackValue será implementado em versão futura
        taxaEntrega: 0, // taxaEntregaValue será implementado em versão futura
        cupomFiscal: {
          numero: nfceData.numero_nfce || 'N/A',
          chave: nfceData.chave_nfe || 'N/A',
          protocolo: nfceData.protocolo_autorizacao || 'N/A',
          dataAutorizacao: nfceData.data_autorizacao || new Date().toISOString(),
          serie: nfceData.serie || 1
        }
      };

      console.log('🧾 Dados do cupom fiscal para Dominio Printer:', dominioPrintData);

      // DEBUG: Verificar valor da largura antes da formatação
      console.log('🔍 DEBUG - Largura atual no momento da impressão:', paperWidth);
      console.log('🔍 DEBUG - Tipo da largura:', typeof paperWidth);
      console.log('🔍 DEBUG - Valor é válido?', paperWidth > 0);
      
      // Gerar cupom fiscal formatado com ESC/POS usando largura configurada
      const formattedCupom = generateCupomFiscalESCPOS(dominioPrintData);
      
      // DEBUG: Verificar se a formatação foi aplicada
      console.log('🔍 DEBUG - Cupom formatado (primeiras 200 chars):', formattedCupom.substring(0, 200));
      console.log('🔍 DEBUG - Procurar por separadores no cupom:', formattedCupom.includes('='.repeat(paperWidth)));
      
      // DEBUG: Teste forçado com larguras diferentes
      const testSeparator32 = '='.repeat(32);
      const testSeparator80 = '='.repeat(80);
      console.log('🔍 DEBUG - Cupom contém separador 32 chars?', formattedCupom.includes(testSeparator32));
      console.log('🔍 DEBUG - Cupom contém separador 80 chars?', formattedCupom.includes(testSeparator80));
      console.log('🔍 DEBUG - Cupom contém separador atual (' + paperWidth + ' chars)?', formattedCupom.includes('='.repeat(paperWidth)));
      
      // Buscar nome da impressora configurada
      const printerName = printerConfig?.dominio_printer_name || 'MP-4200 TH';
      
      console.log('🖨️ Enviando cupom fiscal formatado para impressora:', printerName);
      console.log('📏 Largura configurada:', paperWidth, 'caracteres');

      // Enviar para API do Dominio Printer v2.2.1 com rawMode
      const response = await fetch('http://localhost:3001/api/printer/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerName: printerName,
          text: formattedCupom,
          rawMode: true  // v2.2.1 - Impressão sem alterações, controle total pelo app
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Cupom fiscal impresso com sucesso!');
        return true;
      } else {
        throw new Error(result.error || 'Erro ao imprimir cupom fiscal');
      }

    } catch (error: any) {
      console.error('💥 Erro ao imprimir cupom fiscal:', error);
      toast.error(`Erro ao imprimir cupom fiscal: ${error.message}`);
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  const printPedido = async (pedido: Pedido) => {
    console.log('🚀 INÍCIO - printPedido chamado');
    console.log('📋 Pedido recebido:', pedido);
    console.log('🏢 Company ID usado:', pedido.company_id);
    
    try {
      setIsPrinting(true);
      console.log('🖨️ Iniciando impressão do pedido:', pedido.id);

      // Buscar informações da empresa
      console.log('🏢 Buscando informações da empresa...');
      const { data: companyInfo, error: companyError } = await supabase
        .from('company_info')
        .select('nome_estabelecimento, endereco, contato')
        .eq('company_id', pedido.company_id)
        .maybeSingle();

      console.log('🏢 Company info encontrada:', companyInfo);
      if (companyError) {
        console.error('❌ Erro ao buscar informações da empresa:', companyError);
        console.log('🔍 Tentando buscar sem filtro para debug...');
        
        // Debug: verificar se a empresa existe
        const { data: allCompanies } = await supabase
          .from('company_info')
          .select('company_id, nome_estabelecimento')
          .limit(5);
        console.log('🏢 Empresas encontradas no banco:', allCompanies);
      }

      // Buscar configurações da impressora
      console.log('🖨️ Buscando configurações da impressora...');
      const { data: printerConfig, error: printerError } = await supabase
        .from('company_settings')
        .select('printnode_enabled, printnode_default_printer_id, printnode_child_account_id, printnode_child_email')
        .eq('company_id', pedido.company_id)
        .maybeSingle();

      console.log('🖨️ Printer config encontrada:', printerConfig);
      
      if (printerError) {
        console.error('❌ Erro ao buscar configurações da impressora:', printerError);
        console.log('🔍 Debug: tentando buscar todas as configurações...');
        
        // Debug: verificar se existem configurações
        const { data: allSettings } = await supabase
          .from('company_settings')
          .select('company_id, dominio_printer_name, printer_type')
          .limit(5);
        console.log('🖨️ Configurações encontradas no banco:', allSettings);
        
        toast.error('Erro ao buscar configurações da impressora. Configure a impressora primeiro.');
        return false;
      }
      
      // Verificar se há configuração válida
      if (!printerConfig) {
        console.error('❌ Nenhuma configuração de impressora encontrada');
        toast.error('Nenhuma configuração de impressora encontrada. Configure a impressora em Configurações > Impressora.');
        return false;
      }
      
      if (!printerConfig?.printnode_default_printer_id) {
        console.error('❌ PrintNode sem impressora padrão definida');
        toast.error('Defina uma impressora padrão na integração PrintNode.');
        return false;
      }

      // Mesmo com a flag desabilitada, se houver impressora padrão vamos prosseguir
      if (printerConfig.printnode_enabled === false) {
        console.warn('⚠️ PrintNode marcado como desabilitado, mas há impressora padrão. Prosseguindo com impressão.');
      }

      // Buscar dados completos da empresa
      const { data: empresaInfo } = await supabase
        .from('company_info')
        .select('*')
        .eq('company_id', companyId)
        .single();

      // Buscar endereço da empresa
      const { data: empresaEndereco } = await supabase
        .from('company_addresses')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_principal', true)
        .single();

      console.log('🏢 Dados da empresa:', empresaInfo);
      console.log('📍 Endereço da empresa:', empresaEndereco);

      // Buscar itens do pedido com adicionais
      const { data: itens, error: itensError } = await supabase
        .from('pedido_itens')
        .select(`
          id,
          nome_produto, 
          quantidade, 
          valor_unitario, 
          valor_total,
          observacoes,
          pedido_item_adicionais(
            nome_adicional,
            categoria_nome,
            quantidade,
            valor_unitario
          )
        `)
        .eq('pedido_id', pedido.id);

      console.log('📋 Itens encontrados:', itens);
      
      if (itensError) {
        console.error('Erro ao buscar itens do pedido:', itensError);
        toast.error('Erro ao buscar itens do pedido');
        return false;
      }

      // Separar itens especiais (cashback, taxa de entrega) dos itens normais
      const itensNormais = itens?.filter(item => 
        item.nome_produto !== 'Desconto Cashback' && 
        item.nome_produto !== 'Taxa de Entrega'
      ) || [];
      
      const cashbackItem = itens?.find(item => item.nome_produto === 'Desconto Cashback');
      const taxaEntregaItem = itens?.find(item => item.nome_produto === 'Taxa de Entrega');
      
      // Valores de cashback e taxa de entrega (converter negativo para positivo para cashback)
      const cashbackValue = cashbackItem ? Math.abs(cashbackItem.valor_unitario) : 0;
      const taxaEntregaValue = taxaEntregaItem ? taxaEntregaItem.valor_unitario : 0;

      // Preparar dados no formato da API do Dominio Printer
      const printData = {
        empresa: {
          nome: companyInfo?.nome_estabelecimento || 'ESTABELECIMENTO',
          endereco: companyInfo?.endereco || '',
          telefone: companyInfo?.contato || ''
        },
        numeroPedido: pedido.numero_pedido || pedido.id.toString(),
        dataHora: new Date().toLocaleString('pt-BR'),
        cliente: pedido.nome ? {
          nome: pedido.nome,
          telefone: pedido.telefone || '',
          endereco: pedido.endereco || ''
        } : undefined,
        items: itensNormais?.map(item => {
          // Calcular valor base do item
          const valorBaseItem = item.quantidade * item.valor_unitario;
          
          // Calcular total dos adicionais
          const valorAdicionais = item.pedido_item_adicionais?.reduce((acc, adicional) => {
            return acc + (adicional.quantidade * adicional.valor_unitario);
          }, 0) || 0;
          
          // Subtotal correto = valor base + adicionais
          const subtotalCorreto = valorBaseItem + valorAdicionais;
          
          return {
            name: item.nome_produto,
            quantity: item.quantidade,
            price: item.valor_unitario,
            subtotal: subtotalCorreto,
            observacoes: item.observacoes || undefined,
            adicionais: item.pedido_item_adicionais?.length > 0 ? 
              item.pedido_item_adicionais.map(adicional => ({
                name: adicional.nome_adicional,
                quantity: adicional.quantidade,
                price: adicional.valor_unitario
              })) : undefined
          };
        }) || [],
        total: pedido.total || 0,
        pagamento: pedido.pagamento || 'Não informado'
      };

      console.log('📦 Dados preparados para API Dominio Printer:', printData);


      // Formatar texto do pedido para impressão
      const empresaNome = empresaInfo?.nome_estabelecimento || printData.empresa.nome;
      const empresaEnderecoPrincipal = empresaEndereco ? 
        `${empresaEndereco.logradouro}, ${empresaEndereco.numero}${empresaEndereco.complemento ? `, ${empresaEndereco.complemento}` : ''}\n${empresaEndereco.bairro} - ${empresaEndereco.cidade}/${empresaEndereco.estado}\nCEP: ${empresaEndereco.cep || 'N/A'}` :
        printData.empresa.endereco;
      const empresaTelefone = empresaInfo?.contato || printData.empresa.telefone;

      const pedidoFormatado = `
========================================
           ${empresaNome}
========================================
${empresaEnderecoPrincipal}
Tel: ${empresaTelefone}
${empresaInfo?.cnpj_cpf ? `CNPJ: ${empresaInfo.cnpj_cpf}` : ''}

PEDIDO #${printData.numeroPedido}
Data/Hora: ${printData.dataHora}
${printData.cliente ? `Cliente: ${printData.cliente.nome}` : ''}
${printData.cliente?.telefone ? `Tel: ${printData.cliente.telefone}` : ''}
${printData.cliente?.endereco ? `End: ${printData.cliente.endereco}` : ''}

----------------------------------------
ITENS:
----------------------------------------
${printData.items.map(item => {
  let itemText = `${item.quantity}x ${item.name} - R$ ${item.price.toFixed(2)}`;
  if (item.observacoes) {
    itemText += `\n   Obs: ${item.observacoes}`;
  }
  if (item.adicionais && item.adicionais.length > 0) {
    itemText += '\n   Adicionais:';
    item.adicionais.forEach(adicional => {
      itemText += `\n   + ${adicional.quantity}x ${adicional.name} - R$ ${adicional.price.toFixed(2)}`;
    });
  }
  itemText += `\n   Subtotal: R$ ${item.subtotal.toFixed(2)}\n`;
  return itemText;
}).join('')}
----------------------------------------
TOTAL: R$ ${printData.total.toFixed(2)}
Pagamento: ${printData.pagamento}
----------------------------------------

Obrigado pela preferencia!
========================================

\x1B\x6D
      `.trim();

      
// DEBUG: Verificar valor da largura antes da formatação
console.log('🔍 DEBUG - Largura atual no momento da impressão (printPedido):', paperWidth);
console.log('🔍 DEBUG - Tipo da largura:', typeof paperWidth);
      
// Usar nossa formatação ESC/POS com largura configurada
const dadosParaFormatacao = {
  empresa: {
    nome: companyInfo?.nome_estabelecimento || 'ESTABELECIMENTO',
    endereco: companyInfo?.endereco || '',
    telefone: companyInfo?.contato || ''
  },
  numeroPedido: `${pedido.numero_pedido || pedido.id}`,
  dataHora: new Date().toLocaleString('pt-BR'),
  title: 'PEDIDO',
  tipo: 'PEDIDO',
  cliente: pedido.nome ? {
    nome: pedido.nome,
    telefone: pedido.telefone || '',
    endereco: pedido.endereco || ''
  } : {
    nome: 'Consumidor Final',
    telefone: '',
    endereco: ''
  },
  items: itensNormais?.map(item => {
    const adicionais = item.pedido_item_adicionais?.map((ad: any) => ({
      name: ad.nome_adicional,
      quantity: ad.quantidade,
      price: ad.valor_unitario,
    })) || [];
    const subtotalBase = item.quantidade * item.valor_unitario;
    const subtotalAdicionais = adicionais.reduce((acc: number, a: any) => acc + (a.quantity * a.price), 0);
    return {
      name: item.nome_produto,
      quantity: item.quantidade,
      price: item.valor_unitario,
      subtotal: subtotalBase + subtotalAdicionais,
      observacoes: item.observacoes || undefined,
      adicionais,
    };
  }) || [],
  total: pedido.total || 0,
  pagamento: pedido.pagamento || 'Não informado',
  cashback: cashbackValue,
  taxaEntrega: taxaEntregaValue
};

      // Gerar formatação ESC/POS com largura configurada (template unificado)
      const pedidoFormatadoESCPOS = formatPedidoESCPOS(dadosParaFormatacao as PedidoTemplateData, paperWidth, {
        removeAccents: true,
        highlightOrder: true,
      });
      
      console.log('🔍 DEBUG - Pedido formatado com ESC/POS (primeiras 200 chars):', pedidoFormatadoESCPOS.substring(0, 200));
      console.log('🔍 DEBUG - Contém separador de', paperWidth, 'chars?', pedidoFormatadoESCPOS.includes('='.repeat(paperWidth)));
      
      // Impressão direta via printnode-proxy (consistente com templates locais)
      const { data: pnSettings, error: pnSettingsErr } = await supabase
        .from('company_settings')
        .select('printnode_default_printer_id, printnode_child_account_id, printnode_child_email')
        .eq('company_id', pedido.company_id)
        .maybeSingle();
      if (pnSettingsErr || !pnSettings?.printnode_default_printer_id) {
        throw new Error('PrintNode não configurado (defina a impressora padrão em Configurações)');
      }

      const utf8 = new TextEncoder().encode(pedidoFormatadoESCPOS);
      let binary = '';
      utf8.forEach((b) => (binary += String.fromCharCode(b)));
      const contentBase64 = btoa(binary);

      const { error: pnErr } = await supabase.functions.invoke('printnode-proxy', {
        body: {
          action: 'print',
          printerId: Number(pnSettings.printnode_default_printer_id),
          title: `Pedido #${pedido.numero_pedido || pedido.id}`,
          contentType: 'raw_base64',
          content: contentBase64,
          source: 'Dominio POS',
          childAccountId: pnSettings.printnode_child_account_id || undefined,
          childAccountEmail: pnSettings.printnode_child_email || undefined,
        },
      });
      if (pnErr) throw pnErr;

      toast.success('Pedido impresso via PrintNode!');
      return true;

    } catch (error: any) {
      console.error('❌ Erro durante a impressão:', error);
      toast.error('Erro de conexão com a impressora. Verifique a integração PrintNode.');
      return false;
    } finally {
      setIsPrinting(false);
    }
  };

  return {
    isPrinting,
    printPedido,
    printCupomFiscal
  };
};