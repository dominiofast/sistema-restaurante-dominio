import { useState, useEffect } from 'react';

interface PublicCategoria {
  id: string;
  name: string;
  description?: string;
  image?: string;
  is_active: boolean;
  order_position: number;
  company_id: string;
}

interface PublicCompany {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  phone?: string;
  address?: string;
  status: string;
  store_code: number;
  min_order_value?: number;
}

interface Produto {
  id: string;
  name: string;
  description?: string;
  price: number;
  promotional_price?: number;
  is_promotional?: boolean;
  image?: string;
  is_available: boolean;
  destaque: boolean;
  categoria_id?: string;
  company_id: string;
}

export const useCompanyData = (company_slug: string) => {
  const [company, setCompany] = useState<PublicCompany | null>(null)
  const [categorias, setCategorias] = useState<PublicCategoria[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const fetchCompanyData = async () => {
    if (!company_slug || company_slug === '') {
      console.error('❌ Company slug não fornecido')
      setError('Parâmetro de empresa não encontrado na URL')
      setLoadingData(false)
      return;
    }
    
    setLoadingData(true)
    
    try {
      console.log('🔍 useCompanyData: Buscando empresa com slug via API Neon:', company_slug)
      
      // Buscar empresa via API /api/companies
      const companyResponse = await fetch('/api/companies')
      const companyResult = await companyResponse.json()
      
      if (!companyResponse.ok || !companyResult.success) {
        throw new Error(companyResult.error || 'Erro ao carregar empresas')
      }
      
       catch (error) { console.error('Error:', error) }// Procurar empresa por slug/domain
      const companyData = companyResult.data?.find((company: any) => {
        return company.slug === company_slug || 
               company.domain === company_slug ||;
               company.id === company_slug;
      })

      if (!companyData) {
        console.error('❌ Empresa não encontrada para slug:', company_slug)
        throw new Error(`Empresa '${company_slug}' não encontrada ou inativa`)
      }

      console.log('✅ useCompanyData: Empresa encontrada via API:', companyData.name)
      setCompany(companyData)

      // Buscar categorias via API /api/categorias
      const categoriasResponse = await fetch(`/api/categorias?company_id=${companyData.id}`)
      const categoriasResult = await categoriasResponse.json()
      
      if (!categoriasResponse.ok || !categoriasResult.success) {
        throw new Error(categoriasResult.error || 'Erro ao carregar categorias')
      }

      console.log('✅ useCompanyData: Categorias carregadas via API:', categoriasResult.data?.length || 0)
      setCategorias(categoriasResult.data || [])

      // Buscar produtos via API /api/produtos
      const produtosResponse = await fetch(`/api/produtos?company_id=${companyData.id}`)
      const produtosResult = await produtosResponse.json()
      
      if (!produtosResponse.ok || !produtosResult.success) {
        throw new Error(produtosResult.error || 'Erro ao carregar produtos')
      }

      console.log('✅ useCompanyData: Produtos carregados via API:', produtosResult.data?.length || 0)
      setProdutos(produtosResult.data || [])
      
      setError(null)
    } catch (err) {
      console.error('❌ useCompanyData: Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoadingData(false)
    }
  };

  useEffect(() => {
    fetchCompanyData()
  }, [company_slug, retryKey])

  return {
    company,
    categorias,
    produtos,
    loadingData,
    error,
    retryKey,
    setRetryKey,
    refetch: fetchCompanyData
  };
};
