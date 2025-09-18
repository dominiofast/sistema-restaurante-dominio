import { useState } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

export type ItemStatus = 'pendente' | 'em_producao' | 'pronto' | 'entregue';

export interface ItemStatusData {
  id: string;
  pedido_item_id: string;
  status: ItemStatus;
  updated_at: string;
  created_at: string;
  updated_by?: string;
}

export const useItemStatus = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateItemStatus = async (pedidoItemId: string, newStatus: ItemStatus) => {
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      console.log('🔄 Atualizando status do item:', { pedidoItemId, newStatus });

      // Verificar se já existe um registro de status para este item
      const { data: existingStatus, error: checkError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'pedido_item_status')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'pedido_item_id', pedidoItemId)
        /* .single\( REMOVIDO */ ; //);

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar status existente:', checkError);
        throw checkError;
      }

      if (existingStatus) {
        // Atualizar status existente
        const { error: updateError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'pedido_item_status')
          /* .update\( REMOVIDO */ ; //{ 
            status: newStatus,
            updated_by: 'kds_user'
          })
          /* .eq\( REMOVIDO */ ; //'pedido_item_id', pedidoItemId);

        if (updateError) {
          console.error('❌ Erro ao atualizar status:', updateError);
          throw updateError;
        }
      } else {
        // Criar novo registro de status
        const { error: insertError } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'pedido_item_status')
          /* .insert\( REMOVIDO */ ; //{
            pedido_item_id: pedidoItemId,
            status: newStatus,
            updated_by: 'kds_user'
          });

        if (insertError) {
          console.error('❌ Erro ao inserir status:', insertError);
          throw insertError;
        }
      }

      console.log('✅ Status do item atualizado com sucesso');
    } catch (error) {
      console.error('💥 Erro ao atualizar status do item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getItemStatus = async (pedidoItemId: string): Promise<ItemStatus | null> => {
    try {
      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'pedido_item_status')
        /* .select\( REMOVIDO */ ; //'status')
        /* .eq\( REMOVIDO */ ; //'pedido_item_id', pedidoItemId)
        /* .single\( REMOVIDO */ ; //);

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar status do item:', error);
        return null;
      }

      return data?.status as ItemStatus || 'pendente';
    } catch (error) {
      console.error('💥 Erro ao buscar status do item:', error);
      return null;
    }
  };

  return {
    updateItemStatus,
    getItemStatus,
    loading
  };
};