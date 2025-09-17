import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const SETTING_KEY = 'scrapingbee_api_key';

const SuperAdminIFoodImportConfig: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApiKey = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', SETTING_KEY)
        .single();
      
      if (data && data.value) {
        setApiKey(data.value);
      }
      setIsLoading(false);
    };
    fetchApiKey();
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: SETTING_KEY, value: apiKey }, { onConflict: 'key' });

    setIsLoading(false);
    if (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a chave de API.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso!',
        description: 'Chave de API do ScrapingBee salva com sucesso.',
      });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Configuração do Importador iFood</h1>
      <div className="max-w-xl bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Chave de API do ScrapingBee</h2>
        <p className="text-sm text-gray-600 mb-4">
          Insira sua chave de API do ScrapingBee para habilitar a importação de cardápios do iFood.
        </p>
        <Input
          type="password"
          placeholder="sua_chave_de_api"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          disabled={isLoading}
        />
        <Button onClick={handleSave} disabled={isLoading} className="mt-4">
          {isLoading ? 'Salvando...' : 'Salvar Chave'}
        </Button>
      </div>
    </div>
  );
};

export default SuperAdminIFoodImportConfig; 