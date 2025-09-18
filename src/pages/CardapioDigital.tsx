
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePublicBranding } from '@/hooks/usePublicBranding';
import { useCardapioData } from '@/hooks/useCardapioData';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { HeaderSection } from '@/components/cardapio/public/HeaderSection';
import { CategoryNavigation } from '@/components/cardapio/public/CategoryNavigation';
import { EmptyState } from '@/components/cardapio/public/EmptyState';
import { DebugInfo } from '@/components/cardapio/public/DebugInfo';
import { BottomNavigation } from '@/components/cardapio/public/BottomNavigation';
import { useBulkProductPricing } from '@/hooks/useBulkProductPricing';
import { formatPriceDisplay } from '@/utils/priceCalculation';
import { useDynamicFavicon } from '@/hooks/useDynamicFavicon';
import { CashbackHeader } from '@/components/cashback';

interface Produto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  destaque?: boolean;
  categoria_id?: string;
  is_available: boolean;
  preparation_time?: number;
  company_id: string;


const CardapioDigital: React.FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { currentCompany, user } = useAuth()
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Identificador: id do contexto ou slug/código na URL
  const slugFromUrl = (params as any)?.slug || (typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean)[0] : '')
  const companyIdentifier = currentCompany?.id || slugFromUrl || '';

  // Branding resolve company_id quando vier por slug/código
  const { branding, loading: brandingLoading, error: brandingError } = usePublicBranding(companyIdentifier)

  // Company efetivo para dados
  const effectiveCompanyId = currentCompany?.id || branding?.company_id;

  // Carregar dados do cardápio
  const { categorias, produtos, loading: dataLoading, error } = useCardapioData(effectiveCompanyId)

  // Carregar configurações da empresa
  const { settings, isLoading: settingsLoading } = useCompanySettings(effectiveCompanyId)

  // Calcular preços em lote para produtos com adicionais obrigatórios
  const { pricingMap, loading: pricingLoading } = useBulkProductPricing(produtos)

  function handleProdutoClick(produto: Produto) {
    navigate('/produto-detalhe', { state: { produto } })
  }

  // Selecionar primeira categoria automaticamente
  useEffect(() => {
    if (categorias.length > 0 && categoriaSelecionada === null) {
      console.log('📌 Selecionando primeira categoria:', categorias[0].name)
      setCategoriaSelecionada(categorias[0].id)
    } else if (categorias.length === 0 && categoriaSelecionada !== null) {
      console.log('📌 Nenhuma categoria encontrada, mostrando destaques')
      setCategoriaSelecionada(null)
    }
  }, [categorias, categoriaSelecionada])

  // Produtos da categoria selecionada ou em destaque
  const produtosFiltrados = categoriaSelecionada
    ? produtos.filter(p => p.categoria_id === categoriaSelecionada)
    : produtos.filter(p => p.destaque)

  // Filtrar por busca
  const produtosFinal = produtosFiltrados.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  console.log('📊 Estado atual render:', {
    loading: dataLoading || brandingLoading,
    hasCurrentCompany: !!currentCompany,
    companyId: currentCompany?.id,
    companyName: currentCompany?.name,
    categoriasCount: categorias.length,
    produtosCount: produtos.length,
    categoriaSelecionada,
    produtosFiltradosCount: produtosFiltrados.length,
    produtosFinalCount: produtosFinal.length,
    searchTerm,
    error
  })

  // Mostrar erro se há erro específico
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Caso público por slug/código: aguardar branding para resolver a empresa
  if (!effectiveCompanyId && brandingLoading && !!(slugFromUrl || !currentCompany)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-800">Carregando loja...</div>
        </div>
      </div>
    )
  }

  // Loja não encontrada após carregar branding
  if (!effectiveCompanyId && !brandingLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Loja não encontrada ou indisponível.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Mostrar loading apenas enquanto carrega dados do cardápio (branding tem fallback)
  if (dataLoading || settingsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-800">Carregando cardápio...</div>
          <div className="text-sm text-gray-500 mt-2">
            {dataLoading && 'Carregando dados...'}
            {settingsLoading && 'Carregando configurações...'}
          </div>
        </div>
      </div>
    )
  }

  // Configurações de branding com fallbacks (prioriza settings, depois branding)
  const primaryColor = settings?.primary_color || branding?.primary_color || '#3B82F6';
  const accentColor = branding?.accent_color || '#F59E0B';
  const backgroundColor = branding?.background_color || '#FFFFFF';
  const textColor = branding?.text_color || '#1F2937';

  const headerCompany = currentCompany || (branding ? ({ id: branding.company_id, name: branding.company_name || 'Loja' } as any) : undefined)

  // Configurar favicon dinâmico com o logo da loja
  const logoUrl = (branding as any)?.logo_url || (currentCompany as any)?.logo_url;
  useDynamicFavicon({ logoUrl })


  const getSectionTitle = () => {
    if (categoriaSelecionada === null) {
      return '🔥 Em Destaque';
    }
    return categorias.find(c => c.id === categoriaSelecionada)?.name || 'Produtos';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor, color: textColor }}>
      <HeaderSection
        company={headerCompany as any}
        branding={branding}
        settings={settings}
        primaryColor={primaryColor}
        textColor={textColor}
        customerPhone={user?.user_metadata?.phone}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Cashback Header */}
        <CashbackHeader 
          companyId={effectiveCompanyId}
          primaryColor={primaryColor}
          textColor={textColor}
        />

        {/* Search Bar */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
        <DebugInfo
          company={currentCompany}
          categorias={categorias}
          produtos={produtos}
          categoriaSelecionada={categoriaSelecionada}
          produtosFiltrados={produtosFiltrados}
          produtosFinal={produtosFinal}
          searchTerm={searchTerm}
        />

        <CategoryNavigation
          categorias={categorias}
          categoriaSelecionada={categoriaSelecionada}
          onCategoriaSelect={setCategoriaSelecionada}
          primaryColor={primaryColor}
        />

        {/* Título da Seção */}
        <div className="mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: textColor }}>
            {getSectionTitle()}
          </h2>
        </div>

        {/* Grid de Produtos ou Estado Vazio */}
        {produtosFinal.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            categoriaSelecionada={categoriaSelecionada}
            onClearSearch={() => setSearchTerm('')}
          />
        ) : (
          <div className="space-y-4">
            {produtosFinal.map((produto, index) => {
              const pricingInfo = pricingMap[produto.id];
              const basePrice = produto.is_promotional && produto.promotional_price ? produto.promotional_price : produto.price;
              const minimumPrice = pricingInfo?.minimumPrice || basePrice;
              const hasRequired = pricingInfo?.hasRequired || false;
              
              // Calcular percentual de desconto
              const discountPercentage = produto.is_promotional && produto.promotional_price && produto.promotional_price < produto.price && produto.price > 0
                ? Math.round(((produto.price - produto.promotional_price) / produto.price) * 100)
                : null;

              return (
              <div
                key={produto.id}
                  className="bg-white rounded-lg border cursor-pointer hover:shadow-md transition-shadow flex h-32 overflow-hidden"
                onClick={() => handleProdutoClick(produto)}
                style={{ borderColor: `${primaryColor}20` }}
              >
                  {/* Informações à esquerda */}
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                <h3 className="text-sm font-medium mb-1 line-clamp-2 leading-tight" style={{ color: textColor }}>
                  {produto.name}
                </h3>
                {produto.description && (
                        <p className="text-xs mb-2 line-clamp-2 leading-tight text-gray-600">
                    {produto.description}
                  </p>
                )}
                    </div>
                    
                    {/* Badge de desconto e preços */}
                    <div className="flex items-center gap-2">
                      {/* Badge de desconto primeiro */}
                      {discountPercentage && discountPercentage > 0 && (
                        <span 
                          className="text-[10px] px-1.5 py-0.5 rounded-md font-medium text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          -{discountPercentage}%
                        </span>
                      )}
                      
                      {/* Preços */}
                      {produto.is_promotional && produto.promotional_price && produto.promotional_price > 0 ? (
                        <>
                          {/* Preço original riscado */}
                          {produto.price > 0 && (
                            <span className="text-xs line-through text-gray-500">
                              R$ {produto.price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                          
                          {/* Preço atual na cor da loja */}
                          <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                            R$ {produto.promotional_price.toFixed(2).replace('.', ',')}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm font-semibold" style={{ color: primaryColor }}>
                          R$ {produto.price.toFixed(2).replace('.', ',')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Imagem à direita */}
                  <div className="w-32 h-full bg-gray-50 flex-shrink-0 relative overflow-hidden">
                    {produto.image ? (
                      <img
                        src={produto.image}
                        alt={produto.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-3xl">🍕</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
};

export default CardapioDigital;
