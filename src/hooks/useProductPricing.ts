import { useState, useEffect } from 'react';
import { calculateMinimumPrice, hasRequiredAdicionais } from '@/utils/priceCalculation';

interface ProductPricing {
  minimumPrice: number;
  hasRequired: boolean;
  loading: boolean;
}

/**
 * Hook para calcular preços de produtos com adicionais obrigatórios
 */
export const useProductPricing = (produtoId: string | undefined, basePrice: number) => {
  const [pricing, setPricing] = useState<ProductPricing>({
    minimumPrice: basePrice,
    hasRequired: false,
    loading: true
  });

  useEffect(() => {
    if (!produtoId) {
      setPricing({
        minimumPrice: basePrice,
        hasRequired: false,
        loading: false
      });
      return;
    }

    const calculatePricing = async () => {
      try {
        setPricing(prev => ({ ...prev, loading: true }));

        // Verificar se tem adicionais obrigatórios em paralelo com o cálculo do preço mínimo
        const [hasRequired, minimumPrice] = await Promise.all([
          hasRequiredAdicionais(produtoId),
          calculateMinimumPrice(produtoId, basePrice)
        ]);

        setPricing({
          minimumPrice,
          hasRequired,
          loading: false
        });
      } catch (error) {
        console.error('Erro ao calcular pricing do produto:', error);
        setPricing({
          minimumPrice: basePrice,
          hasRequired: false,
          loading: false
        });
      }
    };

    calculatePricing();
  }, [produtoId, basePrice]);

  return pricing;
};