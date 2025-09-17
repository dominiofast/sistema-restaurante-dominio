
import { supabase } from '@/integrations/supabase/client';
import { CardapioJsonService } from './cardapioJsonService';

interface CardapioData {
  categorias: Array<{
    id: string;
    name: string;
    description?: string;
    produtos: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      promotional_price?: number;
      is_promotional: boolean;
      is_available: boolean;
      preparation_time?: number;
      ingredients?: string;
    }>;
  }>;
}

export class CardapioService {
  /**
   * Busca o cardápio completo de uma empresa para uso pelo Agente IA
   */
  static async getCardapioForAI(companyId: string): Promise<CardapioData | null> {
    try {
      console.log('🍽️ Buscando cardápio para IA - Company:', companyId);

      // Buscar categorias ativas
      const { data: categorias, error: categoriasError } = await supabase
        .from('categorias')
        .select('id, name, description')
        .eq('company_id', companyId)
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (categoriasError) {
        console.error('❌ Erro ao buscar categorias:', categoriasError);
        return null;
      }

      // Buscar produtos disponíveis
      const { data: produtos, error: produtosError } = await supabase
        .from('produtos')
        .select('id, name, description, price, promotional_price, is_promotional, is_available, preparation_time, ingredients, categoria_id')
        .eq('company_id', companyId)
        .eq('is_available', true);

      if (produtosError) {
        console.error('❌ Erro ao buscar produtos:', produtosError);
        return null;
      }

      // Organizar produtos por categoria
      const cardapioData: CardapioData = {
        categorias: (categorias || []).map(categoria => ({
          id: categoria.id,
          name: categoria.name,
          description: categoria.description || undefined,
          produtos: (produtos || [])
            .filter(produto => produto.categoria_id === categoria.id)
            .map(produto => ({
              id: produto.id,
              name: produto.name,
              description: produto.description || undefined,
              price: Number(produto.price),
              promotional_price: produto.promotional_price ? Number(produto.promotional_price) : undefined,
              is_promotional: produto.is_promotional || false,
              is_available: produto.is_available,
              preparation_time: produto.preparation_time || undefined,
              ingredients: produto.ingredients || undefined,
            }))
        }))
      };

      console.log('✅ Cardápio carregado para IA:', {
        categorias: cardapioData.categorias.length,
        totalProdutos: cardapioData.categorias.reduce((acc, cat) => acc + cat.produtos.length, 0)
      });

      return cardapioData;
    } catch (error) {
      console.error('❌ Erro ao buscar cardápio para IA:', error);
      return null;
    }
  }

  /**
   * Formata o cardápio em texto para o prompt do Agente IA
   */
  static formatCardapioForPrompt(cardapioData: CardapioData): string {
    if (!cardapioData || cardapioData.categorias.length === 0) {
      return 'Nenhum produto disponível no momento.';
    }

    let cardapioText = 'CARDÁPIO DISPONÍVEL:\n\n';

    cardapioData.categorias.forEach(categoria => {
      cardapioText += `## ${categoria.name}\n`;
      if (categoria.description) {
        cardapioText += `${categoria.description}\n`;
      }
      cardapioText += '\n';

      categoria.produtos.forEach(produto => {
        cardapioText += `**${produto.name}**\n`;
        if (produto.description) {
          cardapioText += `${produto.description}\n`;
        }
        if (produto.ingredients) {
          cardapioText += `Ingredientes: ${produto.ingredients}\n`;
        }
        
        const precoAtual = produto.is_promotional && produto.promotional_price 
          ? produto.promotional_price 
          : produto.price;
        
        cardapioText += `Preço: R$ ${precoAtual.toFixed(2)}`;
        
        if (produto.is_promotional && produto.promotional_price) {
          cardapioText += ` (Promoção! De R$ ${produto.price.toFixed(2)})`;
        }
        
        if (produto.preparation_time) {
          cardapioText += ` - Tempo de preparo: ${produto.preparation_time} min`;
        }
        
        cardapioText += '\n\n';
      });
    });

    return cardapioText;
  }

  /**
   * Gera JSON estruturado do cardápio para alimentar a IA
   */
  static async getCardapioJsonForAI(companyId: string): Promise<any | null> {
    try {
      const cardapioJson = await CardapioJsonService.generateCardapioJson(companyId);
      if (!cardapioJson) return null;

      return CardapioJsonService.formatJsonToText(cardapioJson);
    } catch (error) {
      console.error('❌ Erro ao gerar JSON estruturado:', error);
      return null;
    }
  }
}
