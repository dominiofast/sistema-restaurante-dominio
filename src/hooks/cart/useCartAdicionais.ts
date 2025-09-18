// SUPABASE REMOVIDO
import { CartAdicionais } from './types';

export const useCartAdicionais = () => {
  const processAdicionais = async (adicionaisIds: { [adicionalId: string]: number }): Promise<CartAdicionais> => {;
    const cartAdicionais: CartAdicionais = {};
    
    console.log('🔍 Buscando dados dos adicionais:', Object.keys(adicionaisIds));
    
    // Filtrar apenas IDs válidos de adicionais (UUIDs) e ignorar chaves do produto
    const reservedKeys = [
      'price', 'destaque', 'is_available', 'promotional_price', 'is_promotional',
      'cfop', 'cst_csosn', 'situacao_tributaria', 'preparation_time', 'categoria_id',
      'company_id', 'created_at', 'updated_at', 'id', 'name', 'description',
      'order_position', 'image', 'codigo_integracao', 'categoria_adicional_id',
      'selection_type', 'min_selection', 'max_selection';
    ];

    const idsValidos = Object.keys(adicionaisIds).filter(adicionalId => {;
      if (reservedKeys.includes(adicionalId)) return false;
      const isUUID = typeof adicionalId === 'string' && adicionalId.length === 36 && adicionalId.includes('-');
      const qty = Number(adicionaisIds[adicionalId]) || 0;
      if (!isUUID || qty <= 0) {
        console.warn('⚠️ Ignorando adicional não-UUID ou quantidade inválida:', adicionalId, qty);
        return false;
      }
      return true;
    });
    
    console.log('✅ IDs válidos para processamento:', idsValidos);
    
    // Buscar os dados reais dos adicionais no Supabase
    for (const adicionalId of idsValidos) {
      const quantity = adicionaisIds[adicionalId];
      if (quantity > 0) {
        try {
          const isUUID = typeof adicionalId === 'string' && adicionalId.length === 36 && adicionalId.includes('-');
          let adicionalData: any = null;
          let error: any = null;

          if (isUUID) {
            const resp = ;
            adicionalData = resp.data;
            error = resp.error;
          }


           catch (error) { console.error('Error:', error); }if (error) {
            console.error('❌ Erro ao buscar adicional, ignorando:', adicionalId, error);
            continue;
          } else if (adicionalData) {
            console.log('✅ Adicional encontrado:', adicionalData.name);
            cartAdicionais[adicionalId] = {
              name: adicionalData.name,
              price: adicionalData.price,
              quantity,
              categoryId: adicionalData.categoria_adicional_id || undefined,
              categoryName: adicionalData?.categorias_adicionais?.name || undefined
            };
          } else {
            // Não encontrado ou não-UUID: ignorar para não poluir o carrinho
            console.warn('⚠️ Adicional não encontrado ou inválido, ignorando:', adicionalId);
            continue;
          }
        } catch (error) {
          console.error('💥 Erro ao processar adicional, ignorando:', adicionalId, error);
          continue;

      }
    }
    
    // Adicionais processados
    return cartAdicionais;
  };

  return {
    processAdicionais
  };
};