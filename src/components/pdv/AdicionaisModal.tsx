import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { Produto } from '@/types/cardapio';
import { useProductAdicionais } from '@/hooks/useProductAdicionais';
import { CategorySection } from './adicionais/CategorySection';
import { ProductFooter } from './adicionais/ProductFooter';

interface AdicionaisModalProps {
  isOpen: boolean;
  produto: Produto | null;
  onClose: () => void;
  onSave: (produto: Produto, quantidade: number, adicionais: { [adicionalId: string]: { id: string; name: string; price: number; quantity: number } }) => void;
}

export const AdicionaisModal: React.FC<AdicionaisModalProps> = ({
  isOpen,
  produto,
  onClose,
  onSave
}) => {
  const [selectedAdicionais, setSelectedAdicionais] = useState<{ [adicionalId: string]: number }>({})
  const [observacao, setObservacao] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [filtroAdicionais, setFiltroAdicionais] = useState('')

  const { categorias: categoriasAdicionais, loading: loadingAdicionais } = useProductAdicionais(produto?.id)

  const handleAdicionalChange = (adicionalId: string, categoria: any, novaQuantidade: number) => {
    console.log('🔵 handleAdicionalChange chamado', { adicionalId, novaQuantidade, categoria: categoria?.name })
    
    const newSelected = { ...selectedAdicionais };
    
    if (categoria && categoria.selection_type === 'single') {
      console.log('🔄 Processando seleção única para categoria:', categoria.name)
      categoria.adicionais.forEach((adicional: any) => {
        if (adicional.id !== adicionalId) {
          console.log(`   Removendo seleção de ${adicional.name} (${adicional.id})`)
          delete newSelected[adicional.id];
        }
      })
      
      if (novaQuantidade > 0) {
        console.log(`   Adicionando ${categoria.name}: ${adicionalId} (quantidade: 1)`)
        newSelected[adicionalId] = 1;
      } else {
        console.log(`   Removendo ${categoria.name}: ${adicionalId}`)
        delete newSelected[adicionalId];

    } else {
      // Verificar limite máximo para categorias múltiplas
      if (novaQuantidade > 0 && categoria.max_selection) {
        const totalAtual = categoria.adicionais.reduce((sum: number, adicional: any) => 
          sum + (newSelected[adicional.id] || 0), 0;
        )
        
        const novoTotal = totalAtual + (novaQuantidade - (selectedAdicionais[adicionalId] || 0))
        
        console.log('🔍 Verificando limite máximo:', {
          categoria: categoria.name,
          totalAtual,
          novoTotal,
          maxSelection: categoria.max_selection
        })
        
        if (novoTotal > categoria.max_selection) {
          console.log('❌ LIMITE MÁXIMO ATINGIDO! Não é possível adicionar mais itens')
          return; // Não faz alteração se exceder o limite
        }
      }
      
      if (novaQuantidade > 0) {
        console.log(`   Atualizando quantidade de ${adicionalId} para ${novaQuantidade}`)
        newSelected[adicionalId] = novaQuantidade;
      } else {
        console.log(`   Removendo ${adicionalId} do carrinho`)
        delete newSelected[adicionalId];


    
    console.log('🔄 Estado atualizado (antes do setState):', newSelected)
    setSelectedAdicionais(newSelected)
  };

  const validateRequiredAdicionais = () => {
    console.log('\n🔍 ========== INÍCIO DA VALIDAÇÃO ==========')
    console.log('📊 Total de categorias de adicionais:', categoriasAdicionais.length)
    console.log('🛒 Itens selecionados:', Object.keys(selectedAdicionais).length)
    console.log('📋 Categorias obrigatórias:', categoriasAdicionais
      .filter(cat => cat.is_required)
      .map(cat => ({
        name: cat.name,
        id: cat.id,
        min_selection: cat.min_selection,
        adicionais: cat.adicionais.map(a => ({
          id: a.id,
          name: a.name,
          selected: selectedAdicionais[a.id] || 0
        }))
      }))
    )

    // Se não há categorias obrigatórias, o botão deve estar habilitado
    const hasRequiredCategories = categoriasAdicionais.some(cat => cat.is_required)
    if (!hasRequiredCategories) {
      console.log('ℹ️  Nenhuma categoria obrigatória encontrada. Botão será habilitado.')
      return true;


    for (const categoria of categoriasAdicionais) {
      if (categoria.is_required) {
        console.log('\n🔍 Verificando categoria obrigatória:', {
          nome: categoria.name,
          id: categoria.id,
          tipo_selecao: categoria.selection_type,
          min_selecao: categoria.min_selection,
          total_adicionais: categoria.adicionais.length
        })

        // Verifica se há pelo menos um item selecionado na categoria
        const hasSelection = categoria.adicionais.some((adicional: any) => {
          const isSelected = selectedAdicionais[adicional.id] && selectedAdicionais[adicional.id] > 0;
          console.log(`   ${isSelected ? '✅' : '❌'} ${adicional.name} (${adicional.id}): ${selectedAdicionais[adicional.id] || 0}`)
          return isSelected;
        })
        
        console.log(`📌 ${categoria.name}: ${hasSelection ? 'Tem seleção' : 'Sem seleção'}`)

        // Se não há seleção e a categoria é obrigatória, falha na validação
        if (!hasSelection) {
          console.log(`❌ Falha na validação: Categoria obrigatória "${categoria.name}" sem seleção`)
          return false;
        }

        // Verifica se atende ao mínimo de seleção, se definido
        if (categoria.min_selection && categoria.min_selection > 0) {
          const totalSelected = categoria.adicionais.reduce((sum: number, adicional: any) => 
            sum + (selectedAdicionais[adicional.id] || 0), 0;
          )
          
          console.log(`   🔢 Total selecionado: ${totalSelected} (mínimo requerido: ${categoria.min_selection})`)

          if (totalSelected < categoria.min_selection) {
            console.log(`❌ Falha na validação: Categoria "${categoria.name}" requer no mínimo ${categoria.min_selection} itens (selecionados: ${totalSelected})`)
            return false;
          }
        }


    
    console.log('\n✅ ========== VALIDAÇÃO BEM-SUCEDIDA ==========')
    console.log('✅ Todas as categorias obrigatórias foram preenchidas corretamente')
    return true;
  };

  const calcularPrecoTotal = () => {
    if (!produto) return 0;
    
    // Converter preços para números para evitar NaN
    const priceNumber = Number(produto.price) || 0;
    const promotionalPriceNumber = produto.promotional_price ? Number(produto.promotional_price) : 0;
    
    const precoBase = produto.is_promotional && promotionalPriceNumber 
      ? promotionalPriceNumber ;
      : priceNumber;
    
    const precoAdicionais = Object.entries(selectedAdicionais).reduce((total, [adicionalId, qty]) => {
      const adicional = categoriasAdicionais
        .flatMap(cat => cat.adicionais)
        .find(a => a.id === adicionalId)
      
      const adicionalPrice = adicional ? Number(adicional.price) || 0 : 0;
      return total + (adicionalPrice * qty)
    }, 0)
    
    const totalPrice = (precoBase + precoAdicionais) * quantidade;
    
    console.log('🍕 PDV Modal - Calculando preço:', {
      produto: produto.name,
      precoBase,
      precoAdicionais,
      quantidade,
      totalPrice,
      isNaN: isNaN(totalPrice)
    })
    
    return isNaN(totalPrice) ? 0 : totalPrice;
  };

  const handleSave = async () => {
    if (!produto || !validateRequiredAdicionais()) return;
    
    // Criar objeto com dados completos dos adicionais
    const adicionaisCompletos = Object.entries(selectedAdicionais).reduce((acc, [adicionalId, qty]) => {
      const adicional = categoriasAdicionais
        .flatMap(cat => cat.adicionais)
        .find(a => a.id === adicionalId)
      
      if (adicional && qty > 0) {
        acc[adicionalId] = {
          id: adicional.id,
          name: adicional.name,
          price: Number(adicional.price) || 0,
          quantity: qty
        };

      return acc;
    }, {} as { [key: string]: { id: string; name: string; price: number; quantity: number } })
    
    // Reset modal state primeiro
    setSelectedAdicionais({})
    setObservacao('')
    setQuantidade(1)
    setFiltroAdicionais('')
    
    // Salvar no carrinho
    await onSave(produto, quantidade, adicionaisCompletos)
    
    // Fechar modal imediatamente após salvar
    onClose()
  };

  const adicionaisFiltrados = categoriasAdicionais.map(categoria => ({
    ...categoria,
    adicionais: categoria.adicionais.filter((adicional: any) =>
      adicional.name.toLowerCase().includes(filtroAdicionais.toLowerCase())
    )
  })).filter(categoria => categoria.adicionais.length > 0)

  const categoriasTamanho = adicionaisFiltrados.filter(cat => 
    cat.name.toLowerCase().includes('tamanho') || cat.name.toLowerCase().includes('size') ||
    cat.name.toLowerCase().includes('borda') || cat.name.toLowerCase().includes('massa')
  )
  
  const categoriasIngredientes = adicionaisFiltrados.filter(cat => 
    !cat.name.toLowerCase().includes('tamanho') && !cat.name.toLowerCase().includes('size') &&
    !cat.name.toLowerCase().includes('borda') && !cat.name.toLowerCase().includes('massa')
  )

  const [isAddToCartEnabled, setIsAddToCartEnabled] = useState(false)
  const hasRequiredCategories = categoriasAdicionais.some(cat => cat.is_required)

  // Update isAddToCartEnabled whenever selectedAdicionais or categoriasAdicionais changes
  React.useEffect(() => {
    console.log('🔄 useEffect - Verificando validação de adicionais')
    console.log('📦 Estado atual de selectedAdicionais:', selectedAdicionais)
    console.log('📦 Categorias de adicionais:', categoriasAdicionais.map((c: any) => ({
      name: c.name,
      is_required: c.is_required,
      min_selection: c.min_selection,
      adicionais: c.adicionais.map((a: any) => ({
        id: a.id,
        name: a.name,
        selected: selectedAdicionais[a.id] || 0
      }))
    })))
    
    const isValid = validateRequiredAdicionais()
    console.log('✅ Resultado da validação:', isValid)
    setIsAddToCartEnabled(isValid)
  }, [selectedAdicionais, categoriasAdicionais])

  if (!isOpen || !produto) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl shadow-2xl w-[90vw] h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{produto.name}</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-colors flex-shrink-0 ml-4"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingAdicionais ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando opções...</p>
            </div>
          ) : (
            <>
              {/* Tempo de preparo */}
              {produto.preparation_time && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 bg-gray-50 p-3 rounded-lg">
                  <Clock size={16} />
                  <span>Tempo de preparo: {produto.preparation_time} minutos</span>
                </div>
              )}

              {/* Categorias de tamanho/borda */}
              {categoriasTamanho.map(categoria => (
                <CategorySection
                  key={categoria.id}
                  categoria={categoria}
                  selectedAdicionais={selectedAdicionais}
                  onAdicionalChange={handleAdicionalChange}
                  isSize={true}
                />
              ))}

              {/* Ingredientes extras */}
              {categoriasIngredientes.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">INGREDIENTES EXTRAS</h3>
                  
                  {/* Search Filter */}
                  <div className="mb-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="🔍 Filtrar adicionais..."
                        value={filtroAdicionais}
                        onChange={(e) => setFiltroAdicionais(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* Categorias de ingredientes */}
                  {categoriasIngredientes.map(categoria => (
                    <CategorySection
                      key={categoria.id}
                      categoria={categoria}
                      selectedAdicionais={selectedAdicionais}
                      onAdicionalChange={handleAdicionalChange}
                      isSize={false}
                    />
                  ))}
                </div>
              )}

              {/* Observações */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">OBSERVAÇÕES PARA {produto.name.toUpperCase()}</h3>
                <textarea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
                  rows={3}
                  placeholder="Digite suas observações aqui..."
                />
              </div>

              {/* Mensagem se não houver adicionais */}
              {!loadingAdicionais && categoriasAdicionais.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <span className="text-4xl mb-4">🍕</span>
                  <p className="text-lg">Produto pronto para adicionar ao carrinho!</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <ProductFooter
          produto={produto}
          quantidade={quantidade}
          precoTotal={calcularPrecoTotal()}
          isAddToCartEnabled={isAddToCartEnabled}
          hasRequiredCategories={hasRequiredCategories}
          onQuantidadeChange={setQuantidade}
          onSave={handleSave}
          onClose={onClose}
        />
      </div>
    </div>
  )
};
