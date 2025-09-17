import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create company mutation
  const createCompanyMutation = useMutation({
    mutationFn: async (companyData: CompanyFormData) => {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyData.name,
          domain: companyData.domain,
          logo: companyData.logo || null,
          plan: companyData.plan,
          status: companyData.status,
          user_count: companyData.user_count,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { data, error } = await supabase
        .from('companies')
        .update({
          name: updates.name,
          domain: updates.domain,
          logo: updates.logo || null,
          plan: updates.plan,
          status: updates.status,
          user_count: updates.user_count,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) throw error;
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

      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', targetId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!targetId,
    staleTime: 5 * 60 * 1000,
  });
};