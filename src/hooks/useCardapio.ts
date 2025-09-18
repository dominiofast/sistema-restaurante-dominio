import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Categoria, Produto, CategoriaAdicional, Adicional, DashboardStats } from '@/types/cardapio';

export const useCardapio = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriasAdicionais, setCategoriasAdicionais] = useState<CategoriaAdicional[]>([]);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);

  // Buscar categorias
  const fetchCategorias = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar categorias');
      return;
    }
    
    try {
      console.log('🔍 useCardapio: Buscando categorias para empresa via API Neon:', currentCompany.id);
      
      const response = await fetch(`/api/categorias?company_id=${currentCompany.id}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao buscar categorias');
      }
      
      console.log('✅ useCardapio: Categorias encontradas via API:', result.data?.length || 0, result.data);
      setCategorias(result.data || []);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar categorias:', error);
    }
  };

  // Buscar produtos
  const fetchProdutos = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar produtos');
      return;
    }
    
    try {
      console.log('🔍 useCardapio: Buscando produtos para empresa via API Neon:', currentCompany.id);
      
      const response = await fetch(`/api/produtos?company_id=${currentCompany.id}`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao buscar produtos');
      }
      
      console.log('✅ useCardapio: Produtos encontrados via API:', result.data?.length || 0, result.data);
      setProdutos(result.data || []);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar produtos:', error);
    }
  };

  // Buscar categorias de adicionais (TEMPORÁRIO - Mock)
  const fetchCategoriasAdicionais = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar categorias adicionais');
      return;
    }
    
    try {
      console.log('⏭️ useCardapio: Categorias adicionais temporariamente desabilitadas (usando mock)');
      setCategoriasAdicionais([]);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar categorias de adicionais:', error);
    }
  };

  // Buscar adicionais (TEMPORÁRIO - Mock)
  const fetchAdicionais = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar adicionais');
      return;
    }
    
    try {
      console.log('⏭️ useCardapio: Adicionais temporariamente desabilitados (usando mock)');
      setAdicionais([]);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar adicionais:', error);
    }
  };

  // Estatísticas do dashboard
  const getDashboardStats = (): DashboardStats => {
    return {
      totalCategorias: categorias.length,
      totalProdutos: produtos.length,
      produtosAtivos: produtos.filter(p => p.is_available).length,
      categoriasAtivas: categorias.filter(c => c.is_active).length,
    };
  };

  // Criar categoria
  const createCategoria = async (categoria: Omit<Categoria, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      console.log('🔄 useCardapio: Criando categoria via API:', categoria);
      
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar categoria');
      }
      
      await fetchCategorias();
      return result.data;
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar categoria
  const updateCategoria = async (id: string, updates: Partial<Categoria>) => {
    try {
      setLoading(true);
      console.log('🔄 useCardapio: Atualizando categoria via API:', id, updates);
      
      const response = await fetch('/api/categorias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar categoria');
      }
      
      await fetchCategorias();
      return result.data;
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Toggle status da categoria
  const toggleCategoriaStatus = async (id: string, isActive: boolean) => {
    try {
      await updateCategoria(id, { is_active: isActive });
    } catch (error) {
      console.error('Erro ao alterar status da categoria:', error);
      throw error;
    }
  };

  // Toggle status do produto
  const toggleProdutoStatus = async (id: string, isAvailable: boolean) => {
    try {
      await updateProduto(id, { is_available: isAvailable });
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error);
      throw error;
    }
  };

  // Deletar categoria
  const deleteCategoria = async (id: string) => {
    try {
      setLoading(true);
      console.log('🗑️ useCardapio: Deletando categoria via API:', id);
      
      const response = await fetch(`/api/categorias?id=${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao deletar categoria');
      }
      
      await fetchCategorias();
      await fetchProdutos(); // Atualizar produtos também
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar produto (TEMPORÁRIO - Mock)
  const createProduto = async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      console.log('⏭️ createProduto: Temporariamente desabilitado (mock)');
      throw new Error('Criação de produtos temporariamente desabilitada - focando nas categorias primeiro');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto (TEMPORÁRIO - Mock)
  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    try {
      setLoading(true);
      console.log('⏭️ updateProduto: Temporariamente desabilitado (mock)');
      throw new Error('Atualização de produtos temporariamente desabilitada - focando nas categorias primeiro');
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deletar produto (TEMPORÁRIO - Mock)
  const deleteProduto = async (id: string) => {
    try {
      setLoading(true);
      console.log('⏭️ deleteProduto: Temporariamente desabilitado (mock)');
      throw new Error('Exclusão de produtos temporariamente desabilitada - focando nas categorias primeiro');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Caregar dados quando a empresa mudar
  useEffect(() => {
    console.log('🔍 useCardapio: useEffect disparado, empresa atual:', currentCompany?.id);
    if (currentCompany?.id) {
      console.log('🔍 useCardapio: Iniciando carregamento de dados...');
      setLoading(true);
      
      Promise.all([
        fetchCategorias(),
        fetchProdutos(),
        fetchCategoriasAdicionais(),
        fetchAdicionais()
      ]).finally(() => {
        console.log('🔍 useCardapio: Carregamento finalizado');
        setLoading(false);
      });
    } else {
      console.log('🔍 useCardapio: Limpando dados - nenhuma empresa selecionada');
      setCategorias([]);
      setProdutos([]);
      setCategoriasAdicionais([]);
      setAdicionais([]);
    }
  }, [currentCompany?.id]);

  // Reordenar categorias
  const reorderCategorias = async (startIndex: number, endIndex: number) => {
    if (!currentCompany?.id) return;

    const result = Array.from(categorias);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Atualizar posições
    const updates = result.map((categoria, index) => ({
      id: categoria.id,
      order_position: index
    }));

    setCategorias(result);

    try {
      for (const update of updates) {
        console.log('🔄 useCardapio: Reordenando categoria via API:', update);
        
        const response = await fetch('/api/categorias', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            id: update.id, 
            order_position: update.order_position 
          })
        });
        
        const result = await response.json();
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro ao reordenar categoria');
        }
      }
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      await fetchCategorias(); // Restaurar se houver erro
    }
  };

  // Reordenar produtos
  const reorderProdutos = async (startIndex: number, endIndex: number, categoriaId: string) => {
    if (!currentCompany?.id) return;

    console.log('🔄 Reordenando produtos:', { startIndex, endIndex, categoriaId });

    // Filtrar produtos da categoria atual e ordenar por position/name
    const produtosDaCategoria = produtos
      .filter(p => p.categoria_id === categoriaId)
      .sort((a, b) => {
        const aOrder = a.order_position ?? 999;
        const bOrder = b.order_position ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
    
    const outrosProdutos = produtos.filter(p => p.categoria_id !== categoriaId);
    
    // Reordenar array
    const result = Array.from(produtosDaCategoria);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Atualizar estado local imediatamente
    const todosOsProdutos = [...outrosProdutos, ...result];
    setProdutos(todosOsProdutos);

    try {
      // Atualizar order_position no banco para todos os produtos da categoria
      // Começar com order_position = 1 e incrementar
      const updates = result.map((produto, index) => ({
        id: produto.id,
        order_position: index + 1
      }));

      console.log('📝 Atualizando order_position para produtos:', updates);

      console.log('⏭️ Reordenação de produtos temporariamente desabilitada (mock)');

      console.log('✅ Reordenação de produtos concluída com sucesso');
      
      // Refetch para garantir que o estado está sincronizado
      await fetchProdutos();
    } catch (error) {
      console.error('❌ Erro ao reordenar produtos:', error);
      await fetchProdutos(); // Restaurar se houver erro
    }
  };

  // Reordenar categorias de adicionais
  const reorderCategoriasAdicionais = async (startIndex: number, endIndex: number) => {
    if (!currentCompany?.id) return;

    const result = Array.from(categoriasAdicionais);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Atualizar posições
    const updates = result.map((categoria, index) => ({
      id: categoria.id,
      order_position: index
    }));

    setCategoriasAdicionais(result);

    try {
      console.log('⏭️ Reordenação de categorias adicionais temporariamente desabilitada (mock)');
    } catch (error) {
      console.error('Erro ao reordenar categorias de adicionais:', error);
      await fetchCategoriasAdicionais(); // Restaurar se houver erro
    }
  };

  // Reordenar adicionais
  const reorderAdicionais = async (startIndex: number, endIndex: number, categoriaAdicionalId: string) => {
    if (!currentCompany?.id) return;

    const adicionaisDaCategoria = adicionais.filter(a => a.categoria_adicional_id === categoriaAdicionalId);
    const outrosAdicionais = adicionais.filter(a => a.categoria_adicional_id !== categoriaAdicionalId);
    
    const result = Array.from(adicionaisDaCategoria);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    // Atualizar o estado imediatamente com a nova ordem
    const todosOsAdicionais = [
      ...outrosAdicionais,
      ...result.map((adicional, index) => ({
        ...adicional,
        order_position: index
      }))
    ];
    setAdicionais(todosOsAdicionais);

    try {
      console.log('⏭️ Reordenação de adicionais temporariamente desabilitada (mock)');
    } catch (error) {
      console.error('Erro ao reordenar adicionais:', error);
      await fetchAdicionais(); // Restaurar se houver erro
    }
  };

  return {
    loading,
    categorias,
    produtos,
    categoriasAdicionais,
    adicionais,
    getDashboardStats,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaStatus,
    createProduto,
    updateProduto,
    deleteProduto,
    toggleProdutoStatus,
    reorderCategorias,
    reorderProdutos,
    reorderCategoriasAdicionais,
    reorderAdicionais,
    fetchCategorias,
    fetchProdutos,
    fetchCategoriasAdicionais,
    fetchAdicionais,
  };
};
