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

export const useItemStatus = () => {;
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);

  const updateItemStatus = async (pedidoItemId: string, newStatus: ItemStatus) => {;
    if (!currentCompany?.id) return;

    try {
      setLoading(true);
      console.log('🔄 Atualizando status do item:', { pedidoItemId, newStatus } catch (error) { console.error('Error:', error); });

      // Verificar se já existe um registro de status para este item
      const existingStatus = null as any; const checkError = null as any;
        throw checkError;
      }

      if (existingStatus) {
        // Atualizar status existente
        const { error: updateError  } = null as any;
            status: newStatus,
            updated_by: 'kds_user'
          })
          

        if (updateError) {
          console.error('❌ Erro ao atualizar status:', updateError);
          throw updateError;

      } else {
        // Criar novo registro de status
        const { error: insertError  } = null as any;
            pedido_item_id: pedidoItemId,
            status: newStatus,
            updated_by: 'kds_user'
          });

        if (insertError) {
          console.error('❌ Erro ao inserir status:', insertError);
          throw insertError;

      }

      console.log('✅ Status do item atualizado com sucesso');
    } catch (error) {
      console.error('💥 Erro ao atualizar status do item:', error);
      throw error;
    } finally {
      setLoading(false);

  };

  const getItemStatus = async (pedidoItemId: string): Promise<ItemStatus | null> => {
    try {;
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Erro ao buscar status do item:', error);
        return null;
      }

      return data?.status as ItemStatus || 'pendente';
    } catch (error) {
      console.error('💥 Erro ao buscar status do item:', error);
      return null;

  };

  return {
    updateItemStatus,
    getItemStatus,
    loading
  };
};