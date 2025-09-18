import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, X, Settings, Eye, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import { useCardapioData } from '@/hooks/useCardapioData';
import { useClientePublico } from '@/hooks/useClientePublico';
import { useAgenteIAConfig } from '@/hooks/useAgenteIAConfig';
 
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';
import { EntregaModalPDV } from '@/components/pdv/EntregaModalPDV';
import { PagamentoModalSimplesPDV } from '@/components/pdv/PagamentoModalSimplesPDV';
import { AdicionaisModal } from '@/components/pdv/AdicionaisModal';
import { ObservacaoModalPDV } from '@/components/pdv/ObservacaoModalPDV';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

const PDVEnhanced = () => {
  const { currentCompany, user } = useAuth();
  const { selectedStore } = useStore();
  const { categorias, produtos, loading, error } = useCardapioData(currentCompany?.id);
  const { buscarPorTelefone, loading: loadingCliente } = useClientePublico();
  const { config: agenteConfig } = useAgenteIAConfig(currentCompany?.id || '');
  const { toast: toastHook } = useToast();
  
  const [searchParams] = useSearchParams();
  
  const [categoriaAtiva, setCategoriaAtiva] = useState('');
  const [carrinho, setCarrinho] = useState(() => {
    // Restaurar carrinho do localStorage ao inicializar
    try {
      const saved = localStorage.getItem('pdv_carrinho');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [busca, setBusca] = useState('');
  const [cliente, setCliente] = useState(() => {
    // Restaurar dados do cliente do localStorage ao inicializar
    try {
      const saved = localStorage.getItem('pdv_cliente');
      return saved ? JSON.parse(saved) : {
        nome: '',
        telefone: '',
        endereco: '',
        entrega: 'balcao',
        pagamento: 'dinheiro',
        taxaEntrega: 0
      };
    } catch {
      return {
        nome: '',
        telefone: '',
        endereco: '',
        entrega: 'balcao',
        pagamento: 'dinheiro',
        taxaEntrega: 0
      };
    }
  });
  const [buscandoCliente, setBuscandoCliente] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [entregaModalOpen, setEntregaModalOpen] = useState(false);
  const [pagamentoModalOpen, setPagamentoModalOpen] = useState(false);
  const [adicionaisModalOpen, setAdicionaisModalOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [observacaoModalOpen, setObservacaoModalOpen] = useState(false);
  const [observacoesPedido, setObservacoesPedido] = useState(() => {
    // Restaurar observações do localStorage ao inicializar
    try {
      const saved = localStorage.getItem('pdv_observacoes');
      return saved || '';
    } catch {
      return '';
    }
  });
  const [carregandoPedido, setCarregandoPedido] = useState(false);

  // Persistir dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('pdv_carrinho', JSON.stringify(carrinho));
  }, [carrinho]);

  useEffect(() => {
    localStorage.setItem('pdv_cliente', JSON.stringify(cliente));
  }, [cliente]);

  useEffect(() => {
    localStorage.setItem('pdv_observacoes', observacoesPedido);
  }, [observacoesPedido]);

  // Set primeira categoria como ativa quando as categorias carregarem
  useEffect(() => {
    if (categorias.length > 0 && !categoriaAtiva) {
      setCategoriaAtiva(categorias[0].id);
      console.log('📂 PDV - Categoria ativa definida:', categorias[0].name, categorias[0].id);
    }
  }, [categorias, categoriaAtiva]);

  // Carregar pedido existente se pedido_id for fornecido na URL
  useEffect(() => {
    const pedidoId = searchParams.get('pedido_id');
    if (pedidoId && produtos.length > 0) {
      carregarPedidoExistente(Number(pedidoId));
    }
  }, [searchParams, produtos]);

  const carregarPedidoExistente = async (pedidoId: number) => {
    setCarregandoPedido(true);
    try {
      // Carregar dados do pedido
      const { data: pedido, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'pedidos')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'id', pedidoId)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('Erro ao carregar pedido:', error);
        alert('Erro ao carregar pedido para edição');
        return;
      }

      // Carregar itens do pedido com adicionais
      const { data: itens, error: itensError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'pedido_itens')
        /* .select\( REMOVIDO */ ; //`
          *,
          pedido_item_adicionais (*)
        `)
        /* .eq\( REMOVIDO */ ; //'pedido_id', pedidoId);

      if (itensError) {
        console.error('Erro ao carregar itens do pedido:', itensError);
        alert('Erro ao carregar itens do pedido');
        return;
      }

      if (pedido) {
        console.log('Dados do pedido carregados:', { pedido, itens });

        // Buscar taxa de entrega nos itens do pedido
        const taxaEntregaItem = itens?.find((item: any) => 
          item.nome_produto && (
            item.nome_produto.toLowerCase().includes('taxa de entrega') ||
            item.nome_produto.toLowerCase().includes('entrega') ||
            item.nome_produto.toLowerCase().includes('delivery')
          )
        );
        
        const taxaEntrega = taxaEntregaItem ? Number(taxaEntregaItem.valor_total) : 0;
        console.log('Taxa de entrega encontrada:', taxaEntrega, taxaEntregaItem);

        // Carregar dados do cliente
        setCliente({
          nome: pedido.nome || '',
          telefone: pedido.telefone || '',
          endereco: pedido.endereco || '',
          entrega: pedido.tipo === 'retirada' ? 'balcao' : pedido.tipo || 'balcao',
          pagamento: pedido.pagamento || 'dinheiro',
          taxaEntrega: taxaEntrega
        });

        // Carregar observações
        setObservacoesPedido(pedido.observacoes || '');

        // Carregar itens do carrinho
        if (itens && itens.length > 0) {
          const carrinhoItems = itens
            .filter((item: any) => {
              // Filtrar itens de taxa de entrega para não aparecerem no carrinho
              const isTaxaEntrega = item.nome_produto && (
                item.nome_produto.toLowerCase().includes('taxa de entrega') ||
                item.nome_produto.toLowerCase().includes('entrega') ||
                item.nome_produto.toLowerCase().includes('delivery')
              );
              return !isTaxaEntrega;
            })
            .map((item: any) => {
              const produto = produtos.find(p => p.id === item.produto_id);
              if (!produto) {
                console.warn('Produto não encontrado no cardápio:', item.produto_id);
                return null;
              }

              // Processar adicionais
              const adicionais = (item.pedido_item_adicionais || []).map((adicional: any) => ({
                id: adicional.id,
                name: adicional.nome_adicional || `Adicional ${adicional.id.slice(0, 8)}`,
                price: Number(adicional.valor_unitario) || 0,
                quantidade: adicional.quantidade || 1
              }));

              return {
                ...produto,
                quantidade: item.quantidade || 1,
                adicionais: adicionais,
                preco_unitario: Number(item.valor_unitario) || produto.price
              };
            }).filter(Boolean);

          // Itens carregados no carrinho
          setCarrinho(carrinhoItems);
        }

        setClienteEncontrado(true);
        console.log('Pedido carregado com sucesso para edição:', pedido);
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar pedido:', error);
      alert('Erro inesperado ao carregar pedido');
    } finally {
      setCarregandoPedido(false);
    }
  };

  // Função para buscar cliente por telefone
  const buscarClientePorTelefone = async (telefone: string) => {
    if (!telefone || telefone.length < 10) return; // Mínimo 10 dígitos
    
    setBuscandoCliente(true);
    try {
      const clienteEncontrado = await buscarPorTelefone(telefone, currentCompany?.id);
      if (clienteEncontrado) {
        setCliente(prev => ({
          ...prev,
          nome: clienteEncontrado.nome || '',
          endereco: clienteEncontrado.endereco || ''
        }));
        setClienteEncontrado(true);
      } else {
        setClienteEncontrado(false);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    } finally {
      setBuscandoCliente(false);
    }
  };

  // Efeito para buscar cliente quando telefone mudar
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (cliente.telefone) {
        buscarClientePorTelefone(cliente.telefone);
      } else {
        setClienteEncontrado(false);
      }
    }, 1000); // Aguarda 1 segundo após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [cliente.telefone]);

  // Categoria ativa efetiva (fallback para a primeira categoria carregada)
  const effectiveCategoriaAtiva = categoriaAtiva || (categorias[0]?.id || '');
  
  const produtosFiltrados = produtos.filter(produto => {
    // Se ainda não temos categoria definida e não há categorias carregadas, mostrar todos
    const categoriaMatch = effectiveCategoriaAtiva ? produto.categoria_id === effectiveCategoriaAtiva : true;
    const searchMatch = produto.name.toLowerCase().includes(busca.toLowerCase());
    return categoriaMatch && searchMatch;
  });

  // Debug log para produtos e categorias
  useEffect(() => {
    console.log('🔍 PDV - Status atual:', {
      totalProdutos: produtos.length,
      totalCategorias: categorias.length,
      categoriaAtiva,
      produtosFiltrados: produtosFiltrados.length,
      categoriaNome: categorias.find(c => c.id === categoriaAtiva)?.name
    });
  }, [produtos, categorias, categoriaAtiva, produtosFiltrados]);

  const abrirModalAdicionais = (produto) => {
    if (!produto.is_available) return;
    
    setProdutoSelecionado(produto);
    setAdicionaisModalOpen(true);
  };

  const adicionarAoCarrinho = (produto, quantidade, adicionais = {}) => {
    if (!produto.is_available) return;
    
    // Converter objeto de adicionais para array com dados completos
    const adicionaisArray = Object.entries(adicionais).map(([id, adicionalData]: [string, any]) => {
      // Se adicionalData já é um objeto com name e price, usar diretamente
      if (typeof adicionalData === 'object' && adicionalData?.name) {
        return {
          id: adicionalData.id,
          name: adicionalData.name,
          price: Number(adicionalData.price) || 0,
          quantidade: adicionalData.quantity
        };
      } else {
        // Fallback para formato antigo (apenas quantidade)
        return {
          id,
          name: `Adicional ${id.slice(0, 8)}`,
          price: 0,
          quantidade: typeof adicionalData === 'number' ? adicionalData : 1
        };
      }
    });
    
    const itemCompleto = {
      ...produto,
      quantidade: quantidade || 1,
      adicionais: adicionaisArray,
      // Converter preços para números para evitar NaN
      preco_unitario: produto.is_promotional && produto.promotional_price 
        ? Number(produto.promotional_price) || 0 
        : Number(produto.price) || 0,
      // O preço total será calculado dinamicamente no carrinho
    };
    
    setCarrinho(prev => {
      const itemExistente = prev.find(item => 
        item.id === produto.id && 
        JSON.stringify(item.adicionais) === JSON.stringify(adicionais)
      );
      
      if (itemExistente) {
        return prev.map(item =>
          item.id === produto.id && JSON.stringify(item.adicionais) === JSON.stringify(adicionaisArray)
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        );
      }
      
      return [...prev, itemCompleto];
    });
  };

  const removerDoCarrinho = (item) => {
    setCarrinho(prev => prev.filter(cartItem => 
      !(cartItem.id === item.id && JSON.stringify(cartItem.adicionais) === JSON.stringify(item.adicionais))
    ));
  };

  const atualizarQuantidade = (item, novaQuantidade) => {
    if (novaQuantidade === 0) {
      removerDoCarrinho(item);
      return;
    }
    setCarrinho(prev =>
      prev.map(cartItem =>
        cartItem.id === item.id && JSON.stringify(cartItem.adicionais) === JSON.stringify(item.adicionais)
          ? { ...cartItem, quantidade: novaQuantidade }
          : cartItem
      )
    );
  };

  const total = carrinho.reduce((acc, item) => {
    // Converter preços para números para evitar NaN
    const priceNumber = Number(item.price) || 0;
    const promotionalPriceNumber = item.promotional_price ? Number(item.promotional_price) : 0;
    
    const preco = item.is_promotional && promotionalPriceNumber 
      ? promotionalPriceNumber 
      : priceNumber;
      
    const precoAdicionais = (item.adicionais || []).reduce((total, adicional) => {
      const adicionalPrice = Number(adicional.price) || 0;
      return total + (adicionalPrice * adicional.quantidade);
    }, 0);
    
    const itemTotal = (preco + precoAdicionais) * item.quantidade;
    console.log('🧮 PDV - Calculando item:', {
      produto: item.name,
      preco,
      precoAdicionais,
      quantidade: item.quantidade,
      itemTotal,
      isNaN: isNaN(itemTotal)
    });
    
    return acc + (isNaN(itemTotal) ? 0 : itemTotal);
  }, 0);

  const handleEntregaConfirm = (data: any) => {
    console.log('📦 PDV - Dados recebidos do modal de entrega:', data);
    if (data.tipo === 'delivery' && data.endereco) {
      const enderecoTexto = `${data.endereco.logradouro}, ${data.endereco.numero}${data.endereco.complemento ? ', ' + data.endereco.complemento : ''} - ${data.endereco.bairro}, ${data.endereco.cidade}`;
      console.log('💰 PDV - Definindo taxa de entrega no cliente:', data.taxaEntrega || 0);
      setCliente(prev => ({ 
        ...prev, 
        entrega: data.tipo,
        endereco: enderecoTexto,
        taxaEntrega: data.taxaEntrega || 0
      }));
    } else {
      setCliente(prev => ({ 
        ...prev, 
        entrega: data.tipo || data,
        taxaEntrega: 0
      }));
    }
    setEntregaModalOpen(false);
  };

  const handlePagamentoConfirm = (formaPagamento: string, dados?: any) => {
    setCliente(prev => ({ ...prev, pagamento: formaPagamento }));
    setPagamentoModalOpen(false);
    console.log('Pagamento confirmado:', { formaPagamento, dados });
  };

  const salvarPedido = async () => {
    try {
      if (!agenteConfig?.token_pedidos) {
        toast.error('Erro: Token de autenticação não configurado');
        return false;
      }

      // DEFENSIVE PROGRAMMING - Validação para super admins
      if (!selectedStore && user?.role === 'super_admin') {
        console.error('❌ Super admin tentando criar pedido sem empresa selecionada');
        toast.error('Por favor, selecione uma empresa antes de criar o pedido');
        return false;
      }

      // Preparar dados do pedido no formato esperado pela edge function
      const pedidoData = {
        nome: cliente.nome,
        telefone: cliente.telefone,
        endereco: cliente.endereco || undefined,
        tipo: cliente.entrega === 'balcao' ? 'retirada' : cliente.entrega,
        pagamento: cliente.pagamento,
        observacoes: observacoesPedido || undefined,
        taxaEntrega: cliente.entrega === 'delivery' ? cliente.taxaEntrega : undefined,
        // Para super admins, incluir company_id da empresa selecionada
        company_id: selectedStore?.id || undefined,
        itens: carrinho.map(item => ({
          produto_id: item.id,
          nome_produto: item.name,
          quantidade: item.quantidade,
          preco_unitario: item.is_promotional && item.promotional_price ? item.promotional_price : item.price,
          adicionais: (item.adicionais || []).map(adicional => ({
            nome: adicional.name,
            preco: adicional.price,
            quantidade: adicional.quantidade
          }))
        }))
      };

      console.log('Enviando pedido:', pedidoData);
      console.log('🏢 Empresa selecionada no PDV:', selectedStore);
      console.log('🎯 Company ID sendo enviado:', pedidoData.company_id);
      console.log('📱 Todos os dados da selectedStore:', JSON.stringify(selectedStore, null, 2));

      // Solução profissional e escalável: Edge Function com transação atômica
      const { data, error } = await /* supabase REMOVIDO */ null; //functions.invoke('criar-pedido-pdv', {
        body: pedidoData
      });

      if (error) {
        console.error('Erro ao salvar pedido:', error);
        toast.error('Erro ao salvar pedido: ' + (error.message || 'Erro desconhecido'));
        return false;
      }

      console.log('Pedido salvo com sucesso:', data);
      
      // Imprimir via PrintNode (edge function)
      try {
        await /* supabase REMOVIDO */ null; //functions.invoke('auto-print-pedido', {
          body: {
            pedido_id: data.pedido_id,
            numero_pedido: data.numero_pedido,
            company_id: currentCompany?.id,
            origin: 'pdv',
          },
        });
        toast.success(`Pedido criado! Número: ${data.numero_pedido || data.pedido_id}`);
      } catch (printErr) {
        console.warn('Falha ao acionar impressão automática:', printErr);
        toast.success(`Pedido criado! Número: ${data.numero_pedido || data.pedido_id}`);
      }
      
      return true;

    } catch (error) {
      console.error('Erro inesperado ao salvar pedido:', error);
      toast.error('Erro inesperado ao salvar pedido');
      return false;
    }
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) {
      toast.error('Adicione itens ao carrinho!');
      return;
    }

    if (!cliente.nome || !cliente.telefone) {
      toast.error('Por favor, preencha o nome e telefone do cliente');
      return;
    }
    
    // Finalizando pedido
    
    const sucesso = await salvarPedido();
    if (sucesso) {
      // Limpar formulário e localStorage apenas se salvou com sucesso
      setCarrinho([]);
      setCliente({ nome: '', telefone: '', endereco: '', entrega: 'balcao', pagamento: 'dinheiro', taxaEntrega: 0 });
      setClienteEncontrado(false);
      setObservacoesPedido('');
      
      // Limpar dados salvos no localStorage
      localStorage.removeItem('pdv_carrinho');
      localStorage.removeItem('pdv_cliente');
      localStorage.removeItem('pdv_observacoes');
    }
  };

  // Loading e error states
  if (loading || carregandoPedido) {
    return (
      <div className="h-[calc(100vh-56px)] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {carregandoPedido ? 'Carregando pedido para edição...' : 'Carregando cardápio...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-56px)] bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Erro ao carregar cardápio:</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-56px)] bg-gray-100 flex flex-col">

      {/* Layout Principal */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar de Categorias */}
        <div className="w-48 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center gap-2 mb-3">
              <button className="text-xs text-gray-500">[F] Filtrar</button>
              <button className="text-xs text-gray-500">[P] Pesquisar</button>
            </div>
            
            <div className="relative mb-3">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder=""
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="text-xs text-gray-500">[N] Navegar</div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Categorias */}
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                onClick={() => setCategoriaAtiva(categoria.id)}
                className={`w-full text-left p-3 text-sm border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  (effectiveCategoriaAtiva === categoria.id) ? 'bg-blue-50 border-l-4 border-l-blue-500 font-medium' : ''
                }`}
              >
                {categoria.name}
              </button>
            ))}
          </div>
        </div>

          {/* Área Central do PDV */}
        <div className="flex-1 flex flex-col bg-gray-100">
          {/* Header do PDV */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-800">Pedidos balcão (PDV)</h1>
                {searchParams.get('pedido_id') && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    Editando Pedido #{searchParams.get('pedido_id')}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button className="bg-blue-500 text-white px-3 py-1.5 rounded text-sm font-medium">
                  [D] Delivery e Balcão
                </button>
                <button className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm hover:bg-gray-200">
                  [M] Mesas e Comandas
                </button>
                <button className="bg-gray-100 text-gray-700 p-1.5 rounded hover:bg-gray-200">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Área de Produtos */}
          <div className="flex-1 p-4">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
              <div className="flex-1 p-4 overflow-y-auto">
                {/* Título da Seção */}
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">
                      {categorias.find(cat => cat.id === effectiveCategoriaAtiva)?.name || 'Produtos'}
                    </h3>
                  </div>
                </div>

                {/* Navegação */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span>🏠 ➤ Navegação</span>
                  <span>ENTRE Selecionar item</span>
                </div>

                {/* Grid de Produtos */}
                <div className="grid grid-cols-6 gap-3">
                  {produtosFiltrados.map(produto => (
                    <div 
                      key={produto.id} 
                      className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${
                        !produto.is_available ? 'opacity-60' : ''
                      }`}
                      onClick={() => abrirModalAdicionais(produto)}
                    >
                      <div className="relative">
                        <img
                          src={produto.image || '/api/placeholder/150/120'}
                          alt={produto.name}
                          className="w-full h-20 object-cover"
                        />
                        {!produto.is_available && (
                          <div className="absolute inset-0 bg-gray-800 bg-opacity-80 flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-gray-700 px-2 py-1 rounded">INDISPONÍVEL</span>
                          </div>
                        )}
                        {produto.is_promotional && produto.is_available && (
                          <span className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-bold">
                            PROMO
                          </span>
                        )}
                      </div>
                      <div className="p-2">
                        <h4 className="text-xs font-medium text-gray-800 mb-1 line-clamp-2 min-h-[2rem]">
                          {produto.name}
                        </h4>
                         <div className="text-sm font-bold text-gray-900">
                           {produto.is_promotional && produto.promotional_price ? (
                             <>
                               <span className="line-through text-gray-500 text-xs mr-1">
                                 R$ {(Number(produto.price) || 0).toFixed(2)}
                               </span>
                               <span>R$ {(Number(produto.promotional_price) || 0).toFixed(2)}</span>
                             </>
                           ) : (
                             <span>R$ {(Number(produto.price) || 0).toFixed(2)}</span>
                           )}
                         </div>
                      </div>
                    </div>
                  ))}
                </div>

                {produtosFiltrados.length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <p>Nenhum produto encontrado nesta categoria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carrinho - Altura Total */}
        <div className="w-96 bg-white shadow-lg border-l border-gray-200 flex flex-col">
          {/* Botões de Controle do Carrinho */}
          <div className="p-3 border-b flex gap-2 bg-gray-50">
            <button 
              onClick={() => setObservacaoModalOpen(true)}
              className={`px-2 py-1 rounded text-xs hover:bg-gray-200 flex items-center gap-1 ${
                observacoesPedido ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Eye className="h-3 w-3" />
              [O] Observação {observacoesPedido && '●'}
            </button>
            <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 flex items-center gap-1">
              <Edit className="h-3 w-3" />
              [Q] Editar
            </button>
            <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-200 flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
              [W] Excluir
            </button>
            <button className="bg-gray-100 text-gray-700 p-1 rounded hover:bg-gray-200">
              <Settings className="h-3 w-3" />
            </button>
          </div>

          {/* Header do Carrinho */}
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-medium text-gray-800">Itens do pedido</h2>
              <div className="text-sm font-medium text-gray-800">Subtotal</div>
            </div>
          </div>

          {/* Items do Carrinho */}
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            {carrinho.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p className="text-sm">Finalize o item ao lado, ele vai aparecer aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrinho.map(item => (
                  <div key={`${item.id}-${JSON.stringify(item.adicionais)}`} className="bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-800 flex-1">{item.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removerDoCarrinho(item);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {/* Adicionais */}
                    {item.adicionais && item.adicionais.length > 0 && (
                      <div className="mb-2 pl-2 border-l-2 border-gray-200">
                        {item.adicionais.map((adicional, index) => (
                           <div key={index} className="text-xs text-gray-600 flex justify-between">
                             <span>{adicional.quantidade}x {adicional.name}</span>
                             <span>+R$ {((Number(adicional.price) || 0) * adicional.quantidade).toFixed(2)}</span>
                           </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            atualizarQuantidade(item, item.quantidade - 1);
                          }}
                          className="bg-gray-200 hover:bg-gray-300 rounded w-6 h-6 flex items-center justify-center"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantidade}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            atualizarQuantidade(item, item.quantidade + 1);
                          }}
                          className="bg-gray-200 hover:bg-gray-300 rounded w-6 h-6 flex items-center justify-center"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                       <span className="text-sm font-bold text-gray-900">
                         R$ {(() => {
                           const precoBase = Number(item.is_promotional && item.promotional_price ? item.promotional_price : item.price) || 0;
                           const precoAdicionais = (item.adicionais || []).reduce((total, adicional) => total + ((Number(adicional.price) || 0) * adicional.quantidade), 0);
                           return ((precoBase + precoAdicionais) * item.quantidade).toFixed(2);
                         })()}
                       </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer com Resumo e Checkout */}
          <div className="border-t p-4 space-y-4 bg-white flex-shrink-0">
            {/* Resumo */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Entrega</span>
                <span className={cliente.taxaEntrega > 0 ? 'text-gray-800' : 'text-green-600'}>
                  {cliente.taxaEntrega > 0 ? `R$ ${cliente.taxaEntrega.toFixed(2)}` : 'Grátis'}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>R$ {(total + cliente.taxaEntrega).toFixed(2)}</span>
              </div>
            </div>

            {/* Dados do Cliente */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="(XX) X XXXX-XXXX"
                    value={cliente.telefone}
                    onChange={(e) => setCliente(prev => ({ ...prev, telefone: e.target.value }))}
                    className={`w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                      clienteEncontrado ? 'border-green-400 bg-green-50' : 'border-gray-300'
                    }`}
                  />
                  {buscandoCliente && (
                    <div className="absolute right-2 top-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                  {clienteEncontrado && !buscandoCliente && (
                    <div className="absolute right-2 top-2 text-green-500">
                      ✓
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nome do cliente"
                  value={cliente.nome}
                  onChange={(e) => setCliente(prev => ({ ...prev, nome: e.target.value }))}
                  className={`w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                    clienteEncontrado ? 'border-green-400 bg-green-50' : 'border-gray-300'
                  }`}
                />
              </div>
              
              <input
                type="text"
                placeholder="Endereço (opcional)"
                value={cliente.endereco}
                onChange={(e) => setCliente(prev => ({ ...prev, endereco: e.target.value }))}
                className={`w-full p-2 text-sm border rounded focus:ring-1 focus:ring-blue-500 ${
                  clienteEncontrado ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
              />
              
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setEntregaModalOpen(true)}
                  disabled={!cliente.telefone || !cliente.nome}
                  className={`p-2 text-xs border rounded ${
                    cliente.telefone && cliente.nome 
                      ? 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer' 
                      : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  [E] Entrega
                </button>
                <button 
                  onClick={() => setPagamentoModalOpen(true)}
                  className="p-2 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100"
                >
                  [R] Pagamentos
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100">
                  [T] CPF/CNPJ
                </button>
                <button className="p-2 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100">
                  [Y] Ajustar valor
                </button>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2">
              <button className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded text-sm">
                [A] Próximo
              </button>
              <button
                onClick={finalizarPedido}
                disabled={carrinho.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 rounded text-sm"
              >
                [ENTER] Gerar pedido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Entrega */}
      <EntregaModalPDV
        isOpen={entregaModalOpen}
        onClose={() => setEntregaModalOpen(false)}
        onConfirm={handleEntregaConfirm}
        customerPhone={cliente.telefone}
        customerName={cliente.nome}
      />

      {/* Modal de Pagamento */}
      <PagamentoModalSimplesPDV
        isOpen={pagamentoModalOpen}
        onClose={() => setPagamentoModalOpen(false)}
        onConfirm={handlePagamentoConfirm}
        total={total}
      />

      {/* Modal de Adicionais */}
      <AdicionaisModal
        isOpen={adicionaisModalOpen}
        onClose={() => setAdicionaisModalOpen(false)}
        onSave={adicionarAoCarrinho}
        produto={produtoSelecionado}
      />

      {/* Modal de Observações */}
      <ObservacaoModalPDV
        isOpen={observacaoModalOpen}
        onClose={() => setObservacaoModalOpen(false)}
        onConfirm={(observacao) => setObservacoesPedido(observacao)}
        observacaoAtual={observacoesPedido}
      />
    </div>
  );
};

export default PDVEnhanced;