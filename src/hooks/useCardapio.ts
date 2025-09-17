import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      console.log('🔍 useCardapio: Buscando categorias para empresa:', currentCompany.id);
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('order_position', { ascending: true });
        
      if (error) {
        console.error('❌ useCardapio: Erro ao buscar categorias:', error);
        throw error;
      }
      
      console.log('✅ useCardapio: Categorias encontradas:', data?.length || 0, data);
      setCategorias(data || []);
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
      console.log('🔍 useCardapio: Buscando produtos para empresa:', currentCompany.id);
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias (
            id,
            name
          )
        `)
        .eq('company_id', currentCompany.id)
         .order('order_position', { ascending: true, nullsFirst: false })
         .order('name', { ascending: true });
        
      if (error) {
        console.error('❌ useCardapio: Erro ao buscar produtos:', error);
        throw error;
      }
      
      console.log('✅ useCardapio: Produtos encontrados:', data?.length || 0, data);
      setProdutos(data || []);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar produtos:', error);
    }
  };

  // Buscar categorias de adicionais
  const fetchCategoriasAdicionais = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar categorias adicionais');
      return;
    }
    
    try {
      console.log('🔍 useCardapio: Buscando categorias adicionais para empresa:', currentCompany.id);
      const { data, error } = await supabase
        .from('categorias_adicionais')
        .select('*')
        .eq('company_id', currentCompany.id)
        .order('order_position', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
        
      if (error) {
        console.error('❌ useCardapio: Erro ao buscar categorias adicionais:', error);
        throw error;
      }
      
      console.log('✅ useCardapio: Categorias adicionais encontradas:', data?.length || 0);
      console.log('🔍 useCardapio: Dados das categorias adicionais:', data);
      
      // Corrigir o tipo selection_type para corresponder ao nosso tipo
      const typedData = (data || []).map(item => ({
        ...item,
        selection_type: item.selection_type as 'single' | 'multiple' | 'quantity'
      }));
      setCategoriasAdicionais(typedData);
    } catch (error) {
      console.error('❌ useCardapio: Erro ao buscar categorias de adicionais:', error);
    }
  };

  // Buscar adicionais
  const fetchAdicionais = async () => {
    if (!currentCompany?.id) {
      console.log('🔍 useCardapio: Nenhuma empresa selecionada para buscar adicionais');
      return;
    }
    
    try {
      console.log('🔍 useCardapio: Buscando adicionais para empresa:', currentCompany.id);
      const { data, error } = await supabase
        .from('adicionais')
        .select(`
          *,
          categorias_adicionais!inner (
            id,
            name,
            company_id
          )
        `)
        .eq('categorias_adicionais.company_id', currentCompany.id)
        .order('order_position', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true });
        
      if (error) {
        console.error('❌ useCardapio: Erro ao buscar adicionais:', error);
        throw error;
      }
      
      console.log('✅ useCardapio: Adicionais encontrados:', data?.length || 0);
      console.log('🔍 useCardapio: Dados dos adicionais:', data);
      setAdicionais((data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        categoria_adicional_id: item.categoria_adicional_id,
        is_available: item.is_available,
        is_active: item.is_active ?? true, // Usar valor padrão se não existir
        order_position: item.order_position,
        created_at: item.created_at,
        updated_at: item.updated_at
      })));
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
      const { data, error } = await supabase
        .from('categorias')
        .insert([categoria])
        .select()
        .single();
        
      if (error) throw error;
      await fetchCategorias();
      return data;
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
      const { data, error } = await supabase
        .from('categorias')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      await fetchCategorias();
      return data;
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
      const { error } = await supabase
        .from('categorias')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      await fetchCategorias();
      await fetchProdutos(); // Atualizar produtos também
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar produto
  const createProduto = async (produto: Omit<Produto, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      
      // DEBUG: Log dos dados que estão sendo enviados
      console.log('🔍 createProduto: Dados recebidos:', produto);
      console.log('🔍 createProduto: Chaves dos dados:', Object.keys(produto));
      
      // Filtrar apenas os campos válidos da tabela produtos
      const validFields = [
        'name', 'description', 'price', 'promotional_price', 'is_promotional', 
        'image', 'images', 'categoria_id', 'is_available', 'preparation_time', 
        'ingredients', 'destaque', 'order_position', 'company_id', 'tipo_fiscal_id'
      ];
      
      const cleanedProduto = Object.keys(produto)
        .filter(key => validFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = produto[key];
          return obj;
        }, {} as any);
      
      console.log('🔍 createProduto: Dados limpos:', cleanedProduto);
      
      const { data, error } = await supabase
        .from('produtos')
        .insert([cleanedProduto])
        .select()
        .single();
        
      if (error) throw error;
      await fetchProdutos();
      return data;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar produto
  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    try {
      setLoading(true);
      
      // DEBUG: Log dos dados que estão sendo enviados
      console.log('🔍 updateProduto: Dados recebidos:', updates);
      console.log('🔍 updateProduto: Chaves dos dados:', Object.keys(updates));
      
      // Filtrar apenas os campos válidos da tabela produtos
      const validFields = [
        'name', 'description', 'price', 'promotional_price', 'is_promotional', 
        'image', 'images', 'categoria_id', 'is_available', 'preparation_time', 
        'ingredients', 'destaque', 'order_position', 'company_id', 'tipo_fiscal_id'
      ];
      
      const cleanedUpdates = Object.keys(updates)
        .filter(key => validFields.includes(key))
        .reduce((obj, key) => {
          obj[key] = updates[key];
          return obj;
        }, {} as any);
      
      console.log('🔍 updateProduto: Dados limpos:', cleanedUpdates);
      
      const { data, error } = await supabase
        .from('produtos')
        .update({ ...cleanedUpdates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      await fetchProdutos();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Deletar produto
  const deleteProduto = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      await fetchProdutos();
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
        await supabase
          .from('categorias')
          .update({ order_position: update.order_position })
          .eq('id', update.id);
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

      for (const update of updates) {
        const { error } = await supabase
          .from('produtos')
          .update({ 
            order_position: update.order_position,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);
        
        if (error) {
          console.error('❌ Erro ao atualizar produto:', update.id, error);
          throw error;
        } else {
          console.log('✅ Produto atualizado:', update.id, 'nova posição:', update.order_position);
        }
      }

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
      for (const update of updates) {
        const { error } = await supabase
          .from('categorias_adicionais')
          .update({ 
            order_position: update.order_position,
            updated_at: new Date().toISOString()
          })
          .eq('id', update.id);
        
        if (error) throw error;
      }
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
      // Atualizar apenas os adicionais da categoria reordenada
      for (let i = 0; i < result.length; i++) {
        const { error } = await supabase
          .from('adicionais')
          .update({ 
            order_position: i,
            updated_at: new Date().toISOString()
          })
          .eq('id', result[i].id);
        
        if (error) throw error;
      }
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
