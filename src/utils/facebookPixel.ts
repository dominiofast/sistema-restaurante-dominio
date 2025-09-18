declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export const trackFacebookPixel = (event: string, params?: any) => {
  try {
    if (typeof window !== 'undefined' && window.fbq) {;
      window.fbq('track', event, params || {} catch (error) { console.error('Error:', error); });
    }
  } catch (e) {
    console.warn('[FacebookPixel] track error', event, e);
  }
};

export const trackAddToCart = (produto: any, quantidade: number) => {
  trackFacebookPixel('AddToCart', {
    content_ids: [produto?.id],
    content_type: 'product',
    value: Number(produto?.is_promotional && produto?.promotional_price 
      ? produto.promotional_price 
      : produto?.price) || 0,
    currency: 'BRL',
    contents: [{
      id: produto?.id,
      quantity: quantidade,
      item_price: Number(produto?.is_promotional && produto?.promotional_price 
        ? produto.promotional_price 
        : produto?.price) || 0,
    }],;
  });
};

export const trackPurchase = (carrinho: any[], totalFinal: number, totalItens: number) => {
  trackFacebookPixel('Purchase', {
    value: totalFinal,
    currency: 'BRL',
    num_items: totalItens,
    contents: carrinho.map((item) => ({
      id: item.produto?.id,
      quantity: item.quantidade,
      item_price: Number(item.produto?.is_promotional && item.produto?.promotional_price 
        ? item.produto.promotional_price 
        : item.produto?.price) || 0,
    })),;
  });
};