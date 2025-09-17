
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeliveryMethods {
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
}

export const FormasEntregaPDV = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const { currentCompany } = useAuth();
  const [methods, setMethods] = useState<DeliveryMethods | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDeliveryMethods() {
      if (!currentCompany?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('delivery_methods')
          .select('delivery, pickup, eat_in')
          .eq('company_id', currentCompany.id)
          .single();

        if (error) {
          console.error('Erro ao buscar formas de entrega:', error);
          // Se não encontrar configuração, criar uma padrão
          if (error.code === 'PGRST116') {
            await createDefaultDeliveryMethods();
          }
        } else {
          setMethods(data);
        }
      } catch (err) {
        console.error('Erro inesperado:', err);
      } finally {
        setLoading(false);
      }
    }

    const createDefaultDeliveryMethods = async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_methods')
          .insert({
            company_id: currentCompany!.id,
            delivery: false,
            pickup: true,  // Padrão: sempre permitir retirada
            eat_in: false
          })
          .select('delivery, pickup, eat_in')
          .single();

        if (error) {
          console.error('Erro ao criar configuração padrão:', error);
        } else {
          setMethods(data);
        }
      } catch (err) {
        console.error('Erro ao criar configuração padrão:', err);
      }
    };

    fetchDeliveryMethods();
  }, [currentCompany?.id]);

  if (loading) {
    return (
      <select
        className="w-full mb-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
        disabled
      >
        <option>Carregando opções...</option>
      </select>
    );
  }

  if (!methods) {
    return (
      <select
        className="w-full mb-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
        disabled
      >
        <option>Nenhuma forma de entrega configurada</option>
      </select>
    );
  }

  return (
    <select
      className="w-full mb-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      <option value="">Selecione o tipo de entrega</option>
      {methods.delivery && <option value="delivery">Delivery</option>}
      {methods.pickup && <option value="pickup">Retirada no estabelecimento</option>}
      {methods.eat_in && <option value="eat_in">Consumo no local</option>}
    </select>
  );
};
