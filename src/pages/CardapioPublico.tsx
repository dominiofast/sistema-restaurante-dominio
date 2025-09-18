import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { usePublicBranding } from '@/hooks/usePublicBranding';
import { useCompanyData } from '@/hooks/useCompanyData';
import { useOrderCreation } from '@/hooks/useOrderCreation';
import { updateMetaTags } from '@/utils/metaTags';
import { trackAddToCart } from '@/utils/facebookPixel';
import IdentificacaoModal from './IdentificacaoModal';
import { CompanyLogo } from '@/components/loading/CompanyLogo';
import { CompanyHeader } from '@/components/cardapio/public/CompanyHeader';
import { ProductModal } from '@/components/cardapio/public/ProductModal';
import MobileProductModal from '@/components/cardapio/public/MobileProductModal';
import { CartModal } from '@/components/cardapio/public/CartModal';
import { CheckoutModal } from '@/components/cardapio/public/CheckoutModal';
import { PaymentModal } from '@/components/cardapio/public/PaymentModal';
import { ProductGrid } from '@/components/cardapio/public/ProductGrid';
import { FeaturedCarousel } from '@/components/cardapio/public/FeaturedCarousel';
import { BottomNavigation } from '@/components/cardapio/public/BottomNavigation';
import { Produto } from '@/types/cardapio';
import { useClientePublico } from '@/hooks/useClientePublico';
import { useClientePersistente } from '@/hooks/useClientePersistente';
import { useStoreStatus } from '@/hooks/useStoreStatus';
import { toast } from 'sonner';
import FacebookPixelInjector from '@/components/marketing/FacebookPixelInjector';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import { useCheckoutHandlers } from '@/hooks/useCheckoutHandlers';
import type { ClientePublico } from '@/hooks/useCheckoutFlow';

