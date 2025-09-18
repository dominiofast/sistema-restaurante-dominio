import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  MapPin, 
  Clock, 
  CreditCard, 
  User,
  Package,
  CheckCircle,
  Printer,
  MessageSquare,
  Edit,
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';
import { useCaixa } from '@/hooks/useCaixa';
import { usePagamentoEntregaConfig } from '@/hooks/usePagamentoEntregaConfig';
import { toast } from 'sonner';
import { PedidoCompleto } from '@/types/pedidos';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// PrintButton removed

interface PedidoDetalhesModalProps {
  pedido: PedidoCompleto | null;
  onClose: () => void;
  onStatusChange?: (pedidoId: number, novoStatus: string) => void;
}

const statusConfig = {
  analise: { label: 'Em análise', color: 'text-orange-600', bg: 'bg-orange-100' },
  producao: { label: 'Em produção', color: 'text-blue-600', bg: 'bg-blue-100' },
  pronto: { label: 'Pronto para entrega', color: 'text-green-600', bg: 'bg-green-100' },
  entregue: { label: 'Entregue', color: 'text-gray-600', bg: 'bg-gray-100' },;
};

interface PagamentoParcial {
  id: string;
  forma: string;
  valor: number;
}

export default function PedidoDetalhesModal({ pedido, onClose, onStatusChange }: PedidoDetalhesModalProps) {
  console.log('🔍 PedidoDetalhesModal - Pedido recebido:', pedido)
  
  // Checagens defensivas para evitar tela branca
  if (!pedido) {
    console.log('📝 PedidoDetalhesModal - Aguardando pedido...')
    return null;
  }
  
  if (!pedido.itens || !Array.isArray(pedido.itens) || typeof pedido.total !== 'number') {
    console.error('Pedido inválido:', pedido)
    return null;
  }
  
  const { caixaAtual, adicionarLancamento } = useCaixa()
  const { config: pagamentoConfig } = usePagamentoEntregaConfig(pedido?.company_id)

  // Log defensivo para caixaAtual e adicionarLancamento
  useEffect(() => {
    if (!caixaAtual || typeof adicionarLancamento !== 'function') {
      console.error('Caixa ou função de lançamento inválida:', { caixaAtual, adicionarLancamento })
    }
  }, [caixaAtual, adicionarLancamento])
  
  const [showPagamentoModal, setShowPagamentoModal] = useState(false)
  const [pagamentos, setPagamentos] = useState<PagamentoParcial[]>([])
  
  

  const status = statusConfig[pedido.status as keyof typeof statusConfig] || statusConfig.analise;
  
  // Gerar formas de pagamento disponíveis baseadas na configuração da empresa
  const formasPagamentoDisponiveis = (() => {
    const formas: string[] = [];
    if (pagamentoConfig?.accept_cash) formas.push('Dinheiro')
    if (pagamentoConfig?.accept_pix) formas.push('Pix')
    if (pagamentoConfig?.accept_card) formas.push('Cartão')
    
    // Se nenhuma forma foi configurada, usar padrão
    if (formas.length === 0) {
      formas.push('Dinheiro', 'Pix', 'Cartão')
    }
    
    return formas;
  })()
  
  console.log('💳 Formas de pagamento disponíveis:', formasPagamentoDisponiveis, 'Config:', pagamentoConfig)
  
  // Debug: Log todos os itens do pedido para investigar a taxa de entrega
  console.log('🔍 DEBUG - Itens do pedido:', pedido.itens.map(item => ({ nome: item.nome, valor: item.valor })))
  
  const subtotal = pedido.itens.reduce((acc, item) => acc + (item.qtd * item.valor), 0)
  
  // DEBUG: Listar todos os itens do pedido
  console.log('📋 DEBUG - Todos os itens do pedido:', pedido.itens.map(item => ({
    nome: item.nome,
    valor: item.valor,
    qtd: item.qtd
  })))
  
  // Melhorar a busca pela taxa de entrega - buscar por diferentes variações
  const taxaEntregaItem = pedido.itens.find(item => {
    const nomeItem = item.nome.toLowerCase()
    console.log('🔍 DEBUG - Verificando item:', nomeItem)
    const isMatch = nomeItem.includes('taxa') || 
                   nomeItem.includes('entrega') || 
                   nomeItem === 'taxa de entrega' ||;
                   nomeItem === 'delivery';
    console.log('🎯 DEBUG - Item match:', isMatch)
    return isMatch;
  })
  
  const taxaEntrega = taxaEntregaItem?.valor || 0;
  
  console.log('🚚 DEBUG - Taxa de entrega encontrada:', {
    itemEncontrado: taxaEntregaItem,
    valorTaxa: taxaEntrega,
    totalItens: pedido.itens.length
  })

  // Inicializar pagamentos quando abre o modal
  useEffect(() => {
    if (showPagamentoModal && pedido) {
      const formaPagamento = pedido.pagamento || 'Dinheiro';
      console.log('🔄 Inicializando pagamentos no modal:', { 
        pedidoId: pedido.id, 
        formaPagamento, 
        pedidoPagamento: pedido.pagamento,
        total: pedido.total 
      })
      
      setPagamentos([{
        id: '1',
        forma: formaPagamento,
        valor: pedido.total
      }])
    }
  }, [showPagamentoModal, pedido?.id]) // Adicionado pedido.id para reinicializar quando mudada o pedido

  const adicionarPagamento = () => {
    const novoId = (pagamentos.length + 1).toString()
    setPagamentos([...pagamentos, {
      id: novoId,
      forma: 'Dinheiro',
      valor: 0
    }])
  };

  const removerPagamento = (id: string) => {
    if (pagamentos.length > 1) {
      setPagamentos(pagamentos.filter(p => p.id !== id))
    }
  };

  const atualizarPagamento = (id: string, campo: 'forma' | 'valor', valor: string | number) => {
    setPagamentos(pagamentos.map(p => 
      p.id === id ? { ...p, [campo]: valor } : p;
    ))
  };

  const totalPagamentos = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0)
  const diferenca = pedido ? pedido.total - totalPagamentos : 0;

  const handleRegistrarPagamentos = async () => {
    console.log('🔄 Iniciando registro de pagamentos...', { caixaAtual, pagamentos, diferenca })
    
    if (!caixaAtual) {
      console.error('❌ Nenhum caixa aberto:', caixaAtual)
      toast.error('Nenhum caixa aberto para registrar o pagamento')
      return;
    }

    if (!pedido) return;

    // Validações
    if (pagamentos.some(p => !p.forma || p.valor <= 0)) {
      toast.error('Preencha todos os pagamentos corretamente')
      return;
    }

    if (Math.abs(diferenca) > 0.01) {
      toast.error('O valor total dos pagamentos deve ser igual ao valor do pedido')
      return;
    }

    try {
      console.log('📝 Iniciando loop de pagamentos...', { totalPagamentos: pagamentos.length } catch (error) { console.error('Error:', error) })
      
      // Registrar cada pagamento no caixa
      for (const pagamento of pagamentos) {
        console.log('💸 Processando pagamento:', pagamento)
        
        const dadosLancamento = {
          tipo: 'entrada' as const,
          valor: pagamento.valor,
          categoria: 'Venda',
          forma_pagamento: pagamento.forma,
          descricao: `Pagamento Pedido #${pedido.numero_pedido || pedido.id} - ${pedido.nome}${pagamentos.length > 1 ? ` (${pagamento.forma})` : ''}`,
          data_lancamento: new Date().toISOString().split('T')[0],
          hora_lancamento: new Date().toTimeString().split(' ')[0].slice(0, 5),
          observacoes: `Cliente: ${pedido.nome}, Telefone: ${pedido.telefone}`;
        };
        
        console.log('📋 Dados do lançamento:', dadosLancamento)
        
        const sucesso = await adicionarLancamento(dadosLancamento)
        
        console.log('✅ Resultado do lançamento:', sucesso)

        if (!sucesso) {
          console.error('❌ Falha ao registrar pagamento:', pagamento.forma)
          toast.error(`Erro ao registrar pagamento ${pagamento.forma}`)
          return;
        }
      }

      toast.success('Pagamentos registrados no caixa com sucesso!')
      setShowPagamentoModal(false)
      setPagamentos([])
    } catch (error) {
      toast.error('Erro ao registrar pagamentos')
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-bold mb-2">Pedido #{pedido.numero_pedido || pedido.id}</h3>
              <div className="flex items-center gap-4 text-blue-100">
                <span className="flex items-center gap-1">
                  <Clock size={16} />
                  {pedido.horario}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Informações do Cliente */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} className="text-gray-600" />
              Informações do Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium text-gray-900">{pedido.nome}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  {pedido.telefone}
                </p>
              </div>
              {pedido.endereco && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Endereço de Entrega</p>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" />
                    {pedido.endereco}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-gray-600" />
              Itens do Pedido
            </h4>
            <div className="space-y-3">
              {pedido.itens.map((item, index) => (
                <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.qtd}x {item.nome}</p>
                      
                      {/* Exibir adicionais agrupados por categoria */}
                      {item.adicionais && Object.keys(item.adicionais).length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {Object.entries(item.adicionais).map(([categoria, adicionais]: [string, any[]]) => (
                            <div key={categoria} className="text-sm">
                              <p className="font-semibold text-gray-700 uppercase tracking-wide">{categoria}:</p>
                              <div className="ml-2 space-y-0.5">
                                {adicionais.map((adicional, idx) => (
                                  <p key={idx} className="text-gray-600">
                                    + {adicional.quantidade}x {adicional.nome}
                                    {adicional.valor > 0 && ` (+R$ ${(adicional.valor * adicional.quantidade).toFixed(2)})`}
                                  </p>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">R$ {(item.qtd * item.valor).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Resumo de Valores */}
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">R$ {(subtotal - taxaEntrega).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxa de entrega</span>
                {taxaEntrega > 0 ? (
                  <span className="text-gray-900">R$ {taxaEntrega.toFixed(2)}</span>
                ) : (
                  <span className="text-green-600 font-medium">Grátis</span>
                )}
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">R$ {pedido.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          {/* Ações */}
          <div className="p-6 bg-gray-50">
            <div className="flex flex-wrap gap-3">
              {/* Print functionality removed */}
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => alert('Funcionalidade de enviar mensagem em desenvolvimento!')}
              >
                <MessageSquare size={18} />
                Enviar Mensagem
              </button>
              <button 
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => alert('Funcionalidade de editar pedido em desenvolvimento!')}
              >
                <Edit size={18} />
                Editar Pedido
              </button>
              <button 
                onClick={() => setShowPagamentoModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                title="Abrir opções de pagamento"
              >
                <DollarSign size={18} />
                Pagamento
              </button>
              {pedido.status === 'analise' && (
                <button 
                  onClick={() => onStatusChange?.(pedido.id, 'producao')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
                >
                  <CheckCircle size={18} />
                  Aceitar Pedido
                </button>
              )}
              {pedido.status === 'producao' && (
                <button 
                  onClick={() => onStatusChange?.(pedido.id, 'pronto')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  <CheckCircle size={18} />
                  Marcar como Pronto
                </button>
              )}
              {pedido.status === 'pronto' && (
                <button 
                  onClick={() => onStatusChange?.(pedido.id, 'entregue')}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                >
                  <CheckCircle size={18} />
                  Confirmar Entrega
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPagamentoModal && pedido && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-[60]" onClick={() => setShowPagamentoModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Registrar Pagamentos</h3>
                <button 
                  onClick={() => setShowPagamentoModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Valor Total do Pedido</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {pedido.total.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-900">Pagamentos</h4>
                    <button
                      onClick={adicionarPagamento}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Plus size={16} />
                      Adicionar
                    </button>
                  </div>

                  {pagamentos.map((pagamento, index) => (
                    <div key={pagamento.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Pagamento {index + 1}
                        </span>
                        {pagamentos.length > 1 && (
                          <button
                            onClick={() => removerPagamento(pagamento.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Forma
                          </label>
                          <Select
                            value={pagamento.forma}
                            onValueChange={(value) => atualizarPagamento(pagamento.id, 'forma', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione a forma" />
                            </SelectTrigger>
                            <SelectContent>
                              {formasPagamentoDisponiveis.map((forma) => (
                                <SelectItem key={forma} value={forma}>{forma}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={pagamento.valor}
                            onChange={(e) => atualizarPagamento(pagamento.id, 'valor', Number(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Total dos pagamentos:</span>
                    <span className="font-medium">R$ {totalPagamentos.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Valor do pedido:</span>
                    <span className="font-medium">R$ {pedido.total.toFixed(2)}</span>
                  </div>
                  <div className={`flex justify-between text-sm font-bold ${diferenca === 0 ? 'text-green-600' : diferenca > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                    <span>
                      {diferenca === 0 ? 'Valores conferem' : diferenca > 0 ? 'Falta:' : 'Excesso:'}
                    </span>
                    {diferenca !== 0 && <span>R$ {Math.abs(diferenca).toFixed(2)}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPagamentoModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRegistrarPagamentos}
                  disabled={Math.abs(diferenca) > 0.01 || pagamentos.some(p => !p.forma || p.valor <= 0)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar Pagamentos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
