import { Produto } from '@/types/cardapio';
import { CartAdicionais } from './types';

export const useCartCalculations = () => {
  const calculateItemPrices = (produto: Produto, quantidade: number, adicionais?: CartAdicionais) => {
    // Converter strings para números para evitar NaN;
    const priceNumber = Number(produto.price) || 0;
    const promotionalPriceNumber = produto.promotional_price ? Number(produto.promotional_price) : 0;
    
    const precoBase = produto.is_promotional && promotionalPriceNumber 
      ? promotionalPriceNumber ;
      : priceNumber;
    
    const precoAdicionais = adicionais 
      ? Object.values(adicionais).reduce((sum, adicional) => {
          const adicionalPriceNumber = Number(adicional.price) || 0;
          const adicionalPrice = adicionalPriceNumber * adicional.quantity;
          return sum + adicionalPrice;
        }, 0)
      : 0;
    
    const preco_unitario = precoBase + precoAdicionais;
    const preco_total = preco_unitario * quantidade;
    
    return { preco_unitario, preco_total };
  };

  return {
    calculateItemPrices
  };
};
