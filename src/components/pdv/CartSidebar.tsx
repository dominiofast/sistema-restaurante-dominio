import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Eye, Edit, X, FileText, DollarSign, Settings } from 'lucide-react';
import { CartItem } from '@/hooks/useCart';
import { PagamentoModalPDV } from './PagamentoModalPDV';
import { PedidoConfirmacaoModal } from './PedidoConfirmacaoModal';
// SUPABASE REMOVIDO
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CartSidebarProps {
  carrinho: CartItem[];
  totalCarrinho: number;
  totalItens: number;
  onRemoverItem: (itemId: string) => void;
  onAtualizarQuantidade: (itemId: string, quantidade: number) => void;
  companyId?: string;
  taxaEntrega?: number;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  carrinho,
  totalCarrinho,
  totalItens,
  onRemoverItem,
  onAtualizarQuantidade,
  companyId,
  taxaEntrega = 0
}) => {
  const [showPagamentoModal, setShowPagamentoModal] = useState(false)
  const [showConfirmacaoModal, setShowConfirmacaoModal] = useState(false)
  const [pedidoId, setPedidoId] = useState<string | null>(null)
  const [processandoPedido, setProcessandoPedido] = useState(false)
  const [telefoneCliente, setTelefoneCliente] = useState('')
  const [nomeCliente, setNomeCliente] = useState('')
  const [clienteEncontrado, setClienteEncontrado] = useState<any>(null)
  const [showEnderecoModal, setShowEnderecoModal] = useState(false)

  // Event listener para o botão flutuante
  React.useEffect(() => {
    const handleFinalizarPedidoEvent = () => {
      if (carrinho.length > 0) {
        setShowPagamentoModal(true)
      }
    };

    window.addEventListener('finalizarPedido', handleFinalizarPedidoEvent)
    
    return () => {
      window.removeEventListener('finalizarPedido', handleFinalizarPedidoEvent)
    };
  }, [carrinho.length]) // Dependência para recalcular quando o carrinho mudar

  // Função para buscar cliente pelo telefone
  const buscarClientePorTelefone = async (telefone: string) => {
    if (!telefone || telefone.length < 10 || !companyId) return;
    
    try {
      // Buscar na tabela clientes
      const { data: cliente, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        
        

      if (error) {
        console.error('Erro ao buscar cliente:', error)
        return;
      }

      if (cliente) {
        setClienteEncontrado(cliente)
        setNomeCliente(cliente.nome)
        console.log('Cliente encontrado:', cliente)
      } else {
        setClienteEncontrado(null)
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)

  };

  // Função para buscar endereços do cliente
  const buscarEnderecosCliente = async () => {
    if (!telefoneCliente || !companyId) return [];
    
    try {
      const { data: enderecos, error }  catch (error) { console.error('Error:', error) }= 
        
        
        
        

      if (error) {
        console.error('Erro ao buscar endereços:', error)
        return [];
      }

      return enderecos || [];
    } catch (error) {
      console.error('Erro ao buscar endereços:', error)
      return [];

  };

  // Handler para mudança no telefone
  const handleTelefoneChange = (value: string) => {
    setTelefoneCliente(value)
    
    // Sempre limpar cliente e endereços quando trocar telefone
    setNomeCliente('')
    setClienteEncontrado(null)
    
    // Se limpar o telefone, apenas retornar
    if (!value) {
      return;


    // Buscar cliente automaticamente quando o telefone tiver pelo menos 10 caracteres
    if (value.length >= 10) {
      buscarClientePorTelefone(value)

  };

  // Handler para o botão Entrega
  const handleEntregaClick = async () => {
    if (!telefoneCliente) {
      alert('Digite o telefone do cliente primeiro')
      return;


    const enderecos = await buscarEnderecosCliente()
    
    if (enderecos.length === 0) {
      alert('Nenhum endereço encontrado para este cliente. Cadastre um novo endereço.')
      // Aqui poderia abrir um modal para cadastrar novo endereço
      return;


    // Aqui você pode mostrar os endereços em um modal ou dropdown
    console.log('Endereços encontrados:', enderecos)
    setShowEnderecoModal(true)
  };

  const handleFinalizarPedido = () => {
    if (carrinho.length === 0) return;
    setShowPagamentoModal(true)
  };

  const handleConfirmarPagamento = async (pagamento: any) => {
    if (!companyId) {
      alert('Erro: Empresa não identificada')
      return;


    setProcessandoPedido(true)
    
    try {
      console.log('🎯 Criando pedido PDV', {
        companyId,
        totalCarrinho,
        itensCount: carrinho.length,
        pagamento
      } catch (error) { console.error('Error:', error) })

      // Criar o pedido na tabela pedidos com status 'analise'
      const pedido = null as any; const pedidoError = null as any;
        throw pedidoError;
      }

      console.log('✅ Pedido criado com sucesso:', {
        id: pedido.id,
        company_id: pedido.company_id,
        status: pedido.status,
        origem: pedido.origem,
        total: pedido.total
      })

      // Criar os itens do pedido
      const itensParaInserir = carrinho.map(item => ({
        pedido_id: pedido.id,
        produto_id: item.produto.id,
        nome_produto: item.produto.name,
        quantidade: item.quantidade,
        valor_unitario: item.produto.is_promotional && item.produto.promotional_price 
          ? item.produto.promotional_price 
          : item.produto.price,
        valor_total: item.preco_total,
        observacoes: null;
      }))

      console.log('📦 Inserindo itens do pedido:', itensParaInserir.length)

      const itensInseridos = null as any; const itensError = null as any;
        throw itensError;
      }

      console.log('✅ Itens inseridos com sucesso:', itensInseridos?.length)

      // Criar adicionais dos itens se existirem
      for (let i = 0; i < carrinho.length; i++) {
        const item = carrinho[i];
        const itemInserido = itensInseridos?.[i];
        
        if (item.adicionais && Object.keys(item.adicionais).length > 0 && itemInserido) {
          // Buscar dados completos dos adicionais para obter a categoria
          const adicionaisCompletos = await Promise.all(
            Object.entries(item.adicionais).map(async ([adicionalId, adicionalData]) => {
              const { data: adicionalCompleto  } = null as any;
                  id,
                  name,
                  categorias_adicionais!inner(name)
                `)
                
                

              return {
                pedido_item_id: itemInserido.id,
                adicional_id: adicionalId,
                nome_adicional: adicionalData.name,
                categoria_nome: adicionalCompleto?.categorias_adicionais?.name || 'Outros',
                quantidade: adicionalData.quantity,
                valor_unitario: adicionalData.price,
                valor_total: adicionalData.price * adicionalData.quantity;
              };
            })
          )

          console.log('🧩 Inserindo adicionais para item:', itemInserido.id)

          const { error: adicionaisError  } = null as any;
          if (adicionaisError) {
            console.error('❌ Erro ao inserir adicionais:', adicionaisError)
          } else {
            console.log('✅ Adicionais inseridos com sucesso')
          }
        }
      }

      setPedidoId(pedido.id.toString())
      setShowPagamentoModal(false)
      setShowConfirmacaoModal(true)
      
      console.log('🎉 Pedido finalizado com sucesso! ID:', pedido.id)
      
    } catch (error) {
      console.error('💥 Erro ao finalizar pedido:', error)
      alert('Erro ao finalizar pedido. Tente novamente.')
    } finally {
      setProcessandoPedido(false)

  };

  const handleNovaVenda = () => {
    // Limpar carrinho (precisará ser implementado no hook useCart)
    carrinho.forEach(item => onRemoverItem(item.id))
    setPedidoId(null)
  };

  const handleImprimirVenda = () => {
    // Implementar impressão quando necessário;
    console.log('Imprimir venda:', pedidoId)
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-white overflow-hidden">
        {/* Botões de Ação no Topo - ALTURA FIXA */}
        <div className="flex-shrink-0 h-12 p-2 border-b border-gray-200 bg-white">
          <div className="grid grid-cols-3 gap-1 h-full">
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium">
              <Eye className="h-3 w-3" />
              Observação
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium">
              <Edit className="h-3 w-3" />
              Editar
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium">
              <X className="h-3 w-3" />
              Excluir
            </button>
          </div>
        </div>

        {/* Cabeçalho Itens do Pedido - ALTURA FIXA */}
        <div className="flex-shrink-0 h-10 px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Itens do pedido</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Subtotal</span>
            <Settings className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Lista de itens - ALTURA CALCULADA EXATA */}
        <div className="h-[calc(100vh-420px)] overflow-y-auto">
          {carrinho.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-center px-3">
              <p className="text-sm text-gray-500">
                Finalize o item ao lado, ele vai aparecer aqui
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {carrinho.map((item) => (
                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-medium text-gray-900 mb-1">
                        {item.produto.name}
                      </h4>
                      
                      {/* Exibir adicionais se existirem */}
                      {item.adicionais && Object.keys(item.adicionais).length > 0 && (
                        <div className="mb-2 pl-2 border-l-2 border-blue-200">
                          {Object.entries(item.adicionais).map(([adicionalId, adicionalData]: [string, any]) => (
                            <div key={adicionalId} className="text-xs text-gray-600 mb-0.5">
                              <span className="text-blue-600">+ </span>
                              {adicionalData.quantity}x {adicionalData.name}
                              <span className="text-gray-500 ml-1">
                                (+R$ {(adicionalData.price * adicionalData.quantity).toFixed(2)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 mb-1">
                        <button
                          onClick={() => onAtualizarQuantidade(item.id, Math.max(1, item.quantidade - 1))}
                          className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Minus className="h-2 w-2" />
                        </button>
                        <span className="text-xs font-medium px-1 py-0.5 bg-white border rounded min-w-[1.5rem] text-center">
                          {item.quantidade}
                        </span>
                        <button
                          onClick={() => onAtualizarQuantidade(item.id, item.quantidade + 1)}
                          className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-2 w-2" />
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        R$ {item.preco_unitario.toFixed(2)} cada
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-gray-900 mb-1">
                        R$ {item.preco_total.toFixed(2)}
                      </div>
                      <button
                        onClick={() => onRemoverItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEÇÃO ABSOLUTAMENTE FIXA - Resumo e Totais - ALTURA FIXA */}
        <div className="flex-shrink-0 h-20 border-t border-gray-200 bg-white">
          <div className="p-2 space-y-1 h-full">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">R$ {totalCarrinho.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Entrega</span>
              {taxaEntrega > 0 ? (
                <span className="font-medium">R$ {taxaEntrega.toFixed(2)}</span>
              ) : (
                <span className="text-green-600 font-medium">Grátis</span>
              )}
            </div>
            <div className="border-t border-gray-200 pt-1">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total</span>
                <span>R$ {(totalCarrinho + taxaEntrega).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SEÇÃO ABSOLUTAMENTE FIXA - Campos do Cliente - ALTURA FIXA */}
        <div className="flex-shrink-0 h-20 p-2 border-t border-gray-200 space-y-1">
          <div className="grid grid-cols-2 gap-1">
            <div className="relative">
              <Input
                placeholder="(XX) X XXXX-XXXX"
                value={telefoneCliente}
                onChange={(e) => handleTelefoneChange(e.target.value)}
                className={`text-xs h-7 ${clienteEncontrado ? 'border-green-500 bg-green-50' : ''}`}
              />
              {clienteEncontrado && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            <Input
              placeholder="Nome do cliente"
              value={nomeCliente}
              onChange={(e) => setNomeCliente(e.target.value)}
              className={`text-xs h-7 ${clienteEncontrado ? 'border-green-500 bg-green-50' : ''}`}
              readOnly={!!clienteEncontrado}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <button 
              className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium disabled:opacity-50 h-7"
              onClick={handleEntregaClick}
              disabled={!telefoneCliente}
            >
              <FileText className="h-3 w-3" />
              Entrega
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium h-7">
              <DollarSign className="h-3 w-3" />
              Pagamentos
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-1">
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium h-7">
              CPF/CNPJ
            </button>
            <button className="flex items-center justify-center gap-1 px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50 text-xs font-medium h-7">
              Ajustar valor
            </button>
          </div>
        </div>

        {/* BOTÃO ABSOLUTAMENTE FIXO NO FINAL - ALTURA FIXA E DESTACADO */}
        <div className="flex-shrink-0 h-16 p-3 border-t-2 border-gray-300 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg">
          <Button 
            className="w-full h-full bg-white text-blue-600 text-sm font-bold hover:bg-blue-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md border-2 border-blue-600 rounded-lg"
            onClick={handleFinalizarPedido}
            disabled={processandoPedido || carrinho.length === 0}
          >
            {processandoPedido ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Processando...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                GERAR PEDIDO
              </div>
            )}
          </Button>
        </div>
      </div>

      {/* Modal de Pagamento */}
      <PagamentoModalPDV
        isOpen={showPagamentoModal}
        onClose={() => setShowPagamentoModal(false)}
        onConfirm={handleConfirmarPagamento}
        companyId={companyId}
        subtotal={totalCarrinho}
        total={totalCarrinho}
      />

      {/* Modal de Confirmação */}
      <PedidoConfirmacaoModal
        isOpen={showConfirmacaoModal}
        onClose={() => setShowConfirmacaoModal(false)}
        pedidoId={pedidoId}
        total={totalCarrinho}
        onImprimirVenda={handleImprimirVenda}
        onNovaVenda={handleNovaVenda}
      />
    </>
  )
};
