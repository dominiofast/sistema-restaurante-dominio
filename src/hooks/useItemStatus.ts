import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: existingStatus, error: checkError } = await supabase
        .from('pedido_item_status')
        .select('id')
        .eq('pedido_item_id', pedidoItemId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ Erro ao verificar status existente:', checkError);
        throw checkError;
      }

      if (existingStatus) {
        // Atualizar status existente
        const { error: updateError } = await supabase
          .from('pedido_item_status')
          .update({ 
            status: newStatus,
            updated_by: 'kds_user'
          })
          .eq('pedido_item_id', pedidoItemId);

        if (updateError) {
          console.error('❌ Erro ao atualizar status:', updateError);
          throw updateError;
        }
      } else {
        // Criar novo registro de status
        const { error: insertError } = await supabase
          .from('pedido_item_status')
          .insert({
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
      const { data, error } = await supabase
        .from('pedido_item_status')
        .select('status')
        .eq('pedido_item_id', pedidoItemId)
        .single();

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