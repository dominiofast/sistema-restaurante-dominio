import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Bot, Info } from 'lucide-react';
import { aiService } from '@/services/aiService';
// SUPABASE REMOVIDO
import { toast } from '@/hooks/use-toast';

export function AIModeToggle() {
  const [isDirectMode, setIsDirectMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Carregar modo salvo do localStorage na inicialização
    const savedMode = localStorage.getItem('ai_mode_direct');
    const isDirectModeEnabled = savedMode === 'true';
    setIsDirectMode(isDirectModeEnabled);
    aiService.setDirectMode(isDirectModeEnabled);
    console.log(`🔄 Modo carregado: ${isDirectModeEnabled ? 'DIRETO' : 'ASSISTANTS'}`);
  }, []);

  const handleModeChange = async (enabled: boolean) => {
    setIsLoading(true);
    try {
      // Alterar o modo no aiService
      aiService.setDirectMode(enabled);
      setIsDirectMode(enabled);
      
      // Salvar preferência no localStorage para persistir
      localStorage.setItem('ai_mode_direct', enabled.toString());

      // NOVO: Atualizar flag no banco de dados para TODAS as empresas
      const { data: companies } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'companies')
        /* .select\( REMOVIDO */ ; //'id')
        /* .eq\( REMOVIDO */ ; //'status', 'active');

      if (companies && companies.length > 0) {
        console.log(`🔍 Atualizando use_direct_mode para ${companies.length} empresas...`);
        
        for (const company of companies) {
          const { error } = /* await supabase REMOVIDO */ null
            /* .from REMOVIDO */ ; //'ai_agent_assistants')
            /* .update\( REMOVIDO */ ; //{ use_direct_mode: enabled })
            /* .eq\( REMOVIDO */ ; //'company_id', company.id);

          if (error) {
            console.error(`❌ Erro ao atualizar empresa ${company.id}:`, error);
          } else {
            console.log(`✅ Flag use_direct_mode atualizada para empresa ${company.id}: ${enabled}`);
          }
        }
      }
      
      toast({
        title: `Modo ${enabled ? 'Direto' : 'Assistants'} Ativado`,
        description: enabled 
          ? 'Agora usando Chat Completions direto - mais rápido e eficiente!'
          : 'Voltando para o sistema de Assistants OpenAI',
      });
    } catch (error) {
      console.error('Erro ao alterar modo:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao alterar modo da IA',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar preferência salva no localStorage

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDirectMode ? (
              <Zap className="h-5 w-5 text-green-600" />
            ) : (
              <Bot className="h-5 w-5 text-blue-600" />
            )}
            <div>
              <CardTitle className="text-lg">
                Modo de IA {isDirectMode ? 'Direto' : 'Assistants'}
              </CardTitle>
              <CardDescription>
                {isDirectMode 
                  ? 'Chat Completions direto - Mais rápido e eficiente'
                  : 'OpenAI Assistants - Sistema legado'
                }
              </CardDescription>
            </div>
          </div>
          <Badge variant={isDirectMode ? 'default' : 'secondary'}>
            {isDirectMode ? 'NOVO' : 'LEGADO'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              Usar Chat Completions Direto
            </span>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Switch
            checked={isDirectMode}
            onCheckedChange={handleModeChange}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">Modo Direto (Recomendado)</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✅ Mais rápido (sem sincronização)</li>
              <li>✅ Debugging facilitado</li>
              <li>✅ Controle total sobre prompts</li>
              <li>✅ Menor custo</li>
              <li>✅ Independente da OpenAI</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Modo Assistants</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>⚠️ Dependente de sincronização</li>
              <li>⚠️ Debugging limitado</li>
              <li>⚠️ Pode ser descontinuado</li>
              <li>⚠️ Maior latência</li>
              <li>⚠️ Menor controle</li>
            </ul>
          </div>
        </div>

        {isDirectMode && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-start gap-2">
              <Zap className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-green-800">Modo Direto Ativo</p>
                <p className="text-green-700 mt-1">
                  Todas as novas conversas usarão Chat Completions direto. 
                  Os prompts individuais de cada loja continuam funcionando normalmente.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}