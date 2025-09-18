import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface AutoatendimentoCarrinhoProps {
  onBack: () => void;
  onNext: () => void;
  primaryColor: string;
}

export const AutoatendimentoCarrinho: React.FC<AutoatendimentoCarrinhoProps> = ({
  onBack,
  onNext,
  primaryColor
}) => {
  const { 
    carrinho, 
    adicionarAoCarrinho, 
    removerDoCarrinho, 
    limparCarrinho, 
    totalCarrinho,
    atualizarQuantidade 
  } = useCart()

  const total = totalCarrinho;
  const totalItens = carrinho.reduce((sum, item) => sum + item.quantidade, 0)

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removerDoCarrinho(itemId)
    } else {
      atualizarQuantidade(itemId, newQuantity)
    }
  };

  if (carrinho.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <div className="text-8xl mb-6">🛒</div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: primaryColor }}>
              Carrinho Vazio
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Adicione alguns produtos ao seu carrinho para continuar
            </p>
            <Button 
              onClick={onBack}
              className="h-16 md:h-20 px-8 md:px-12 text-lg md:text-xl font-semibold text-white rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              <ArrowLeft className="mr-2 h-6 w-6" />
              Voltar ao Cardápio
            </Button>
          </div>
        </div>
      </div>
    )


  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="mb-4 h-12 md:h-14 text-lg md:text-xl"
          >
            <ArrowLeft className="mr-2 h-6 w-6" />
            Voltar ao Cardápio
          </Button>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: primaryColor }}>
            Seu Pedido
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Confira os itens e continue para o pagamento
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
          {/* Lista de itens */}
          <div className="xl:col-span-2 space-y-4 md:space-y-6">
            {carrinho.map((item, index) => (
              <Card key={`${item.id}-${index}`} className="overflow-hidden">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start space-x-4 md:space-x-6">
                    {/* Imagem do produto */}
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl flex-shrink-0">
                    {item.produto.image ? (
                      <img
                        src={item.produto.image}
                        alt={item.produto.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl md:text-3xl text-gray-300 rounded-xl">
                        🍽️
                      </div>
                    )}
                    </div>

                    {/* Informações do produto */}
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-semibold mb-1">
                        {item.produto.name}
                      </h3>
                      
                      {item.produto.description && (
                        <p className="text-muted-foreground text-sm md:text-base mb-2">
                          {item.produto.description}
                        </p>
                      )}
                      
                      {/* Adicionais */}
                      {item.adicionais && Object.keys(item.adicionais).length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm md:text-base text-muted-foreground mb-1">Adicionais:</p>
                          {Object.values(item.adicionais).map((adicional: any, idx) => (
                            <div key={idx} className="text-sm md:text-base">
                              {adicional.name} (+R$ {adicional.price.toFixed(2)})
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>
                          R$ {item.preco_total.toFixed(2)}
                        </div>
                        
                        {/* Controles de quantidade - otimizados para tablets */}
                        <div className="flex items-center space-x-3 md:space-x-4">
                          <div className="flex items-center space-x-2 md:space-x-3">
                            <Button
                              onClick={() => handleQuantityChange(item.id, item.quantidade - 1)}
                              size="sm"
                              variant="outline"
                              className="h-12 w-12 md:h-14 md:w-14 p-0 rounded-xl"
                            >
                              <Minus className="h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                            
                            <span className="text-lg md:text-xl font-semibold w-10 md:w-12 text-center">
                              {item.quantidade}
                            </span>
                            
                            <Button
                              onClick={() => handleQuantityChange(item.id, item.quantidade + 1)}
                              size="sm"
                              className="h-12 w-12 md:h-14 md:w-14 p-0 text-white rounded-xl"
                              style={{ backgroundColor: primaryColor }}
                            >
                              <Plus className="h-5 w-5 md:h-6 md:w-6" />
                            </Button>
                          </div>
                          
                          <Button
                            onClick={() => removerDoCarrinho(item.id)}
                            size="sm"
                            variant="ghost"
                            className="h-12 w-12 md:h-14 md:w-14 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="h-5 w-5 md:h-6 md:w-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Botão para limpar carrinho */}
            <div className="text-center pt-4 md:pt-6">
              <Button
                onClick={limparCarrinho}
                variant="ghost"
                className="text-red-500 hover:text-red-700 text-base md:text-lg h-12 md:h-14 px-6 md:px-8"
              >
                <Trash2 className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                Limpar Carrinho
              </Button>
            </div>
          </div>

          {/* Resumo do pedido */}
          <div>
            <Card className="sticky top-8">
              <CardContent className="p-4 md:p-6">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6" style={{ color: primaryColor }}>
                  Resumo do Pedido
                </h3>
                
                <div className="space-y-4 md:space-y-6 mb-6">
                  <div className="flex justify-between text-base md:text-lg">
                    <span>Itens ({totalItens})</span>
                    <span>R$ {total.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-xl md:text-2xl font-bold" style={{ color: primaryColor }}>
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={onNext}
                  className="w-full h-14 md:h-16 text-lg md:text-xl font-semibold text-white rounded-xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  Continuar para Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
};
