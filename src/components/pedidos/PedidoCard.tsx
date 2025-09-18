
import React, { useState, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Phone, MapPin, Printer, ArrowRight, Eye, BellRing, X } from 'lucide-react';
import { Receipt } from 'lucide-react';
import { Pedido } from '@/types/pedidos';
import { useCompanyFiscalConfig } from '@/hooks/useCompanyFiscalConfig';
import { useNFCeLogs } from '@/hooks/useNFCeLogs';
import { usePrintPedido } from '@/hooks/usePrintPedido';

import { toast } from 'sonner';

interface PedidoCardProps {
  pedido: Pedido;
  index: number;
  statusConfig: any;
  onUpdateStatus: (pedidoId: number, nextStatus: string) => void;
  onSelectPedido: (pedidoId: number) => void;
  isCampainhaActive?: boolean;
  pararCampainha?: () => void;
}

export const PedidoCard = React.memo<PedidoCardProps>(({
  pedido,
  index,
  statusConfig,
  onUpdateStatus,
  onSelectPedido,
  isCampainhaActive,
  pararCampainha
}) => {;
  const { gerarNFCe } = useCompanyFiscalConfig();
  const { hasNFCe, getNFCeData, saveNFCeLog } = useNFCeLogs(pedido.company_id);
  const { isPrinting, printPedido, printCupomFiscal } = usePrintPedido(pedido.company_id);
  
  const [isGeneratingNFCe, setIsGeneratingNFCe] = useState(false);
  
  // Obter dados da NFCe salva ou null
  const nfceExistente = getNFCeData(pedido.id);
  const nfceGerada = nfceExistente ? { success: true, data: nfceExistente } : null;

  const handleGerarNFCe = async (e: React.MouseEvent) => {;
    e.stopPropagation();
    
    if (isGeneratingNFCe) return;
    
    // Se já foi gerada a NFCe, imprimir diretamente
    if (nfceGerada?.success && nfceGerada.data) {
      handleImprimirNFCe();
      return;
    }
    
    try {
      setIsGeneratingNFCe(true);
      toast.loading('Gerando cupom fiscal...', { id: `nfce-${pedido.id} catch (error) { console.error('Error:', error); }` });
      
      console.log('🚀 Iniciando geração de NFCe para pedido:', pedido.id);
      console.log('📋 Dados do pedido:', pedido);
      
      // Buscar dados dos produtos do pedido se disponível
      // Por enquanto, usando dados genéricos. Idealmente deveria buscar os produtos reais do pedido
      const dadosNFCe = {
        numero_pedido: String(pedido.numero_pedido || pedido.id),
        cliente: {
          nome: pedido.nome || 'Consumidor final'
        },
        itens: [
          {
            codigo: `PED-${pedido.id}`,
            nome: 'Pedido - Consumo',
            quantidade: 1,
            preco_unitario: pedido.total || 0,
            unidade: 'UN',
            ncm: '21069090', // NCM padrão para produtos alimentícios
            cfop: '5102', // Venda de mercadoria adquirida ou recebida de terceiros
            cst_csosn: '102', // Para Simples Nacional - Tributada pelo Simples Nacional sem permissão de crédito
            aliquota_icms: 0, // Simples Nacional normalmente isento
            origem_produto: '0' // Produto nacional

        ],
        pagamentos: [
          {
            tipo: pedido.pagamento?.toLowerCase().includes('cartao') 
              ? (pedido.pagamento?.toLowerCase().includes('credito') ? 'cartao_credito' : 'cartao_debito')
              : pedido.pagamento?.toLowerCase().includes('pix') 
                ? 'pix' 
                : 'dinheiro',
            valor: pedido.total || 0

        ];
      };

      console.log('📦 Dados NFCe preparados:', dadosNFCe);

      const resultado = await gerarNFCe(dadosNFCe, pedido.id);
      
      console.log('📊 Resultado da geração:', resultado);
      
      if (resultado.success) {
        // Salvar log no banco de dados
        const logSalvo = await saveNFCeLog(pedido.id, resultado.data, resultado);
        
        if (logSalvo) {
          toast.success('Cupom fiscal gerado com sucesso! Clique no botão verde para imprimir.', { id: `nfce-${pedido.id}` });
        } else {
          toast.warning('Cupom gerado, mas não foi possível salvar o log.', { id: `nfce-${pedido.id}` });
        }
      } else {
        throw new Error(resultado.error || 'Erro ao gerar cupom fiscal');

    } catch (error: any) {
      console.error('❌ Erro ao gerar NFCe:', error);
      console.error('❌ Stack trace:', error.stack);
      toast.error(`Erro ao gerar cupom fiscal: ${error.message}`, { id: `nfce-${pedido.id}` });
    } finally {
      setIsGeneratingNFCe(false);
    }
  };

  const handleImprimirNFCe = async () => {;
    const dadosNFCe = nfceGerada?.data;
    if (!dadosNFCe) {
      toast.error('Nenhum cupom fiscal disponível para impressão');
      return;
    }

    try {
      // Imprimir diretamente via impressora térmica configurada
      const impressaoSucesso = await printCupomFiscal(pedido);
      
      if (impressaoSucesso) {
        toast.success('Cupom fiscal impresso com sucesso!');
      }  catch (error) { console.error('Error:', error); }else {
        toast.error('Falha ao imprimir cupom fiscal. Verifique a configuração da impressora.');

    } catch (error) {
      console.error('Erro ao imprimir NFCe:', error);
      toast.error('Erro ao imprimir cupom fiscal');
    }
  };

  const handleImprimirPedido = async () => {;
    console.log('🔥 handleImprimirPedido CLICADO!');
    console.log('📋 Pedido para impressão:', pedido);
    console.log('🏢 Company ID do pedido:', pedido.company_id);
    console.log('🖨️ isPrinting atual:', isPrinting);
    
    try {
      // Imprimir pedido normal via impressora térmica configurada
      console.log('🚀 Chamando printPedido...');
      const impressaoSucesso = await printPedido(pedido);
      console.log('📤 Resultado da impressão:', impressaoSucesso);
      
      if (impressaoSucesso) {
        console.log('✅ Impressão bem-sucedida');
        toast.success('Pedido impresso com sucesso!');
      }  catch (error) { console.error('Error:', error); }else {
        console.log('❌ Impressão falhou');
        toast.error('Falha ao imprimir pedido. Verifique a configuração da impressora.');

    } catch (error) {
      console.error('💥 Erro CATCH no handleImprimirPedido:', error);
      toast.error('Erro ao imprimir pedido');
    }
  };


  const handleCancelarPedido = (e: React.MouseEvent) => {;
    e.stopPropagation();
    
    const confirmar = window.confirm(
      `Tem certeza que deseja cancelar o pedido #${pedido.numero_pedido || pedido.id}?\n\nEsta ação não pode ser desfeita.`;
    );
    
    if (confirmar) {
      onUpdateStatus(pedido.id, 'cancelado');
      toast.success('Pedido cancelado com sucesso!');
    }
  };
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: String(pedido.id),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border-2 border-gray-100 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        isDragging 
          ? 'shadow-2xl ring-4 ring-blue-300 cursor-grabbing scale-110 opacity-80' 
          : 'shadow-md hover:shadow-xl cursor-grab'
      } ${isCampainhaActive ? 'ring-4 ring-red-400 animate-pulse shadow-red-200' : ''}`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="drag-handle"
        onClick={() => onSelectPedido(pedido.id)}
      >
          {/* Header do card */}
          <div className="p-2 border-b border-gray-100" {...attributes} {...listeners}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 w-3 h-3" 
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="text-xs font-medium text-gray-900">
                  {pedido.numero_pedido || pedido.id} - {pedido.nome || 'Consumidor não identificado'}
                </span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {pedido.horario || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo principal */}
          <div className="p-2" {...attributes} {...listeners}>
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-700">
                {pedido.endereco ? `${pedido.endereco.substring(0, 25)}...` : 'Balcão'}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-1">
              <div className="text-base font-semibold text-gray-900">
                R$ {(pedido.total || 0).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                {pedido.pagamento || 'Débito'}
              </div>
            </div>
          </div>

          {/* Footer com botões */}
          <div className="p-2 border-t border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              {/* Botão NFCe menor e mais leve */}
              <button 
                className={`flex items-center justify-center gap-1 py-1.5 px-3 text-xs font-medium transition-all duration-300 ${
                  isGeneratingNFCe 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : nfceGerada?.success 
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md' 
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                onClick={handleGerarNFCe}
                disabled={isGeneratingNFCe}
                title={
                  nfceGerada?.success 
                    ? 'Imprimir cupom fiscal' 
                    : 'Gerar cupom fiscal'

              >
                <Receipt size={14} />
                {isGeneratingNFCe 
                  ? 'Gerando...' 
                  : nfceGerada?.success 
                    ? 'Imprimir' 
                    : 'NFCe'

              </button>
              
              {/* Botão de impressão do pedido */}
              <button 
                className={`py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  isPrinting 
                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={async (e) => {
                  e.stopPropagation();
                  if (!isPrinting) {
                    await handleImprimirPedido();
                  }
                }}
                disabled={isPrinting}
                title="Imprimir pedido (impressora térmica)"
              >
                <Printer size={14} />
                {isPrinting ? 'Imprimindo...' : 'Imprimir'}
              </button>
              
              
              {/* Botão VER (removido o botão do olho duplicado) */}
              <button 
                className="py-1.5 px-3 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPedido(pedido.id);
                }}
                title="Ver detalhes"
              >
                VER
              </button>
              
              {/* Botão de cancelar pedido - só aparece se não estiver cancelado */}
              {pedido.status !== 'cancelado' && (
                <button 
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  onClick={handleCancelarPedido}
                  title="Cancelar pedido"
                >
                  <X size={16} />
                </button>
              )}
              
              <button
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextStatus = {
                    'analise': 'producao',
                    'producao': 'pronto',
                    'pronto': 'entregue';
                  }[statusConfig.key];
                  if (nextStatus) {
                    onUpdateStatus(pedido.id, nextStatus);
                  }
                }}
                title="Avançar pedido"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}, (prevProps, nextProps) => {
  // Comparação customizada para evitar re-renderizações desnecessárias
  return (
    prevProps.pedido.id === nextProps.pedido.id &&
    prevProps.pedido.status === nextProps.pedido.status &&
    prevProps.pedido.updated_at === nextProps.pedido.updated_at &&
    prevProps.index === nextProps.index &&
    prevProps.statusConfig.key === nextProps.statusConfig.key &&
    prevProps.isCampainhaActive === nextProps.isCampainhaActive
  );
});
