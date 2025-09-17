
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CategoriaAdicional {
  id: string;
  name: string;
  description?: string;
  selection_type: 'single' | 'multiple' | 'quantity';
  is_required: boolean;
  min_selection?: number;
  max_selection?: number;
}

interface Adicional {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  is_available: boolean;
}

interface CategoriaComAdicionais extends CategoriaAdicional {
  adicionais: Adicional[];
}

export const useProductAdicionais = (produtoId: string | undefined) => {
  const [categorias, setCategorias] = useState<CategoriaComAdicionais[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAdicionais() {
      if (!produtoId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Buscando adicionais para produto:', produtoId);
        
        // Buscar categorias de adicionais associadas ao produto
        const { data: produtoCategorias, error: produtoError } = await supabase
          .from('produto_categorias_adicionais')
          .select(`
            categoria_adicional_id,
            is_required,
            min_selection,
            max_selection,
            order_position,
            categorias_adicionais (
              id,
              name,
              description,
              selection_type,
              is_required,
              min_selection,
              max_selection
            )
          `)
          .eq('produto_id', produtoId)
          .order('order_position', { ascending: true });

        if (produtoError) {
          console.error('❌ Erro ao buscar categorias do produto:', produtoError);
          throw new Error(`Erro ao carregar categorias: ${produtoError.message}`);
        }

        console.log('📋 Categorias encontradas:', produtoCategorias?.length || 0);

        if (!produtoCategorias || produtoCategorias.length === 0) {
          setCategorias([]);
          setLoading(false);
          return;
        }

        // Buscar adicionais para cada categoria
        const categoriasComAdicionais: CategoriaComAdicionais[] = [];
        
        for (const produtoCategoria of produtoCategorias) {
          const categoria = produtoCategoria.categorias_adicionais;
          if (!categoria) continue;

          console.log('🍕 Buscando adicionais para categoria:', categoria.name);

          const { data: adicionais, error: adicionaisError } = await supabase
            .from('adicionais')
            .select('*')
            .eq('categoria_adicional_id', categoria.id)
            .eq('is_available', true)
            .eq('is_active', true)
            .order('order_position', { ascending: true, nullsFirst: false })
            .order('name', { ascending: true });

          if (adicionaisError) {
            console.error('❌ Erro ao buscar adicionais:', adicionaisError);
            continue;
          }

          console.log('✅ Adicionais encontrados:', adicionais?.length || 0, 'para categoria:', categoria.name);

          categoriasComAdicionais.push({
            id: categoria.id,
            name: categoria.name,
            description: categoria.description,
            selection_type: categoria.selection_type as 'single' | 'multiple' | 'quantity',
            is_required: produtoCategoria.is_required || categoria.is_required,
            min_selection: produtoCategoria.min_selection || categoria.min_selection,
            max_selection: produtoCategoria.max_selection || categoria.max_selection,
            adicionais: adicionais || []
          });
        }

        setCategorias(categoriasComAdicionais);
        console.log('🎉 Total de categorias com adicionais:', categoriasComAdicionais.length);
        
      } catch (error) {
        console.error('💥 Erro geral ao carregar adicionais:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar adicionais');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAdicionais();
  }, [produtoId]);

  return {
    categorias,
    loading,
    error
  };
};
