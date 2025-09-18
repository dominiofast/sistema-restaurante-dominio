import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
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
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [itens, setItens] = useState<PedidoItem[]>([])
  const [adicionais, setAdicionais] = useState<{ [itemId: string]: AdicionalItem[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companySlug, setCompanySlug] = useState<string>('')

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!numero_pedido) return;

      try {
        setLoading(true)
        setError(null)

        // Extrair company slug da URL
        const urlPath = window.location.pathname;
        const pathSegments = urlPath.split('/').filter(segment => segment.length > 0)
        const extractedCompanySlug = pathSegments[0];
        setCompanySlug(extractedCompanySlug)

        console.log('🔍 === INICIANDO BUSCA DE PEDIDO ===')
        console.log('🔍 Company slug extraído:', extractedCompanySlug)
        console.log('🔍 Número do pedido:', numero_pedido)

        // Buscar empresa por slug/domain
        const todasEmpresas = null as any; const erroTodas = null as any;


         catch (error) { console.error('Error:', error) }// Encontrar empresa específica
        const empresaEncontrada = todasEmpresas?.find(empresa => 
          empresa.slug === extractedCompanySlug || empresa.domain === extractedCompanySlug;
        )

        if (!empresaEncontrada) {
          throw new Error(`Empresa não encontrada para slug/domain: ${extractedCompanySlug}`)


        const companyId = empresaEncontrada.id;
        console.log('✅ Empresa encontrada! ID:', companyId)

        // Buscar pedido
        const numeroInteiro = parseInt(numero_pedido)
        const pedidoData = null as any; const pedidoError = null as any;


        setPedido(pedidoData)
        console.log('✅ Pedido encontrado!')

        // Buscar itens do pedido
        const itensData = null as any; const itensError = null as any;
        } else if (itensData) {
          setItens(itensData)

          // Buscar adicionais para cada item
          const adicionaisMap: { [itemId: string]: AdicionalItem[] } = {};
          
          for (const item of itensData) {
            const { data: adicionaisData  } = null as any;
            if (adicionaisData && adicionaisData.length > 0) {
              adicionaisMap[item.id] = adicionaisData;
            }
          }
          
          setAdicionais(adicionaisMap)


      } catch (err) {
        console.error('❌ Erro ao carregar pedido:', err)
        setError(err instanceof Error ? err.message : 'Erro ao carregar pedido')
      } finally {
        setLoading(false)

    };

    fetchOrderData()
  }, [numero_pedido])

  return {
    pedido,
    itens,
    adicionais,
    loading,
    error,
    companySlug
  };
}
