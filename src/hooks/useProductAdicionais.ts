import { useState, useEffect } from 'react';

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
        
        console.log('🔍 Buscando adicionais para produto via API Neon:', produtoId);
        
        // Buscar categorias de adicionais associadas ao produto via API
        const response = await fetch(`/api/produto-categorias-adicionais?produto_id=${produtoId}`);
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao carregar categorias do produto');
        }

        const produtoCategorias = result.data || [];

        console.log('📋 Categorias encontradas via API:', produtoCategorias.length);

        if (produtoCategorias.length === 0) {
          setCategorias([]);
          setLoading(false);
          return;
        }

        // Buscar adicionais para cada categoria via API
        const categoriasComAdicionais: CategoriaComAdicionais[] = [];
        
        for (const produtoCategoria of produtoCategorias) {
          const categoria = produtoCategoria.categorias_adicionais;
          if (!categoria) continue;

          console.log('🍕 Buscando adicionais para categoria via API:', categoria.name);

          const adicionaisResponse = await fetch(`/api/adicionais?categoria_adicional_id=${categoria.id}`);
          const adicionaisResult = await adicionaisResponse.json();

          if (!adicionaisResponse.ok || !adicionaisResult.success) {
            console.error('❌ Erro ao buscar adicionais via API:', adicionaisResult.error);
            continue;
          }

          const adicionais = adicionaisResult.data || [];

          console.log('✅ Adicionais encontrados via API:', adicionais.length, 'para categoria:', categoria.name);

          categoriasComAdicionais.push({
            id: categoria.id,
            name: categoria.name,
            description: categoria.description,
            selection_type: categoria.selection_type as 'single' | 'multiple' | 'quantity',
            is_required: produtoCategoria.is_required || categoria.is_required,
            min_selection: produtoCategoria.min_selection || categoria.min_selection,
            max_selection: produtoCategoria.max_selection || categoria.max_selection,
            adicionais: adicionais.map((adicional: any) => ({
              id: adicional.id,
              name: adicional.name,
              description: adicional.description,
              price: adicional.price,
              image: adicional.image,
              is_available: adicional.is_available
            }))
          });
        }

        setCategorias(categoriasComAdicionais);
        console.log('🎉 Total de categorias com adicionais via API:', categoriasComAdicionais.length);
        
      } catch (error) {
        console.error('💥 Erro geral ao carregar adicionais via API:', error);
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