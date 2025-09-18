import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CategoriaAdicional } from '@/types/cardapio';

// Função para fazer requests à API
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

export const useCategoriaAdicionaisCRUD = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editandoCategoria, setEditandoCategoria] = useState<string | null>(null);
  const [categoriaEditada, setCategoriaEditada] = useState<Partial<CategoriaAdicional & { associacao_id?: string }>>({});

  const handleEditarCategoria = (categoria: CategoriaAdicional, produtoCategoriasAdicionais: any[]) => {
    const associacao = produtoCategoriasAdicionais.find(
      pca => pca.categoria_adicional_id === categoria.id
    );
    
    setEditandoCategoria(categoria.id);
    setCategoriaEditada({
      ...categoria,
      is_required: associacao?.is_required ?? categoria.is_required,
      min_selection: associacao?.min_selection ?? categoria.min_selection,
      max_selection: associacao?.max_selection ?? categoria.max_selection,
      associacao_id: associacao?.id
    });
  };

  const handleSalvarEdicaoCategoria = async () => {
    if (!editandoCategoria || !categoriaEditada.name) return;

    try {
      setLoading(true);
      
      if (categoriaEditada.associacao_id) {
        await apiRequest('/api/categoria-adicionais/associacao', {
          method: 'PUT',
          body: JSON.stringify({
            id: categoriaEditada.associacao_id,
            is_required: categoriaEditada.is_required,
            min_selection: categoriaEditada.min_selection,
            max_selection: categoriaEditada.max_selection
          })
        });
      }

      const selection_type = 
        (categoriaEditada.max_selection || 1) === 1 ? 'single' : 
        (categoriaEditada.max_selection || 1) > 1 ? 'multiple' : 'quantity';

      await apiRequest('/api/categoria-adicionais', {
        method: 'PUT',
        body: JSON.stringify({
          id: editandoCategoria,
          name: categoriaEditada.name,
          description: categoriaEditada.description,
          selection_type
        })
      });

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      setEditandoCategoria(null);
      setCategoriaEditada({});
      return true;
    } catch (error) {
      console.error('Erro ao editar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao editar categoria",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const desassociarCategoriaAdicional = async (associacaoId: string) => {
    try {
      await apiRequest(`/api/produto-categorias-adicionais/${associacaoId}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Erro ao desassociar categoria:', error);
      return false;
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoCategoria(null);
    setCategoriaEditada({});
  };

  return {
    // Estado
    loading,
    editandoCategoria,
    categoriaEditada,
    
    // Setters
    setEditandoCategoria,
    setCategoriaEditada,
    
    // Handlers
    handleEditarCategoria,
    handleSalvarEdicaoCategoria,
    desassociarCategoriaAdicional,
    handleCancelarEdicao
  };
};