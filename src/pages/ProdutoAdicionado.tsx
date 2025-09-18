import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, CheckCircle } from 'lucide-react';
import { usePublicBrandingNew } from '@/hooks/usePublicBrandingNew';
import { useCart } from '@/hooks/useCart';

const ProdutoAdicionado: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { company_slug } = useParams()
  const { produto, company, quantidade = 1, adicionais } = location.state || {};
  
  // Estado para controlar o carregamento das cores
  const [isColorsLoaded, setIsColorsLoaded] = useState(false)
  
  // Estado para as observações
  const [observacao, setObservacao] = useState('')
  
  // Hook do carrinho para verificar se o produto foi realmente adicionado
  const { carrinho, totalCarrinho, totalItens, atualizarObservacoes } = useCart(company_slug, company?.id)
  
  // Obter configurações de branding da empresa
  const { branding, loading: brandingLoading } = usePublicBrandingNew(company_slug)
  
  // Definir cores da empresa - só usa se já carregou
  const primaryColor = branding?.primary_color;
  const accentColor = branding?.accent_color;
  const textColor = branding?.text_color;
  const backgroundColor = branding?.background_color;

  // Controlar carregamento das cores
  useEffect(() => {
    if (!brandingLoading && branding) {
      // Adicionar um pequeno delay para suavizar a transição
      setTimeout(() => {
        setIsColorsLoaded(true)
      }, 150)
    }
  }, [branding, brandingLoading])

  // Verificar se o produto está no carrinho
  useEffect(() => {
    // Estado do carrinho verificado
  }, [carrinho, produto])

  if (!produto) {
    navigate(-1)
    return null;


  const handleContinuarComprando = () => {
    // Voltar para o cardápio (o produto já está no carrinho)
    navigate(`/${company?.slug || company_slug}`)
  };

  const handleIrParaCarrinho = () => {
    // Se há observações, salvar no localStorage temporariamente
    if (observacao.trim()) {
      localStorage.setItem('temp_observacao', observacao.trim())
    }
    
    // Navegando para a página do carrinho
    navigate(`/${company?.slug || company_slug}/carrinho`, { 
      replace: true,
    })
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className={`w-full max-w-md shadow-xl border-border transition-all duration-500 ${isColorsLoaded ? 'animate-fade-in' : 'opacity-90'}`}>
        <CardContent className="p-8 text-center">
          {/* Ícone de sucesso */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {isColorsLoaded && primaryColor ? (
                <>
                  <CheckCircle 
                    className="w-20 h-20 transition-all duration-500 animate-scale-in" 
                    style={{ color: primaryColor }} 
                  />
                  <div 
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-500 animate-scale-in"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <ShoppingCart className="w-4 h-4 text-white" />
                  </div>
                </>
              ) : (
                <div className="w-20 h-20 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>

          {/* Título */}
          <h2 className="text-3xl font-bold mb-3 text-foreground">
            Produto adicionado!
          </h2>
          
          {/* Subtítulo */}
          <p className="text-base mb-8 leading-relaxed text-muted-foreground">
            {isColorsLoaded && primaryColor ? (
              <strong 
                className="transition-all duration-500 animate-fade-in"
                style={{ color: primaryColor }}
              >
                {produto.name}
              </strong>
            ) : (
              <strong>{produto.name}</strong>
            )} foi adicionado ao seu carrinho com sucesso.
          </p>

          {/* Imagem do produto */}
          {produto.image && (
            <div className="mb-8">
              <img 
                src={produto.image} 
                alt={produto.name}
                className={`w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-xl mx-auto shadow-lg transition-all duration-500 ${isColorsLoaded ? 'animate-scale-in' : 'opacity-70'}`}
                style={isColorsLoaded && primaryColor ? { borderColor: `${primaryColor}33`, borderWidth: '3px', borderStyle: 'solid' } : {}}
              />
            </div>
          )}

          {/* Preço */}
          <div className="mb-8">
            {(() => {
              // Calcular preço base do produto
              const precoBase = produto.is_promotional && produto.promotional_price 
                ? Number(produto.promotional_price) ;
                : Number(produto.price)
              
              // Encontrar o item correspondente no carrinho para obter o preço real com adicionais
              const itemNoCarrinho = carrinho.find(item => 
                item.produto.id === produto.id || item.produto.name === produto.name;
              )
              
              // Se encontrou no carrinho, usar o preço calculado com adicionais
              const precoFinal = itemNoCarrinho ? itemNoCarrinho.preco_unitario : precoBase;
              
              return isColorsLoaded && primaryColor ? (
                <span 
                  className="text-3xl font-bold transition-all duration-500 animate-fade-in" 
                  style={{ color: primaryColor }}
                >
                  R$ {precoFinal.toFixed(2).replace('.', ',')}
                </span>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  R$ {precoFinal.toFixed(2).replace('.', ',')}
                </span>
              )
            })()}
          </div>

          {/* Campo de Observações */}
          <div className="mb-8 text-left">
            <label className="block text-sm font-medium mb-2 text-foreground">
              Observações
            </label>
            <Textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Tirar cebola, caprichar no molho, etc..."
              className={`resize-none ${isColorsLoaded && primaryColor ? 'focus:ring-2' : ''}`}
              style={isColorsLoaded && primaryColor ? { 
                borderColor: `${primaryColor}33`,
                '--tw-ring-color': `${primaryColor}33`
              } as React.CSSProperties : {}}
              rows={3}
              maxLength={200}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {observacao.length}/200 caracteres
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-4">
            {isColorsLoaded && primaryColor ? (
              <>
                <Button 
                  onClick={handleIrParaCarrinho}
                  className="w-full text-white font-semibold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 flex items-center justify-center gap-3 animate-fade-in"
                  style={{ 
                    backgroundColor: primaryColor,
                    borderColor: primaryColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}dd`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = primaryColor;
                  }}
                >
                  <ShoppingCart className="w-6 h-6" />
                  Finalizar pedido
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={handleContinuarComprando}
                  className="w-full font-semibold py-4 text-lg rounded-xl transition-all duration-500 hover:shadow-md flex items-center justify-center gap-3 animate-fade-in"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${primaryColor}1a`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ArrowLeft className="w-6 h-6" />
                  Continuar comprando
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="w-full h-14 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="w-full h-14 bg-gray-100 rounded-xl animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Informação adicional */}
          <p className="text-sm mt-6 font-medium text-muted-foreground">
            Você pode adicionar mais produtos antes de finalizar seu pedido
          </p>
        </CardContent>
      </Card>
    </div>
  )
};

export default ProdutoAdicionado;
