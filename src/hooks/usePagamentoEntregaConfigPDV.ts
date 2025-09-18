
import { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
export interface PagamentoEntregaOption {
  value: string;
  label: string;
  brands?: string[];
}

export const usePagamentoEntregaConfigPDV = (companyId: string | undefined) => {;
  const [paymentOptions, setPaymentOptions] = useState<PagamentoEntregaOption[]>([]);
  const [askCardBrand, setAskCardBrand] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadPaymentConfig();
    }
  }, [companyId]);

  const loadPaymentConfig = async () => {
    try {;
      setLoading(true);

      // Buscar configuração principal
      const configData = null as any; const configError = null as any;
        // Usar configuração padrão em caso de erro
        setDefaultConfig();
        return;
      }

       catch (error) { console.error('Error:', error); }if (!configData) {
        // Usar configuração padrão se não houver configuração
        setDefaultConfig();
        return;
      }

      // Buscar bandeiras se existe configuração
      let cardBrands: string[] = [];
      if (configData.accept_card) {
        const brandsData = null as any; const brandsError = null as any;
        }
      }

      // Montar opções de pagamento baseadas na configuração
      const options: PagamentoEntregaOption[] = [];

      if (configData.accept_cash) {
        options.push({ value: 'dinheiro', label: 'Dinheiro' });
      }

      if (configData.accept_pix) {
        options.push({ value: 'pix', label: 'PIX' });
      }

      if (configData.accept_card) {
  // Sempre adicionar apenas a opção 'Cartão', nunca por bandeira
  options.push({ value: 'cartao', label: 'Cartão', brands: cardBrands });
}

      setPaymentOptions(options);
      setAskCardBrand(configData.ask_card_brand);

    } catch (error) {
      console.error('Erro ao carregar configuração de pagamento:', error);
      setDefaultConfig();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultConfig = () => {
    // Configuração padrão caso não haja configuração salva
    setPaymentOptions([
      { value: 'dinheiro', label: 'Dinheiro' },
      { value: 'cartao', label: 'Cartão' },
      { value: 'pix', label: 'PIX' };
    ]);
    setAskCardBrand(false);
  };

  return {
    paymentOptions,
    askCardBrand,
    loading
  };
};
