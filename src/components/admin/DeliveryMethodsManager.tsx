import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertCircle, Truck, Store, Coffee, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DeliveryMethod {
  company_id: string;
  delivery: boolean;
  pickup: boolean;
  eat_in: boolean;
  updated_at?: string;
}

interface Company {
  id: string;
  name: string;
  slug?: string;
}

export const DeliveryMethodsManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [localConfig, setLocalConfig] = useState<DeliveryMethod | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Buscar todas as empresas
  const { data: companies = [], isLoading: loadingCompanies } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data as Company[];
    }
  });

  // Buscar configurações da empresa selecionada
  const { data: deliveryConfig, isLoading: loadingConfig, refetch } = useQuery({
    queryKey: ['admin-delivery-methods', selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return null;
      
      const { data, error } = await supabase
        .from('delivery_methods')
        .select('*')
        .eq('company_id', selectedCompany)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Não existe ainda - retornar configuração padrão
          return {
            company_id: selectedCompany,
            delivery: true,
            pickup: true,
            eat_in: false
          } as DeliveryMethod;
        }
        throw error;
      }
      
      return data as DeliveryMethod;
    },
    enabled: !!selectedCompany
  });

  // Atualizar estado local quando carregar configurações
  useEffect(() => {
    if (deliveryConfig) {
      setLocalConfig(deliveryConfig);
      setHasChanges(false);
    }
  }, [deliveryConfig]);

  // Mutation para salvar configurações
  const saveMutation = useMutation({
    mutationFn: async (config: DeliveryMethod) => {
      // Validar que pelo menos uma opção está ativa
      if (!config.delivery && !config.pickup && !config.eat_in) {
        throw new Error('Pelo menos uma opção de entrega deve estar habilitada');
      }

      // Tentar atualizar primeiro
      const { data: updateData, error: updateError } = await supabase
        .from('delivery_methods')
        .update({
          delivery: config.delivery,
          pickup: config.pickup,
          eat_in: config.eat_in,
          updated_at: new Date().toISOString()
        })
        .eq('company_id', config.company_id)
        .select()
        .single();

      if (updateError) {
        if (updateError.code === 'PGRST116') {
          // Não existe, criar novo
          const { data: insertData, error: insertError } = await supabase
            .from('delivery_methods')
            .insert({
              company_id: config.company_id,
              delivery: config.delivery,
              pickup: config.pickup,
              eat_in: config.eat_in
            })
            .select()
            .single();
          
          if (insertError) throw insertError;
          return insertData;
        }
        throw updateError;
      }

      return updateData;
    },
    onSuccess: () => {
      toast.success('Configurações salvas com sucesso!');
      setHasChanges(false);
      
      // Invalidar caches relevantes
      queryClient.invalidateQueries({ queryKey: ['admin-delivery-methods', selectedCompany] });
      queryClient.invalidateQueries({ queryKey: ['delivery-methods', selectedCompany] });
      queryClient.invalidateQueries({ queryKey: ['delivery-options'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Erro ao salvar configurações');
    }
  });

  // Handler para mudanças nas configurações
  const handleConfigChange = (field: keyof DeliveryMethod, value: boolean) => {
    if (!localConfig) return;
    
    const newConfig = { ...localConfig, [field]: value };
    
    // Validar que pelo menos uma opção permanece ativa
    if (!newConfig.delivery && !newConfig.pickup && !newConfig.eat_in) {
      toast.error('Pelo menos uma opção deve permanecer ativa');
      return;
    }
    
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  // Salvar configurações
  const handleSave = () => {
    if (!localConfig) return;
    saveMutation.mutate(localConfig);
  };

  // Resetar para configurações salvas
  const handleReset = () => {
    if (deliveryConfig) {
      setLocalConfig(deliveryConfig);
      setHasChanges(false);
    }
  };

  // Aplicar template de configuração
  const applyTemplate = (template: 'delivery-only' | 'pickup-only' | 'both' | 'eat-in') => {
    if (!localConfig) return;
    
    let newConfig = { ...localConfig };
    
    switch (template) {
      case 'delivery-only':
        newConfig = { ...localConfig, delivery: true, pickup: false, eat_in: false };
        break;
      case 'pickup-only':
        newConfig = { ...localConfig, delivery: false, pickup: true, eat_in: false };
        break;
      case 'both':
        newConfig = { ...localConfig, delivery: true, pickup: true, eat_in: false };
        break;
      case 'eat-in':
        newConfig = { ...localConfig, delivery: false, pickup: false, eat_in: true };
        break;
    }
    
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Formas de Entrega</CardTitle>
          <CardDescription>
            Configure as opções de entrega disponíveis para cada empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Seletor de Empresa */}
          <div className="mb-6">
            <Label htmlFor="company-select">Selecione a Empresa</Label>
            <select
              id="company-select"
              className="w-full mt-1 px-3 py-2 border rounded-md"
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              disabled={loadingCompanies}
            >
              <option value="">Selecione uma empresa...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} {company.slug && `(${company.slug})`}
                </option>
              ))}
            </select>
          </div>

          {/* Configurações */}
          {selectedCompany && localConfig && (
            <>
              {/* Templates Rápidos */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-3">Templates Rápidos:</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate('delivery-only')}
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    Apenas Delivery
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate('pickup-only')}
                  >
                    <Store className="w-4 h-4 mr-1" />
                    Apenas Retirada
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate('both')}
                  >
                    <Truck className="w-4 h-4 mr-1" />
                    <Store className="w-4 h-4 mr-1" />
                    Ambos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => applyTemplate('eat-in')}
                  >
                    <Coffee className="w-4 h-4 mr-1" />
                    Consumo Local
                  </Button>
                </div>
              </div>

              {/* Opções de Entrega */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                      <Label htmlFor="delivery-switch" className="text-base">
                        Delivery
                      </Label>
                      <p className="text-sm text-gray-500">
                        Entrega no endereço do cliente
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="delivery-switch"
                    checked={localConfig.delivery}
                    onCheckedChange={(checked) => handleConfigChange('delivery', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Store className="w-5 h-5 text-green-500" />
                    <div>
                      <Label htmlFor="pickup-switch" className="text-base">
                        Retirada no Estabelecimento
                      </Label>
                      <p className="text-sm text-gray-500">
                        Cliente retira o pedido no local
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="pickup-switch"
                    checked={localConfig.pickup}
                    onCheckedChange={(checked) => handleConfigChange('pickup', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Coffee className="w-5 h-5 text-orange-500" />
                    <div>
                      <Label htmlFor="eat-in-switch" className="text-base">
                        Consumo no Local
                      </Label>
                      <p className="text-sm text-gray-500">
                        Cliente consome no estabelecimento
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="eat-in-switch"
                    checked={localConfig.eat_in}
                    onCheckedChange={(checked) => handleConfigChange('eat_in', checked)}
                  />
                </div>
              </div>

              {/* Status e Ações */}
              <div className="mt-6">
                {hasChanges && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Você tem alterações não salvas
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || saveMutation.isPending}
                    className="flex-1"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                  
                  {hasChanges && (
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      disabled={saveMutation.isPending}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </div>

              {/* Informações da última atualização */}
              {deliveryConfig?.updated_at && (
                <p className="mt-4 text-xs text-gray-500 text-center">
                  Última atualização: {new Date(deliveryConfig.updated_at).toLocaleString('pt-BR')}
                </p>
              )}
            </>
          )}

          {/* Loading State */}
          {loadingConfig && (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card de Informações */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            • As configurações são aplicadas imediatamente no cardápio digital
          </p>
          <p>
            • Pelo menos uma opção deve estar sempre habilitada
          </p>
          <p>
            • Clientes só verão as opções que você habilitar aqui
          </p>
          <p>
            • Use os templates rápidos para configurações comuns
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
