import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [categorias, setCategorias] = useState<PublicCategoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const fetchCompanyData = async () => {
    if (!company_slug || company_slug === '') {
      console.error('❌ Company slug não fornecido');
      setError('Parâmetro de empresa não encontrado na URL');
      setLoadingData(false);
      return;
    }
    
    setLoadingData(true);
    
    try {
      console.log('🔍 Buscando empresa com slug:', company_slug);
      
      // Buscar empresa usando slug ou domain (priorizar slug, depois domain)
      let companyQuery = supabase
        .from('companies')
        .select('*')
        .eq('status', 'active');

      // Verificar se é UUID
      if (company_slug.length === 36 && company_slug.includes('-')) {
        console.log('🔍 useCompanyData - Buscando por ID (UUID):', company_slug);
        companyQuery = companyQuery.eq('id', company_slug);
      } else {
        console.log('🔍 useCompanyData - Buscando por slug/domain:', company_slug);
        companyQuery = companyQuery.or(`slug.eq."${company_slug}",domain.eq."${company_slug}"`);
      }

      const { data: companyData, error: companyError } = await companyQuery.maybeSingle();

      if (companyError) {
        console.error('❌ Erro ao buscar empresa:', companyError);
        throw new Error(`Erro ao carregar empresa: ${companyError.message}`);
      }

      if (!companyData) {
        console.error('❌ Empresa não encontrada para slug:', company_slug);
        throw new Error(`Empresa '${company_slug}' não encontrada ou inativa`);
      }

      console.log('✅ Empresa encontrada:', companyData.name);
      setCompany(companyData);

      // Buscar categorias ativas da empresa
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('company_id', companyData.id)
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (categoriasError) {
        console.error('❌ Erro ao buscar categorias:', categoriasError);
        throw new Error(`Erro ao carregar categorias: ${categoriasError.message}`);
      }

      console.log('✅ Categorias carregadas:', categoriasData?.length || 0);
      setCategorias(categoriasData || []);

      // Buscar produtos ativos da empresa - APENAS campos necessários para performance
      const { data: produtosData, error: produtosError } = await supabase
        .from('produtos')
        .select(`
          id,
          name,
          description,
          price,
          promotional_price,
          is_promotional,
          image,
          categoria_id,
          preparation_time,
          order_position,
          is_available,
          destaque,
          company_id
        `)
        .eq('company_id', companyData.id)
        .eq('is_available', true)
        .order('order_position', { ascending: true });

      if (produtosError) {
        console.error('❌ Erro ao buscar produtos:', produtosError);
        throw new Error(`Erro ao carregar produtos: ${produtosError.message}`);
      }

      console.log('✅ Produtos carregados:', produtosData?.length || 0);
      setProdutos(produtosData || []);
      
      setError(null);
    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCompanyData();
  }, [company_slug, retryKey]);

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