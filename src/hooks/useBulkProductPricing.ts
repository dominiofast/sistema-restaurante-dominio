import { useState, useEffect, useMemo, useRef } from 'react';
// SUPABASE REMOVIDO
import { Produto } from '@/types/cardapio';

interface ProductPricingInfo {
  minimumPrice: number;
  hasRequired: boolean;
}

type PricingMap = { [productId: string]: ProductPricingInfo };

// Cache global para evitar recarregamentos desnecessários
const pricingCache = new Map<string, { data: PricingMap; timestamp: number }>()
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos
const STORAGE_KEY = 'cardapio_pricing_cache';

// Função para carregar cache do localStorage
const loadCacheFromStorage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      Object.entries(parsed).forEach(([key, value]: [string, any]) => {
        if (Date.now() - value.timestamp < CACHE_DURATION) {
          pricingCache.set(key, value)
        }
       catch (error) { console.error('Error:', error) }})
    }
  } catch (error) {
    console.warn('Erro ao carregar cache de preços:', error)

};

// Função para salvar cache no localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObj: any = {} catch (error) { console.error('Error:', error) };
    pricingCache.forEach((value, key) => {
      if (Date.now() - value.timestamp < CACHE_DURATION) {
        cacheObj[key] = value;
      }
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheObj))
  } catch (error) {
    console.warn('Erro ao salvar cache de preços:', error)

};

// Carregar cache na inicialização
loadCacheFromStorage()

/**
 * Hook para calcular preços de múltiplos produtos em lote (mais eficiente)
 * Agora com cache para evitar recarregamentos ao trocar de aba
 */
