import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Pedido } from '@/types/pedidos';
import { useQZTray } from '@/contexts/QZTrayContext';
import { formatPedidoESCPOS, PedidoTemplateData } from '@/utils/printTemplates';

// Declaração global para QZ Tray
declare global {
  interface Window {
    qz: any;
  }
}

export const useQZTrayPrint = () => {
  const [isPrinting, setIsPrinting] = useState(false);
  
  // Usar contexto global do QZ Tray
  const {
    isConnected,
    connectToQZ,
    getPrinters,
    printData
  } = useQZTray();

  // As funções de conexão e obtenção de impressoras agora vêm do contexto global
  // Não precisamos mais gerenciar conexão localmente

  // Formatar pedido para impressão
  const formatPedidoForPrint = useCallback((pedido: Pedido) => {
    const data: PedidoTemplateData = {
      empresa: {
        nome: '',
        endereco: '',
        telefone: ''
      },
      numeroPedido: String(pedido.numero_pedido || pedido.id),
      dataHora: new Date(pedido.created_at || new Date()).toLocaleString('pt-BR'),
      title: 'PEDIDO',
      tipo: 'PEDIDO',
      cliente: {
        nome: pedido.nome || 'Consumidor Final',
        telefone: pedido.telefone || '',
        endereco: pedido.endereco_entrega || ''
      },
      items: (pedido.itens || []).map((item: any) => ({
        name: item.produto?.nome || item.nome,
        quantity: item.quantidade || 1,
        price: parseFloat(item.preco || item.produto?.preco || 0),
        subtotal: (item.quantidade || 1) * parseFloat(item.preco || item.produto?.preco || 0),
        observacoes: item.observacoes,
        adicionais: (item.adicionais || []).map((a: any) => ({
          name: a.nome,
          quantity: a.quantidade || 1,
          price: parseFloat(a.preco || 0)
        }))
      })),
      total: (pedido.itens || []).reduce((acc: number, it: any) => {
        const q = it.quantidade || 1;
        const p = parseFloat(it.preco || it.produto?.preco || 0);
        let sub = q * p;
        if (Array.isArray(it.adicionais)) {
          sub += it.adicionais.reduce((s: number, a: any) => s + (parseFloat(a.preco || 0) * q), 0);
        }
        return acc + sub;
      }, 0),
      pagamento: pedido.pagamento || undefined
    };
    return formatPedidoESCPOS(data);
  }, []);

  // Imprimir pedido usando contexto global
  const printPedido = useCallback(async (pedido: Pedido, printerName?: string) => {
    try {
      setIsPrinting(true);
      
      // Obter impressora
      let targetPrinter = printerName;
      if (!targetPrinter) {
        // Tentar usar impressora salva nas configurações
        const savedPrinter = localStorage.getItem('qz-selected-printer');
        if (savedPrinter) {
          targetPrinter = savedPrinter;
        } else {
          // Usar primeira impressora disponível
          const printers = await getPrinters();
          if (printers.length === 0) {
            throw new Error('Nenhuma impressora encontrada');
          }
          targetPrinter = printers[0];
        }
      }
      
      // Formatar dados para impressão
      const printDataFormatted = formatPedidoForPrint(pedido);
      
      // Enviar para impressão usando contexto global
      const success = await printData(targetPrinter, [{
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: printDataFormatted,
        options: { language: 'ESCPOS' }
      }]);
      
      if (success) {
        toast.success(`Pedido #${pedido.numero_pedido || pedido.id} enviado para impressão!`);
      }
      
      return success;
      
    } catch (error: any) {
      console.error('Erro ao imprimir pedido:', error);
      toast.error(`Erro ao imprimir: ${error.message}`);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [getPrinters, printData, formatPedidoForPrint]);

  // Imprimir cupom fiscal via QZ Tray usando contexto global
  const printCupomFiscal = useCallback(async (cupomData: any, printerName?: string) => {
    try {
      setIsPrinting(true);
      
      // Obter impressora
      let targetPrinter = printerName;
      if (!targetPrinter) {
        const savedPrinter = localStorage.getItem('qz-selected-printer');
        if (savedPrinter) {
          targetPrinter = savedPrinter;
        } else {
          const printers = await getPrinters();
          if (printers.length === 0) {
            throw new Error('Nenhuma impressora encontrada');
          }
          targetPrinter = printers[0];
        }
      }
      
      // Formatar cupom fiscal (simplificado)
      const lines = [];
      lines.push('\x1B\x40'); // Reset
      lines.push('\x1B\x61\x01'); // Centralizar
      lines.push('CUPOM FISCAL');
      lines.push('\x1B\x61\x00'); // Alinhar à esquerda
      lines.push('================================');
      
      if (cupomData.chave) {
        lines.push(`Chave: ${cupomData.chave}`);
      }
      if (cupomData.numero) {
        lines.push(`Número: ${cupomData.numero}`);
      }
      if (cupomData.serie) {
        lines.push(`Série: ${cupomData.serie}`);
      }
      
      lines.push('================================');
      lines.push('');
      lines.push('');
      lines.push('\x1D\x56\x42\x00'); // Cortar papel
      
      const printDataFormatted = lines.join('\n');
      
      // Enviar para impressão usando contexto global
      const success = await printData(targetPrinter, [{
        type: 'raw',
        format: 'command',
        flavor: 'plain',
        data: printDataFormatted,
        options: { language: 'ESCPOS' }
      }]);
      
      if (success) {
        toast.success('Cupom fiscal enviado para impressão!');
      }
      
      return success;
      
    } catch (error: any) {
      console.error('Erro ao imprimir cupom fiscal:', error);
      toast.error(`Erro ao imprimir cupom: ${error.message}`);
      return false;
    } finally {
      setIsPrinting(false);
    }
  }, [getPrinters, printData]);

  return {
    isPrinting,
    isConnected,
    connectToQZ,
    getPrinters,
    printPedido,
    printCupomFiscal
  };
};