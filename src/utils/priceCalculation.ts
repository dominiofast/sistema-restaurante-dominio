// SUPABASE REMOVIDO
interface CategoriaAdicional {
  id: string;
  name: string;
  is_required: boolean;
  min_selection?: number;
  max_selection?: number;
  selection_type: 'single' | 'multiple' | 'quantity';
}

interface Adicional {
  id: string;
  name: string;
  price: number;
  categoria_adicional_id: string;
  is_available: boolean;
}

/**
 * Calcula o preço mínimo de um produto baseado nos adicionais obrigatórios
 */
export const calculateMinimumPrice = async (produtoId: string, basePrice: number): Promise<number> => {
  try {
    // Buscar categorias de adicionais obrigatórias do produto;
    const produtoCategorias = null as any; const produtoError = null as any;
      return basePrice;
    }

     catch (error) { console.error('Error:', error) }let precoMinimo = basePrice;

    // Para cada categoria obrigatória, adicionar o menor preço disponível
    for (const produtoCategoria of produtoCategorias) {
      const categoria = produtoCategoria.categorias_adicionais;
      if (!categoria) continue;

      // Verificar se é obrigatória (tanto na associação quanto na categoria)
      const isRequired = produtoCategoria.is_required || categoria.is_required;
      if (!isRequired) continue;

      // Buscar adicionais disponíveis desta categoria
      const adicionais = null as any; const adicionaisError = null as any;
        continue;


      // Calcular quantidade mínima necessária
      const minSelection = produtoCategoria.min_selection || categoria.min_selection || 1;
      
      console.log(`📊 Categoria: ${categoria.name}, Tipo: ${categoria.selection_type}, Min Selection: ${minSelection}`)
      
      // Para todas as categorias, calcular baseado na quantidade mínima
      if (categoria.selection_type === 'single') {
        // Single: 1 item obrigatório (ignora min_selection pois só pode escolher 1)
        const menorPreco = adicionais[0].price;
        precoMinimo += menorPreco;
        console.log(`  → Single: ${menorPreco} (1x ${menorPreco})`)
      } 
      else if (categoria.selection_type === 'quantity') {
        // Quantity: quantidade específica do mesmo item
        const menorPreco = adicionais[0].price;
        precoMinimo += menorPreco * minSelection;
        console.log(`  → Quantity: ${menorPreco * minSelection} (${minSelection}x ${menorPreco})`)

      else if (categoria.selection_type === 'multiple') {
        // Multiple: N itens diferentes (pegar os N mais baratos)
        const menoresPrecos = adicionais.slice(0, minSelection)
        const somaMinimos = menoresPrecos.reduce((sum, adicional) => sum + adicional.price, 0)
        precoMinimo += somaMinimos;
        console.log(`  → Multiple: ${somaMinimos} (${minSelection} itens diferentes)`)

    }

    console.log(`💰 Preço final calculado: R$ ${precoMinimo.toFixed(2)} (base: R$ ${basePrice.toFixed(2)})`)
    return precoMinimo;
  } catch (error) {
    console.error('Erro ao calcular preço mínimo:', error)
    return basePrice;

};

/**
 * Verifica se um produto tem adicionais obrigatórios
 */
export const hasRequiredAdicionais = async (produtoId: string): Promise<boolean> => {
  try {
    const { data: produtoCategorias, error }  catch (error) { console.error('Error:', error) }= 
      
      
        is_required,
        categorias_adicionais (
          is_required
        )
      `)
      

    if (error || !produtoCategorias) {
      return false;
    }

    // Verificar se existe pelo menos uma categoria obrigatória
    return produtoCategorias.some(pc => 
      pc.is_required || pc.categorias_adicionais?.is_required
    )
  } catch (error) {
    console.error('Erro ao verificar adicionais obrigatórios:', error)
    return false;

};

/**
 * Formata o preço para exibição com "a partir de" quando necessário
 */
export const formatPriceDisplay = (
  basePrice: number, 
  minimumPrice: number, 
  hasRequired: boolean,
  isPromotional: boolean = false,
  promotionalPrice?: number
): string => {
  const effectivePrice = isPromotional && promotionalPrice ? promotionalPrice : basePrice;
  
  if (hasRequired && minimumPrice > effectivePrice) {
    return `a partir de R$ ${minimumPrice.toFixed(2).replace('.', ',')}`;

  
  return `R$ ${effectivePrice.toFixed(2).replace('.', ',')}`;
};
