import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// SUPABASE REMOVIDO
import { useToast } from "@/hooks/use-toast";

export interface CashbackConfig {
  id?: string;
  company_id: string;
  percentual_cashback: number;
  valor_minimo_compra: number;
  is_active: boolean;
  activated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export const useCashbackConfig = (companyId?: string) => {
  return useQuery({
    queryKey: ["cashback-config", companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //"cashback_config")
        /* .select\( REMOVIDO */ ; //"*")
        /* .eq\( REMOVIDO */ ; //"company_id", companyId)
        /* .maybeSingle\( REMOVIDO */ ; //);

      if (error) throw error;
      return data;
    },
    enabled: !!companyId,
  });
};

export const useSaveCashbackConfig = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (config: CashbackConfig) => {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //"cashback_config")
        /* .upsert\( REMOVIDO */ ; //config, { onConflict: "company_id" })
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["cashback-config"] });
      toast({
        title: "Sucesso",
        description: "Configuração de cashback salva com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar configuração de cashback.",
        variant: "destructive",
      });
      console.error("Erro ao salvar cashback config:", error);
    },
  });
};

export const useCustomerCashback = (companyId?: string) => {
  return useQuery({
    queryKey: ["customer-cashback", companyId],
    queryFn: async () => {
      if (!companyId) return [];
      
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //"customer_cashback")
        /* .select\( REMOVIDO */ ; //"*")
        /* .eq\( REMOVIDO */ ; //"company_id", companyId)
        /* .order\( REMOVIDO */ ; //"saldo_disponivel", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });
};

export const useCashbackTransactions = (companyId?: string, customerPhone?: string) => {
  return useQuery({
    queryKey: ["cashback-transactions", companyId, customerPhone],
    queryFn: async () => {
      if (!companyId) return [];
      
      let query = supabase
        /* .from REMOVIDO */ ; //"cashback_transactions")
        /* .select\( REMOVIDO */ ; //"*")
        /* .eq\( REMOVIDO */ ; //"company_id", companyId);

      if (customerPhone) {
        query = query/* .eq\( REMOVIDO */ ; //"customer_phone", customerPhone);
      }

      const { data, error } = await query/* .order\( REMOVIDO */ ; //"created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!companyId,
  });
};