
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Categoria {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  order_position: number;
}

interface Produto {
  id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  promotional_price?: number;
  is_promotional: boolean;
  destaque?: boolean;
  categoria_id?: string;
  is_available: boolean;
  preparation_time?: number;
  ingredients?: string;
  company_id: string;
}

export const useCardapioData = (companyId: string | undefined) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      console.log('🔄 useCardapioData: Iniciando fetchData');
      console.log('🏢 Company ID:', companyId);
      
      if (!companyId) {
        console.log('❌ Nenhuma empresa fornecida, aguardando...');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Safety timeout to avoid loading infinito
        const timeoutId = setTimeout(() => {
          console.error('⏳ Tempo limite ao carregar cardápio. Exibindo fallback.');
          setError('Não conseguimos carregar o cardápio agora. Tente novamente.');
          setLoading(false);
        }, 10000);
        
        console.log('📋 Buscando categorias para empresa:', companyId);
        // Buscar categorias
        const { data: cats, error: catsError } = await supabase
          .from('categorias')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .order('order_position', { ascending: true });
          
        if (catsError) {
          console.error('❌ Erro ao buscar categorias:', catsError);
          throw new Error(`Erro ao carregar categorias: ${catsError.message}`);
        }

        console.log('✅ Categorias encontradas:', cats?.length || 0, cats);
        setCategorias(cats || []);

        console.log('🍽️ Buscando produtos para empresa:', companyId);
        // Buscar produtos
        const { data: prods, error: prodsError } = await supabase
          .from('produtos')
          .select('*')
          .eq('company_id', companyId)
          .eq('is_available', true)
          .order('name', { ascending: true });
          
        if (prodsError) {
          console.error('❌ Erro ao buscar produtos:', prodsError);
          throw new Error(`Erro ao carregar produtos: ${prodsError.message}`);
        }

        console.log('✅ Produtos encontrados:', prods?.length || 0, prods);
        setProdutos(prods || []);
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.error('💥 Erro geral no carregamento:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados');
      } finally {
        console.log('✅ Finalizando loading');
        setLoading(false);
      }
    }
    
    fetchData();
  }, [companyId]);

  // Função para agrupar produtos por categoria
  const produtosPorCategoria = (categoriaId: string) => {
    return produtos.filter(produto => produto.categoria_id === categoriaId);
  };

  // Função para buscar produto por ID
  const getProdutoById = (produtoId: string) => {
    return produtos.find(produto => produto.id === produtoId);
  };

  // Função para buscar categoria por ID
  const getCategoriaById = (categoriaId: string) => {
    return categorias.find(categoria => categoria.id === categoriaId);
  };

  return {
    categorias,
    produtos,
    loading,
    error,
    produtosPorCategoria,
    getProdutoById,
    getCategoriaById
  };
};