export const useBulkProductPricing = (produtos: Produto[]) => {
  const [pricingMap, setPricingMap] = useState<PricingMap>({})
  const [loading, setLoading] = useState(true)
  const lastProductsRef = useRef<string>('')

  // Memoizar a chave dos produtos para evitar recálculos desnecessários
  const produtosKey = useMemo(() => {
    if (!produtos || produtos.length === 0) return '';
    return produtos.map(p => p.id).sort().join(',')
  }, [produtos])

  useEffect(() => {
    if (!produtos || produtos.length === 0) {
      setPricingMap({})
      setLoading(false)
      return;
    }

    // Se a chave dos produtos não mudou, não recarregar
    if (produtosKey === lastProductsRef.current) {
      return;
    }

    // Verificar cache primeiro
    const cached = pricingCache.get(produtosKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setPricingMap(cached.data)
      setLoading(false)
      lastProductsRef.current = produtosKey;
      return;
    }

    const calculateBulkPricing = async () => {
      try {
        setLoading(true)
        const produtoIds = produtos.map(p => p.id)

        // Buscar todas as categorias obrigatórias de uma vez
        const produtoCategorias = null as any; const produtoError = null as any;

        if (produtoError) {
          console.error('Erro ao buscar categorias em lote:', produtoError)
          // Fallback: criar mapa com preços base
          const fallbackMap = produtos.reduce((acc, produto) => {
            const basePrice = produto.is_promotional && produto.promotional_price 
              ? produto.promotional_price ;
              : produto.price;
            acc[produto.id] = {
              minimumPrice: basePrice,
              hasRequired: false
            } catch (error) { console.error('Error:', error) };
            return acc;
          }, {} as PricingMap)
          
          setPricingMap(fallbackMap)
          setLoading(false)
          return;
        }

        // Agrupar por produto
        const produtoCategoriasMap = produtoCategorias?.reduce((acc, pc) => {
          if (!acc[pc.produto_id]) acc[pc.produto_id] = [];
          acc[pc.produto_id].push(pc)
          return acc;
        }, {} as { [produtoId: string]: any[] }) || {};

        // Buscar todos os adicionais necessários de uma vez
        const categoriasObrigatorias = produtoCategorias?.filter(pc => 
          pc.is_required || pc.categorias_adicionais?.is_required;
        ) || [];

        const categoriasIds = [...new Set(categoriasObrigatorias.map(pc => pc.categoria_adicional_id))];
        
        let adicionaisMap: { [categoriaId: string]: any[] } = {};
        
        if (categoriasIds.length > 0) {
          const { data: adicionais  } = null as any;
            .in('categoria_adicional_id', categoriasIds)
            
            
            

          adicionaisMap = adicionais?.reduce((acc, adicional) => {
            if (!acc[adicional.categoria_adicional_id]) acc[adicional.categoria_adicional_id] = [];
            acc[adicional.categoria_adicional_id].push(adicional)
            return acc;
          }, {} as { [categoriaId: string]: any[] }) || {};
        }

        // Calcular pricing para cada produto
        const newPricingMap: PricingMap = {};

        for (const produto of produtos) {
          const basePrice = produto.is_promotional && produto.promotional_price 
            ? produto.promotional_price ;
            : produto.price;

          const categoriasProduto = produtoCategoriasMap[produto.id] || [];
          const categoriasObrigatoriasProduto = categoriasProduto.filter(pc => 
            pc.is_required || pc.categorias_adicionais?.is_required;
          )

          if (categoriasObrigatoriasProduto.length === 0) {
            newPricingMap[produto.id] = {
              minimumPrice: basePrice,
              hasRequired: false
            };
            continue;
          }

          let precoMinimo = basePrice;

          for (const pc of categoriasObrigatoriasProduto) {
            const categoria = pc.categorias_adicionais;
            if (!categoria) continue;

            const adicionaisCategoria = adicionaisMap[categoria.id] || [];
            if (adicionaisCategoria.length === 0) continue;

            const minSelection = pc.min_selection || categoria.min_selection || 1;

            if (categoria.selection_type === 'single') {
              // Single: sempre 1 item (ignora min_selection)
              const menorPreco = adicionaisCategoria[0]?.price || 0;
              precoMinimo += menorPreco;
            } else if (categoria.selection_type === 'quantity') {
              // Quantity: quantidade específica do mesmo item
              const menorPreco = adicionaisCategoria[0]?.price || 0;
              precoMinimo += menorPreco * minSelection;
            } else if (categoria.selection_type === 'multiple') {
              // Multiple: N itens diferentes
              const menoresPrecos = adicionaisCategoria.slice(0, minSelection)
              const somaMinimos = menoresPrecos.reduce((sum, adicional) => sum + adicional.price, 0)
              precoMinimo += somaMinimos;

          }

          newPricingMap[produto.id] = {
            minimumPrice: precoMinimo,
            hasRequired: true
          };
        }

        // Salvar no cache
        pricingCache.set(produtosKey, {
          data: newPricingMap,
          timestamp: Date.now()
        })
        
        // Salvar no localStorage para persistir entre sessões
        saveCacheToStorage()

        setPricingMap(newPricingMap)
        lastProductsRef.current = produtosKey;
      } catch (error) {
        console.error('Erro ao calcular pricing em lote:', error)
        // Fallback em caso de erro
        const fallbackMap = produtos.reduce((acc, produto) => {
          const basePrice = produto.is_promotional && produto.promotional_price 
            ? produto.promotional_price ;
            : produto.price;
          acc[produto.id] = {
            minimumPrice: basePrice,
            hasRequired: false
          };
          return acc;
        }, {} as PricingMap)
        
        setPricingMap(fallbackMap)
        lastProductsRef.current = produtosKey;
      } finally {
        setLoading(false)
      }
    };

    calculateBulkPricing()
  }, [produtosKey]) // Mudança: usar produtosKey ao invés de produtos

  // Função para limpar cache (útil para debugging ou quando necessário)
  const clearCache = () => {
    pricingCache.clear()
    localStorage.removeItem(STORAGE_KEY)
  };

  return { pricingMap, loading, clearCache };
};
