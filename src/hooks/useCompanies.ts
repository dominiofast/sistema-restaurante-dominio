import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: string;
  status: string;
  user_count: number;
  created_at: string;
  store_code: number;
}

interface CompanyFormData {
  name: string;
  domain: string;
  logo?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  user_count: number;
}

export const useCompanies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all companies
  const {
    data: companies = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['companies'],
    queryFn: async (): Promise<Company[]> => {
      console.log('🏢 useCompanies: Buscando empresas via API...');
      
      const response = await fetch('/api/companies');
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao buscar empresas');
      }
      
      console.log(`✅ useCompanies: ${result.data.length} empresas encontradas`);
      return result.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: CompanyFormData) => {
      console.log('🏢 useCompanies: Criando empresa via API...');
      
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: companyData.name,
          domain: companyData.domain,
          logo: companyData.logo || null,
          plan: companyData.plan,
          status: companyData.status,
          user_count: companyData.user_count,
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao criar empresa');
      }
      
      return result.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Sucesso',
        description: 'Empresa criada com sucesso.',
      });
      return data;
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível criar a empresa.',
        variant: 'destructive',
      });
    },
  });

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, ...updates }: CompanyFormData & { id: string }) => {
      console.log('🏢 useCompanies: Atualizando empresa via API...');
      
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: updates.name,
          domain: updates.domain,
          logo: updates.logo || null,
          plan: updates.plan,
          status: updates.status,
          user_count: updates.user_count,
        })
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao atualizar empresa');
      }
      
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Sucesso',
        description: 'Empresa atualizada com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar a empresa.',
        variant: 'destructive',
      });
    },
  });

  // Delete company mutation
  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🏢 useCompanies: Deletando empresa via API...');
      
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao deletar empresa');
      }
      
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: 'Sucesso',
        description: 'Empresa excluída com sucesso.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível excluir a empresa.',
        variant: 'destructive',
      });
    },
  });

  return {
    companies,
    isLoading,
    error,
    refetch,
    createCompany: (data: CompanyFormData) => createCompanyMutation.mutate(data),
    updateCompany: (data: CompanyFormData & { id: string }) => updateCompanyMutation.mutate(data),
    deleteCompany: deleteCompanyMutation.mutate,
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
    isDeleting: deleteCompanyMutation.isPending,
  };
};

export const useCompanyDetails = (companyId?: string) => {
  const { currentCompany } = useAuth();
  const targetId = companyId || currentCompany?.id;

  return useQuery({
    queryKey: ['company-details', targetId],
    queryFn: async (): Promise<Company | null> => {
      if (!targetId) return null;

      const response = await fetch(`/api/companies`);
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro ao buscar detalhes da empresa');
      }
      
      const company = result.data?.find((c: Company) => c.id === targetId);
      return company || null;
    },
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
};