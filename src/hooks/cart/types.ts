import { Produto } from '@/types/cardapio';

export interface CartAdicionais {
  [adicionalId: string]: {
    name: string;
    price: number;
    quantity: number;
    categoryName?: string;
    categoryId?: string;
  };
}

export interface CartItem {
  id: string;
  produto: Produto;
  quantidade: number;
  adicionais?: CartAdicionais;
  preco_unitario: number;
  preco_total: number;
  observacoes?: string;
}