const CardapioPublico: React.FC = () => {
  // Detectar se é dispositivo móvel
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    };
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  
  // Tentar extrair company_slug de diferentes formas
  let company_slug = params.company_slug || params['*'] || location.pathname.split('/')[1];
  
  // Se não há slug e estamos no domínio pedido.dominio.tech, usar dominiopizzas como padrão
  if (!company_slug || company_slug === '') {
    const hostname = window.location.hostname;
    if (hostname === 'pedido.dominio.tech' || hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) {
      company_slug = 'dominiopizzas';
    }
  }

  // Validar se company_slug está definido antes de continuar
  if (!company_slug) {
    console.error('❌ Company slug não encontrado na URL:', location.pathname)
  }

  console.log('🔍 CardapioPublico - company_slug:', company_slug, 'pathname:', location.pathname)

  // Hooks personalizados
  const { company, categorias, produtos, loadingData, error, retryKey, setRetryKey } = useCompanyData(company_slug)
  const { createOrder, isCreatingOrder } = useOrderCreation()
  const clientePublico = useClientePublico()
  const { cliente: clientePersistente, salvarCliente, temDadosSalvos } = useClientePersistente()
  const { branding, loading: brandingLoading, error: brandingError } = usePublicBranding({
    companyIdentifier: company?.id,
    updateFavicon: true,
    updateTitle: true,
    pageTitle: 'Cardápio Digital'
  })
  const { status: storeStatus } = useStoreStatus(company?.id)

  // Estados do checkout extraídos para hook customizado
  const {
    step, setStep,
    cliente, setCliente,
    endereco, setEndereco,
    deliveryInfo, setDeliveryInfo
  } = useCheckoutFlow()

  // Estados locais para UI
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [showingSkeleton, setShowingSkeleton] = useState(true)

  // Carrinho
  const {
    carrinho,
    adicionarAoCarrinho,
    removerDoCarrinho,
    atualizarQuantidade,
    limparCarrinho,
    totalCarrinho,
    totalItens
  } = useCart(company_slug, company?.id)

  // Handlers do checkout extraídos para hook customizado
  const {
    handleCheckout,
    handleIdentificacaoComplete,
    handleTrocarConta,
    handleCheckoutComplete,
    handlePaymentComplete
  } = useCheckoutHandlers({
    setStep,
    setCliente,
    setEndereco,
    setDeliveryInfo,
    setCartOpen,
    cliente,
    endereco,
    deliveryInfo,
    carrinho,
    company,
    company_slug, // ← Adicionado company_slug
    temDadosSalvos: Boolean(temDadosSalvos),
    clientePersistente,
    salvarCliente,
    createOrder,
    limparCarrinho
  })

  // Verificar se deve abrir o carrinho via state
  useEffect(() => {
    if (location.state?.openCart) {
      setCartOpen(true)
      setTimeout(() => {
        navigate(location.pathname, { replace: true })
      }, 100)
    }
  }, [location.state, navigate, location.pathname])

  // Efeito separado para detectar rota de carrinho
  useEffect(() => {
    // Se está na rota /carrinho, abrir carrinho automaticamente
    if (location.pathname.endsWith('/carrinho')) {
      console.log('🛒 Detectada rota de carrinho:', location.pathname)
      
      // Aguardar dados carregarem antes de validar
      if (loadingData || !company) {
        console.log('🛒 Aguardando dados carregarem...')
        return;
      }

      console.log('🛒 Abrindo carrinho automaticamente')
      setCartOpen(true)
    }
  }, [location.pathname, loadingData, company])

  // Efeito separado para detectar rota de checkout
  useEffect(() => {
    // Se está na rota /checkout, abrir checkout automaticamente
    if (location.pathname.endsWith('/checkout')) {
      console.log('🛒 Detectada rota de checkout:', location.pathname)
      console.log('🛒 Carrinho:', carrinho)
      console.log('🛒 Carrinho length:', carrinho.length)
      console.log('🛒 Loading data:', loadingData)
      console.log('🛒 Company:', company?.name, company?.id)
      console.log('🛒 Company slug:', company_slug)
      
      // Aguardar dados carregarem antes de validar
      if (loadingData || !company) {
        console.log('🛒 Aguardando dados carregarem...')
        return;
      }

      // Aguardar um pouco para o carrinho carregar
      setTimeout(() => {
        console.log('🛒 Verificando carrinho após timeout:', carrinho.length)
        
        // Verificar se há itens no carrinho
        if (carrinho.length === 0) {
          console.log('🛒 Carrinho vazio, redirecionando para cardápio')
          // Se carrinho vazio, redirecionar para cardápio
          navigate(`/${company_slug}`, { replace: true })
          toast.error('Seu carrinho está vazio. Adicione produtos antes de finalizar o pedido.')
          return;
        }
        
        console.log('🛒 Abrindo checkout automaticamente')
        // Se tem dados salvos, usar diretamente e ir direto para checkout
        if (temDadosSalvos && clientePersistente) {
          console.log('🛒 Usando dados salvos do cliente')
          setCliente(clientePersistente)
          setEndereco('')
          setStep('checkout')
        } else {
          console.log('🛒 Abrindo modal de identificação')
          setStep('identificacao')
        }
      }, 100)
    }
  }, [location.pathname, carrinho, company_slug, temDadosSalvos, clientePersistente, loadingData, company, navigate])

  // Atualizar meta tags quando a empresa carrega
  useEffect(() => {
    if (company) {
      updateMetaTags({
        company_name: company.name,
        company_description: company.description,
        company_slug
      })
    }
  }, [company, company_slug])

  // Effect para controlar o skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowingSkeleton(false)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Definir categoria selecionada inicial
  useEffect(() => {
    if (categorias.length > 0 && !selectedCategoria) {
      setSelectedCategoria(categorias[0].id)
    }
  }, [categorias, selectedCategoria])

  console.log('🔍 CardapioPublico iniciado com slug:', company_slug)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: company?.name || 'Cardápio Digital',;
          text: `Confira o cardápio de ${company?.name} catch (error) { console.error('Error:', error) }`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Erro ao compartilhar:', error)
        handleFallbackShare()
      }
    } else {
      handleFallbackShare()
    }
  };

  const handleFallbackShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Link copiado para a área de transferência!')
  };

  const handleProductClick = (produto: Produto) => {
    setSelectedProduct(produto)
  };

  const handleAddToCart = async (produto: Produto, quantidade: number, observacoes?: string, adicionais?: { [adicionalId: string]: number }) => {
    // Verificar se a loja está aberta antes de adicionar ao carrinho
    if (!storeStatus?.isOpen) {
      alert(storeStatus?.message || 'Loja fechada no momento')
      return;
    }
    
    await adicionarAoCarrinho(produto, quantidade, observacoes, adicionais)

    // Facebook Pixel: AddToCart
    try {
      trackAddToCart(produto, quantidade)
    } catch (e) {
      console.warn('[FacebookPixel] AddToCart error', e)
    }
  };

  const handleCartClick = () => {
    setCartOpen(true)
  };

  // Mover hooks para ANTES de qualquer return condicional
  const produtosDestaque = useMemo(() => 
    produtos.filter(produto => produto.destaque),
    [produtos];
  )

  // Preload de imagens críticas depois que produtos estão carregados
  useEffect(() => {
    if (produtosDestaque.length > 0) {
      const imagesToPreload = produtosDestaque
        .slice(0, 3)
        .filter(p => p.image)
        .map(p => p.image!)
        
      imagesToPreload.forEach(imageUrl => {
        const link = document.createElement('link')
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        document.head.appendChild(link)
      })
    }
  }, [produtosDestaque])

  const produtosFiltrados = produtos.filter(produto => 
    produto.categoria_id === selectedCategoria;
  )

  const produtosPorCategoria = categorias.reduce((acc, categoria) => {
    acc[categoria.id] = produtos.filter(produto => produto.categoria_id === categoria.id)
    return acc;
  }, {} as { [catId: string]: Produto[] })

  // Determinar se está carregando
  const isLoading = brandingLoading || loadingData || (!company && !error)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <CompanyLogo
              logoUrl={branding?.logo_url}
              companyName={company?.name}
              context="loading"
              className="loading-logo-enhanced"
              enableResponsive={true}
            />
          </div>
          {company?.name && (
            <p className="text-gray-700 font-medium mt-2">{company.name}</p>
          )}
        </div>
      </div>
    )
  }

  if (error || brandingError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4">{error || brandingError}</p>
          <button
            onClick={() => setRetryKey(prev => prev + 1)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Empresa não encontrada</p>
        </div>
      </div>
    )
  }

  // Definir cores sempre após ter branding
  const primaryColor = branding?.primary_color || '#3B82F6';
  const accentColor = branding?.accent_color || '#F59E0B';
  const textColor = branding?.text_color || '#1F2937';
  const backgroundColor = branding?.background_color || '#FFFFFF';

  // Se tem company mas ainda não carregou produtos e está carregando ou dentro do tempo de skeleton
  if (company && produtos.length === 0 && !error && (loadingData || showingSkeleton)) {
    return (
      <div className="min-h-screen cardapio-publico" style={{ backgroundColor, color: textColor }}>
        <CompanyHeader
          company={company}
          branding={branding}
          onShare={handleShare}
        />
        <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pb-32">
          {/* Skeleton do carrossel */}
          <section className="mt-4 sm:mt-6">
            <div className="h-6 bg-gray-200 rounded w-24 mb-3 animate-pulse"></div>
            <div className="flex gap-3 sm:gap-4 pb-2">
              {[1,2,3].map((i) => (
                <div key={i} className="flex-shrink-0 w-[144px] sm:w-[168px] bg-gray-200 rounded-lg h-[180px] animate-pulse"></div>
              ))}
            </div>
          </section>
          
          {/* Skeleton das categorias */}
          <nav className="mt-4 sm:mt-6 mb-4 sm:mb-6 border-b">
            <div className="flex gap-2 sm:gap-3 px-2 sm:px-0">
              {[1,2,3,4].map((i) => (
                <div key={i} className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
              ))}
            </div>
          </nav>
          
          {/* Skeleton dos produtos */}
          <div className="space-y-4">
            {[1,2,3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Só mostrar mensagem de "nenhum produto" se não está carregando dados e realmente não há produtos
  if (produtos.length === 0 && !isLoading && !loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Nenhum produto disponível</h1>
          <p className="text-gray-600">Este estabelecimento ainda não cadastrou produtos.</p>
        </div>
      </div>
    )
  }

  console.log('🎉 Renderizando cardápio público com sucesso!')
  console.log('🎨 Branding final:', branding)

  return (
    <div className="min-h-screen cardapio-publico" style={{ backgroundColor, color: textColor }}>
      <FacebookPixelInjector companySlug={company_slug} />
      <CompanyHeader
        company={company}
        branding={branding}
        onShare={handleShare}
      />
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 pb-32">
        <FeaturedCarousel
          produtosDestaque={produtosDestaque}
          primaryColor={primaryColor}
          accentColor={accentColor}
          textColor={textColor}
          onProductClick={handleProductClick}
        />
        <nav className="mt-4 sm:mt-6 mb-4 sm:mb-6 border-b overflow-x-auto categoria-nav-scroll" style={{ borderColor: `rgba(0,0,0,0.1)`, backgroundColor: `${backgroundColor}F0` }}>
          <ul className="flex gap-2 sm:gap-3 px-2 sm:px-0 whitespace-nowrap">
            {categorias.map((categoria) => (
              <li key={categoria.id}>
                <button
                  onClick={() => {
                    setSelectedCategoria(categoria.id)
                    const el = document.getElementById(`cat-${categoria.id}`)
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className={`flex items-center gap-1 px-1 sm:px-2 py-2 text-sm font-medium border-b-2 transition-colors ${
                    selectedCategoria === categoria.id
                      ? 'border-current'
                      : 'border-transparent hover:opacity-80'
                  }`}
                  style={{ 
                    color: selectedCategoria === categoria.id ? primaryColor : `rgba(${parseInt(textColor.slice(1,3), 16)}, ${parseInt(textColor.slice(3,5), 16)}, ${parseInt(textColor.slice(5,7), 16)}, 0.7)`
                  }}
                >
                  <span className="cardapio-categoria-titulo">{categoria.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <ProductGrid
          categorias={categorias}
          produtosPorCategoria={produtosPorCategoria}
          accentColor={accentColor}
          primaryColor={primaryColor}
          textColor={textColor}
          onProductClick={handleProductClick}
          companyId={company?.id}
        />
      </div>
      <BottomNavigation
        totalItens={totalItens}
        primaryColor={primaryColor}
        accentColor={accentColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
        onCartClick={handleCartClick}
      />
      {selectedProduct && (
        <>
          {isMobile ? (
            <MobileProductModal
              isOpen={!!selectedProduct}
              produto={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAdvance={async (produto, selectedAdicionais, observacoes = '') => {
                try {
                  // Verificar se há observação temporária
                  const tempObs = localStorage.getItem('temp_observacao')
                  const finalObservacoes = tempObs || observacoes;
                  
                  if (tempObs) {
                    localStorage.removeItem('temp_observacao')
                  }
                  
                   catch (error) { console.error('Error:', error) }await handleAddToCart(produto, 1, finalObservacoes, selectedAdicionais)
                  await new Promise(resolve => setTimeout(resolve, 100))
                  navigate(`/${company_slug}/produto-adicionado`, { 
                    state: { produto, company } 
                  })
                } catch (error) {
                  console.error('🛒 [CardapioPublico] MOBILE - ERRO em onAdvance:', error)
                  alert(`ERRO: ${error.message}`)

              }}
              primaryColor={primaryColor}
              companyId={company?.id}
            />
          ) : (
            <ProductModal
              isOpen={!!selectedProduct}
              produto={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAdvance={async (produto, selectedAdicionais, observacoes = '') => {
                try {
                  await handleAddToCart(selectedProduct, 1, observacoes, selectedAdicionais)
                  await new Promise(resolve => setTimeout(resolve, 100))
                  navigate(`/${company_slug} catch (error) { console.error('Error:', error) }/produto-adicionado`, { 
                    state: { produto: selectedProduct, company } 
                  })
                } catch (error) {
                  console.error('🛒 [CardapioPublico] DESKTOP - ERRO em onAdvance:', error)
                  alert(`ERRO: ${error.message}`)

              }}
              primaryColor={primaryColor}
              companyId={company?.id}
            />
          )}
        </>
      )}
      {cartOpen && (
        <CartModal
          carrinho={carrinho}
          totalCarrinho={totalCarrinho}
          totalItens={totalItens}
          onClose={() => setCartOpen(false)}
          onRemover={removerDoCarrinho}
          onAtualizarQuantidade={atualizarQuantidade}
          onFinalizarPedido={handleCheckout}
          onAdicionarAoCarrinho={async (produto) => {
            const produtoCompleto: Produto = {
              id: produto.id,
              name: produto.name,
              description: produto.description,
              price: produto.price,
              promotional_price: produto.promotional_price,
              is_promotional: produto.is_promotional,
              image: produto.image,
              is_available: true,
              company_id: company.id,
              categoria_id: '',
              destaque: false,
              created_at: '',
              updated_at: ''
            };
            await handleAddToCart(produtoCompleto, 1)
          }}
          primaryColor={primaryColor}
        />
      )}
      {step === 'identificacao' && (
        <IdentificacaoModal
          onComplete={handleIdentificacaoComplete}
          onCancel={() => setStep('cart')}
          companyId={company?.id}
          dadosIniciais={clientePersistente || undefined}
        />
      )}
      {step === 'checkout' && cliente && company && company.id && (
        <>
          {console.log('🔍 CheckoutModal - company:', company)}
          {console.log('🔍 CheckoutModal - company.id:', company.id)}
          {console.log('🔍 CheckoutModal - company.id válido:', !!company.id)}
          <CheckoutModal
            carrinho={carrinho}
            totalCarrinho={totalCarrinho}
            companyName={company.name}
            companyId={company.id}
            onClose={() => {
              setStep('cart')
              // Se estava na rota de checkout, voltar para cardápio
              if (location.pathname.endsWith('/checkout')) {
                navigate(`/${company_slug}`, { replace: true })
              }
            }}
            onVoltarCarrinho={() => {
              setStep('cart')
              setCartOpen(true)
              // Se estava na rota de checkout, voltar para cardápio
              if (location.pathname.endsWith('/checkout')) {
                navigate(`/${company_slug}`, { replace: true })
              }
            }}
            onPedidoFinalizado={handleCheckoutComplete}
            primaryColor={primaryColor}
            cliente={cliente}
            endereco={endereco}
            onTrocarConta={handleTrocarConta}
          />
        </>
      )}
      {step === 'checkout' && (loadingData || !company || !company.id) && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Carregando...</h2>
            <p className="text-gray-600">Preparando as informações da empresa</p>
          </div>
        </div>
      )}
      {step === 'payment' && cliente && company && (
        <PaymentModal
          onClose={() => setStep('cart')}
          onVoltarEndereco={() => setStep('checkout')}
          onConfirm={handlePaymentComplete}
          primaryColor={primaryColor}
          totalCarrinho={totalCarrinho + (deliveryInfo?.taxaEntrega || 0)}
          taxaEntrega={deliveryInfo?.taxaEntrega || 0}
          companyId={company.id}
          customerPhone={cliente.telefone}
          onCashbackUpdate={() => {
            // Força atualização do saldo de cashback após pedido criado
            console.log('🔄 Atualizando saldo de cashback...')
          }}
        />
      )}
    </div>
  )
};

export default CardapioPublico;
