
import { useState, useEffect } from 'react';

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
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      console.log('🔄 useCardapioData: Iniciando fetchData via API Neon')
      console.log('🏢 Company ID:', companyId)
      
      if (!companyId) {
        console.log('❌ useCardapioData: Nenhuma empresa fornecida, aguardando...')
        setLoading(false)
        return;
      }

      try {
        setLoading(true)
        setError(null)

        // Safety timeout to avoid loading infinito
        const timeoutId = setTimeout(() => {
          console.error('⏳ useCardapioData: Tempo limite ao carregar cardápio. Exibindo fallback.')
          setError('Não conseguimos carregar o cardápio agora. Tente novamente.')
          setLoading(false)
        } catch (error) { console.error('Error:', error) }, 10000)
        
        console.log('📋 useCardapioData: Buscando categorias para empresa via API:', companyId)
        // Buscar categorias via API
        const categoriasResponse = await fetch(`/api/categorias?company_id=${companyId}`)
        const categoriasResult = await categoriasResponse.json()
        
        if (!categoriasResponse.ok || !categoriasResult.success) {
          throw new Error(categoriasResult.error || 'Erro ao carregar categorias')


        console.log('✅ useCardapioData: Categorias encontradas via API:', categoriasResult.data?.length || 0, categoriasResult.data)
        setCategorias(categoriasResult.data || [])

        console.log('🍽️ useCardapioData: Buscando produtos para empresa via API:', companyId)
        // Buscar produtos via API
        const produtosResponse = await fetch(`/api/produtos?company_id=${companyId}`)
        const produtosResult = await produtosResponse.json()
        
        if (!produtosResponse.ok || !produtosResult.success) {
          throw new Error(produtosResult.error || 'Erro ao carregar produtos')


        console.log('✅ useCardapioData: Produtos encontrados via API:', produtosResult.data?.length || 0, produtosResult.data)
        setProdutos(produtosResult.data || [])
        
        clearTimeout(timeoutId)
      } catch (error) {
        console.error('💥 useCardapioData: Erro geral no carregamento:', error)
        setError(error instanceof Error ? error.message : 'Erro desconhecido ao carregar dados')
      } finally {
        console.log('✅ useCardapioData: Finalizando loading')
        setLoading(false)
      }
    }
    
    fetchData()
  }, [companyId])

  // Função para agrupar produtos por categoria
  const produtosPorCategoria = (categoriaId: string) => {
    return produtos.filter(produto => produto.categoria_id === categoriaId)
  };

  // Função para buscar produto por ID
  const getProdutoById = (produtoId: string) => {
    return produtos.find(produto => produto.id === produtoId)
  };

  // Função para buscar categoria por ID
  const getCategoriaById = (categoriaId: string) => {
    return categorias.find(categoria => categoria.id === categoriaId)
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
