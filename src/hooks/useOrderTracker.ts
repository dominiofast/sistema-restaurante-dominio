import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Pedido, PedidoItem, AdicionalItem } from '@/types/pedidos';

interface UseOrderTrackerReturn {
  pedido: Pedido | null;
  itens: PedidoItem[];
  adicionais: { [itemId: string]: AdicionalItem[] };
  loading: boolean;
  error: string | null;
  companySlug: string;
}

export function useOrderTracker(numero_pedido: string): UseOrderTrackerReturn {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [itens, setItens] = useState<PedidoItem[]>([]);
  const [adicionais, setAdicionais] = useState<{ [itemId: string]: AdicionalItem[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companySlug, setCompanySlug] = useState<string>('');

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!numero_pedido) return;

      try {
        setLoading(true);
        setError(null);

        // Extrair company slug da URL
        const urlPath = window.location.pathname;
        const pathSegments = urlPath.split('/').filter(segment => segment.length > 0);
        const extractedCompanySlug = pathSegments[0];
        setCompanySlug(extractedCompanySlug);

        console.log('🔍 === INICIANDO BUSCA DE PEDIDO ===');
        console.log('🔍 Company slug extraído:', extractedCompanySlug);
        console.log('🔍 Número do pedido:', numero_pedido);

        // Buscar empresa por slug/domain
        const { data: todasEmpresas, error: erroTodas } = await supabase
          .from('companies')
          .select('id, slug, domain')
          .eq('status', 'active');

        if (erroTodas) {
          throw new Error(`Erro ao buscar empresas: ${erroTodas.message}`);
        }

        // Encontrar empresa específica
        const empresaEncontrada = todasEmpresas?.find(empresa => 
          empresa.slug === extractedCompanySlug || empresa.domain === extractedCompanySlug
        );

        if (!empresaEncontrada) {
          throw new Error(`Empresa não encontrada para slug/domain: ${extractedCompanySlug}`);
        }

        const companyId = empresaEncontrada.id;
        console.log('✅ Empresa encontrada! ID:', companyId);

        // Buscar pedido
        const numeroInteiro = parseInt(numero_pedido);
        const { data: pedidoData, error: pedidoError } = await supabase
          .from('pedidos')
          .select('*')
          .eq('numero_pedido', numeroInteiro)
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (pedidoError || !pedidoData) {
          throw new Error('Pedido não encontrado');
        }

        setPedido(pedidoData);
        console.log('✅ Pedido encontrado!');

        // Buscar itens do pedido
        const { data: itensData, error: itensError } = await supabase
          .from('pedido_itens')
          .select('*')
          .eq('pedido_id', pedidoData.id);

        if (itensError) {
          console.warn('Erro ao buscar itens:', itensError);
        } else if (itensData) {
          setItens(itensData);

          // Buscar adicionais para cada item
          const adicionaisMap: { [itemId: string]: AdicionalItem[] } = {};
          
          for (const item of itensData) {
            const { data: adicionaisData } = await supabase
              .from('pedido_item_adicionais')
              .select('nome_adicional, quantidade, valor_total')
              .eq('pedido_item_id', item.id);

            if (adicionaisData && adicionaisData.length > 0) {
              adicionaisMap[item.id] = adicionaisData;
            }
          }
          
          setAdicionais(adicionaisMap);
        }

      } catch (err) {
        console.error('❌ Erro ao carregar pedido:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [numero_pedido]);

  return {
    pedido,
    itens,
    adicionais,
    loading,
    error,
    companySlug
  };
}
