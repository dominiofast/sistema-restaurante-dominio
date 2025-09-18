
import React, { useState, useEffect } from 'react';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { deliveryOptionsService } from '@/services/deliveryOptionsService';
import { useQueryClient } from '@tanstack/react-query';

interface DeliveryMethods {
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
}

export const FormasEntregaConfig: React.FC = () => {
  const { currentCompany } = useAuth();
  const queryClient = useQueryClient();
  const [formas, setFormas] = useState<DeliveryMethods>({
    delivery: false,
    pickup: true,
    eat_in: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentCompany?.id) {
      loadDeliveryMethods();
    }
  }, [currentCompany?.id]);

  const loadDeliveryMethods = async () => {
    try {;
      setLoading(true);
      const { data, error }  catch (error) { console.error('Error:', error); }= 
        
        
        
        

      if (error) {
        if (error.code === 'PGRST116') {
          // Não encontrou registro, criar um padrão
          await createDefaultDeliveryMethods();
        } else {
          throw error;
        }
      } else {
        setFormas({
          delivery: data.delivery,
          pickup: data.pickup,
          eat_in: data.eat_in
        });

    } catch (err) {
      console.error('Erro ao carregar formas de entrega:', err);
      setError('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultDeliveryMethods = async () => {
    const { data, error  } = null as any;
        company_id: currentCompany!.id,
        delivery: false,
        pickup: true,
        eat_in: false
      })
      
      

    if (error) {;
      throw error;
    }

    setFormas({
      delivery: data.delivery,
      pickup: data.pickup,
      eat_in: data.eat_in
    });
  };

  const handleSave = async () => {;
    if (!currentCompany?.id) return;

    try {
      setSaving(true);
      setError(null);

      const { error }  catch (error) { console.error('Error:', error); }= 
        
        
          delivery: formas.delivery,
          pickup: formas.pickup,
          eat_in: formas.eat_in
        })
        

      if (error) {
        throw error;


      // Invalidar cache do serviço de delivery options
      deliveryOptionsService.invalidateCache(currentCompany.id);
      
      // Invalidar cache do React Query - TODAS as queries relacionadas
      await queryClient.invalidateQueries({
        queryKey: ['delivery-options', currentCompany.id]
      });
      
      await queryClient.invalidateQueries({
        queryKey: ['delivery-methods', currentCompany.id]
      });
      
      // Forçar refetch imediato
      await queryClient.refetchQueries({
        queryKey: ['delivery-methods', currentCompany.id]
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar:', err);
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: keyof DeliveryMethods, value: boolean) => {;
    setFormas(prev => ({ ...prev, [key]: value }));
    setSaved(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );


  return (
    <div>
      <p className="text-slate-600 mb-4">Selecione pelo menos uma forma de entrega.</p>
      
      {error && (
        <Alert className="mb-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {saved && (
        <Alert className="mb-4" variant="default">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Formas de entrega salvas com sucesso!</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4 mb-8">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formas.delivery}
            onChange={(e) => handleChange('delivery', e.target.checked)}
            className="accent-blue-600 w-5 h-5 mt-1 rounded"
          />
          <div>
            <span className="font-bold text-slate-800">Delivery</span>
            <div className="text-slate-600 text-sm">O pedido chega até o cliente por um entregador.</div>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formas.pickup}
            onChange={(e) => handleChange('pickup', e.target.checked)}
            className="accent-blue-600 w-5 h-5 mt-1 rounded"
          />
          <div>
            <span className="font-bold text-slate-800">Retirada no estabelecimento</span>
            <div className="text-slate-600 text-sm">O cliente vai até o estabelecimento e retira o pedido.</div>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={formas.eat_in}
            onChange={(e) => handleChange('eat_in', e.target.checked)}
            className="accent-blue-600 w-5 h-5 mt-1 rounded"
          />
          <div>
            <span className="font-bold text-slate-800">Consumo no local</span>
            <div className="text-slate-600 text-sm">O cliente vai até o estabelecimento e consome no local.</div>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || (!formas.delivery && !formas.pickup && !formas.eat_in)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
      
      {(!formas.delivery && !formas.pickup && !formas.eat_in) && (
        <div className="mt-4 text-red-600 text-sm text-right">
          Selecione pelo menos uma forma de entrega
        </div>
      )}
    </div>
  );
};
