export interface PrintableCompany {
  nome?: string;
  endereco?: string;
  telefone?: string;
}

export interface PrintableAdicional {
  name: string;
  quantity: number;
  price: number;
}

export interface PrintableItem {
  name: string;
  quantity: number;
  price?: number;
  subtotal?: number;
  observacoes?: string;
  adicionais?: PrintableAdicional[];
}

export interface PrintableCustomer {
  nome?: string;
  telefone?: string;
  endereco?: string | null;
}

export interface PedidoTemplateData {
  empresa: PrintableCompany;
  numeroPedido: string;
  dataHora: string;
  title?: string; // Ex.: 'PEDIDO' ou 'CUPOM FISCAL - NFCe'
  tipo?: string; // Ex.: 'PEDIDO'
  cliente?: PrintableCustomer;
  items: PrintableItem[];
  total: number;
  pagamento?: string;
  cashback?: number; // Valor do cashback aplicado
  taxaEntrega?: number; // Valor da taxa de entrega
  cupomFiscal?: {
    numero?: string;
    chave?: string;
    protocolo?: string;
    dataAutorizacao?: string;
    serie?: number | string;
  };
}

// Gera comandos ESC/POS consistentes para pedidos e cupons
export function formatPedidoESCPOS(
  data: PedidoTemplateData,
  paperWidth: number = 48,
  options: { removeAccents?: boolean; highlightOrder?: boolean } = {}
): string {
  const { removeAccents = true, highlightOrder = true } = options;
  // Usar exatamente a largura configurada para evitar quebras
  const sep = '='.repeat(paperWidth)
  const thin = '-'.repeat(paperWidth)

  const truncateText = (text: string, maxLen: number) => {
    if (maxLen <= 0) return '';
    if (!text) return '';
    if (text.length <= maxLen) return text;
    if (maxLen <= 3) return text.slice(0, maxLen)
    return text.slice(0, maxLen - 3) + '...';
  };

  const lineLeftRight = (left: string, right: string) => {
    const max = paperWidth;
    const cleanRight = right || '';
    const maxLeft = Math.max(0, max - cleanRight.length) // permitir 0 espaço quando encaixa perfeito
    const leftTrunc = truncateText(left || '', maxLeft)
    const spaces = Math.max(0, max - (leftTrunc.length + cleanRight.length))
    return leftTrunc + ' '.repeat(spaces) + cleanRight;
  };

  let commands = '';

  // Reset e config inicial
  commands += '\x1B\x40'; // ESC @ - Reset
  commands += '\x1B\x4D\x00'; // Fonte A

  // Cabeçalho da empresa
  commands += '\x1B\x61\x01'; // Center
  commands += '\x1B\x21\x30'; // Double size
  commands += (data.empresa?.nome || 'ESTABELECIMENTO') + '\n';
  commands += '\x1B\x21\x00'; // Normal size
  if (data.empresa?.endereco) commands += data.empresa.endereco + '\n';
  if (data.empresa?.telefone) commands += 'Tel: ' + data.empresa.telefone + '\n';
  commands += '\x1B\x61\x00'; // Left
  commands += '\n';

  // Título e destaque do número do pedido
  commands += sep.slice(0, paperWidth)
  commands += '\x1B\x61\x01';
  if (highlightOrder && (data.tipo === 'PEDIDO' || (data.title || '').toUpperCase().includes('PEDIDO'))) {
    commands += 'PEDIDO\n';
    commands += '\x1B\x21\x30'; // Double size
    commands += `#${data.numeroPedido}\n`;
    commands += '\x1B\x21\x00';
  } else {
    commands += (data.title || 'PEDIDO') + '\n';
  }
  commands += '\x1B\x61\x00';
  commands += sep.slice(0, paperWidth)

  // Info do pedido
  commands += `Pedido: ${data.numeroPedido}\n`;
  commands += `Data: ${data.dataHora}\n`;
  if (data.cliente?.nome && data.cliente.nome !== 'Consumidor Final') {
    commands += `Cliente: ${data.cliente.nome}\n`;
    if (data.cliente.telefone) commands += `Tel: ${data.cliente.telefone}\n`;
    if (data.cliente.endereco) commands += `End: ${data.cliente.endereco}\n`;
  }
  commands += '\n';

  // Itens
  commands += sep.slice(0, paperWidth)
  commands += 'ITENS:\n';
  commands += thin.slice(0, paperWidth)

  let total = 0;
  for (const item of data.items || []) {
    const base = item.subtotal ?? ((item.quantity || 0) * (item.price || 0))
    total += base;
    const left = `${item.quantity}x ${item.name}`;
    const right = `R$ ${base.toFixed(2).replace('.', ',')}`;
    commands += lineLeftRight(left, right) + '\n';
    if (item.observacoes) commands += `  Obs: ${item.observacoes}\n`;
    if (item.adicionais?.length) {
      for (const add of item.adicionais) {
        commands += `  + ${add.quantity}x ${add.name}\n`;
        total += (add.quantity || 0) * (add.price || 0)
      }
    }
    commands += '\n';
  }

  // Subtotal, cashback, taxa de entrega e total
  commands += sep.slice(0, paperWidth)
  
  // Se houver cashback ou taxa de entrega, mostrar subtotal primeiro
  if (data.cashback || data.taxaEntrega) {
    const subtotal = total;
    commands += lineLeftRight('Subtotal:', `R$ ${subtotal.toFixed(2).replace('.', ',')}`) + '\n';
    
    // Mostrar taxa de entrega se houver
    if (data.taxaEntrega && data.taxaEntrega > 0) {
      commands += lineLeftRight('Taxa de Entrega:', `R$ ${data.taxaEntrega.toFixed(2).replace('.', ',')}`) + '\n';
    }
    
    // Mostrar cashback aplicado se houver
    if (data.cashback && data.cashback > 0) {
      commands += lineLeftRight('Desconto Cashback:', `- R$ ${data.cashback.toFixed(2).replace('.', ',')}`) + '\n';
    }
    
    commands += thin + '\n';
  }
  
  const finalTotal = data.total || total;
  // Negrito simples para total (evitar largura dupla que quebra em 58mm)
  commands += '\x1B\x45\x01'; // Bold on
  commands += lineLeftRight('TOTAL:', `R$ ${finalTotal.toFixed(2).replace('.', ',')}`) + '\n';
  commands += '\x1B\x45\x00'; // Bold off

  if (data.pagamento) {
    commands += `Pagamento: ${data.pagamento}\n`;
  }

  // Dados fiscais opcionais
  if (data.cupomFiscal) {
    commands += '\n' + '='.repeat(paperWidth) + '\n';
    commands += '\x1B\x61\x01';
    commands += 'DADOS FISCAIS\n';
    commands += '\x1B\x61\x00';
    commands += thin + '\n';
    if (data.cupomFiscal.numero) commands += `NFCe: ${data.cupomFiscal.numero}\n`;
    if (data.cupomFiscal.serie) commands += `Série: ${data.cupomFiscal.serie}\n`;
    if (data.cupomFiscal.chave) commands += `Chave: ${data.cupomFiscal.chave}\n`;
    if (data.cupomFiscal.protocolo) commands += `Protocolo: ${data.cupomFiscal.protocolo}\n`;
  }

  // Rodapé
  commands += '\n' + sep + '\n';
  commands += '\x1B\x61\x01';
  commands += 'Obrigado pela preferência!\n';
  commands += '\x1B\x61\x00';

  // Corte
  commands += '\n\n\n';
  commands += '\x1D\x56\x41\x10'; // Partial cut

  if (!removeAccents) return commands;
  // Remover acentos para maior compatibilidade ESC/POS
  try {
    return commands.normalize('NFD').replace(/\p{Diacritic} catch (error) { console.error('Error:', error) }+/gu, '')
  } catch {
    return commands;
  }
}


