import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Save, 
  History, 
  TestTube2, 
  MessageSquare, 
  Settings,
  Upload,
  Zap,
  BrainCircuit,
  Code,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PromptHistory {
  id: string;
  template: string;
  vars: any;
  version: number;
  created_at: string;
}

interface AssistantForm {
  bot_name: string;
  assistant_id: string;
  cardapio_url: string;
  produtos_path: string;
  config_path: string;
}

// Função para processar prompt - substitui todas as variáveis disponíveis
const processPromptTemplate = (template: string, vars: Record<string, any>): string => {
  // Para templates do builder, retornar o template original sem processamento
  if (template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER') {
    return template;
  }
  
  // Para templates personalizados, aplicar as variáveis
  let processedTemplate = template;
  if (vars && typeof vars === 'object') {
    Object.entries(vars).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      if (typeof value === 'string' && !value.startsWith('{{')) {
        processedTemplate = processedTemplate.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
      }
    });
  }
  
  // Mapear variáveis com nomes diferentes
  const varMapping = {
    'menu_url': vars.cardapio_url || vars.menu_url,
    'cardapio_url': vars.cardapio_url || vars.menu_url,
    'company_slug': vars.company_slug,
    'company_name': vars.company_name,
    'agent_name': vars.agent_name,
    'cashback_percent': vars.cashback_percent || vars.percentual_cashback,
    'opening_hours': vars.working_hours || vars.opening_hours,
    'contact_phone': vars.telefone || vars.contact_phone,
    'contact_address': vars.company_address || vars.contact_address
  };
  
  // Aplicar mapeamento de variáveis
  Object.entries(varMapping).forEach(([key, value]) => {
    if (value && typeof value === 'string' && !value.startsWith('{{')) {
      const placeholder = `{{${key}}}`;
      processedTemplate = processedTemplate.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
    }
  });
  
  return processedTemplate;
};

export default function AdminAgents() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResponse, setTestResponse] = useState('');
  const [history, setHistory] = useState<PromptHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [assistantForm, setAssistantForm] = useState<AssistantForm>({
    bot_name: "RangoBot",
    assistant_id: "",
    cardapio_url: "",
    produtos_path: "",
    config_path: ""
  });
  const [vars, setVars] = useState<Record<string, any>>({});

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      template: '',
      vars: '{}'
    }
  });

  const template = watch('template');

  // Apenas Super Admin pode acessar
  if (user && user.role !== 'super_admin') {
    return (
      <div className="container mx-auto p-6 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Acesso restrito</CardTitle>
          </CardHeader>
          <CardContent>
            Esta página é exclusiva para Super Administradores.
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (slug) {
      loadData();
    }
  }, [slug]);

  const loadData = async () => {
    if (!slug) return;

    try {
      setLoading(true);

      // Carregar dados da empresa
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, slug')
        .eq('slug', slug)
        .single();

      if (!companyData) {
        toast({
          title: "Empresa não encontrada",
          description: "A empresa especificada não existe.",
          variant: "destructive"
        });
        return;
      }

      // Carregar prompt atual
      const { data: promptData } = await supabase
        .from('ai_agent_prompts')
        .select('*')
        .eq('agent_slug', slug)
        .single();

      if (promptData) {
        setValue('template', promptData.template);
        setValue('vars', JSON.stringify(promptData.vars, null, 2));
        setVars((promptData.vars as Record<string, any>) || {});
      }

      // Carregar configurações do assistant
      const { data: assistantData } = await supabase
        .from('ai_agent_assistants')
        .select('*')
        .eq('company_id', companyData.id)
        .single();

      if (assistantData) {
        setAssistantForm({
          bot_name: assistantData.bot_name || companyData.name || 'RangoBot',
          assistant_id: assistantData.assistant_id || '',
          cardapio_url: assistantData.cardapio_url || `https://pedido.dominio.tech/${companyData.slug}`,
          produtos_path: assistantData.produtos_path || `${companyData.id}/produtos.json`,
          config_path: assistantData.config_path || `${companyData.id}/config.json`
        });
      }

      // Carregar histórico
      loadHistory();

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!slug) return;

    try {
      const { data } = await supabase
        .from('ai_prompt_history')
        .select('*')
        .eq('agent_id', slug)
        .order('version', { ascending: false })
        .limit(10);

      setHistory(data?.map(item => ({
        id: item.id.toString(),
        template: item.template || '',
        vars: item.vars as any || {},
        version: item.version || 1,
        created_at: item.updated_at || new Date().toISOString()
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const onSubmit = async (data: any) => {
    if (!slug) return;

    try {
      setSaving(true);

      const varsObj = JSON.parse(data.vars || '{}');

      // Salvar prompt usando upsert com onConflict
      const { error } = await supabase
        .from('ai_agent_prompts')
        .upsert({
          agent_slug: slug,
          template: data.template,
          vars: varsObj,
          version: (history[0]?.version || 0) + 1
        }, {
          onConflict: 'agent_slug'
        });

      if (error) throw error;

      // Chamar edge function para sincronizar
      const { error: pushError } = await supabase.functions.invoke('push_prompt_to_edge', {
        body: { agent_slug: slug }
      });

      if (pushError) {
        console.warn('Aviso: Edge Config pode não ter sido atualizado:', pushError);
      }

      toast({
        title: "Prompt salvo com sucesso!",
        description: "O template foi atualizado e sincronizado."
      });

      // Recarregar histórico
      loadHistory();

    } catch (error: any) {
      toast({
        title: "Erro ao salvar prompt",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const saveAssistantConfig = async () => {
    if (!slug) return;

    try {
      setSaving(true);

      // Buscar company_id
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .eq('slug', slug)
        .single();

      if (!companyData) throw new Error('Empresa não encontrada');

      // Salvar configurações do assistant
      const { error } = await supabase
        .from('ai_agent_assistants')
        .upsert({
          company_id: companyData.id,
          bot_name: assistantForm.bot_name,
          assistant_id: assistantForm.assistant_id,
          cardapio_url: assistantForm.cardapio_url,
          produtos_path: assistantForm.produtos_path,
          config_path: assistantForm.config_path,
          use_direct_mode: true
        });

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "As configurações do assistant foram atualizadas."
      });

    } catch (error: any) {
      toast({
        title: "Erro ao salvar configurações",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testPrompt = async () => {
    if (!slug) return;

    setTesting(true);
    setTestResponse("");

    try {
      const { data, error } = await supabase.functions.invoke('agente-ia-conversa', {
        body: {
          slug_empresa: slug,
          user_message: 'teste de prompt',
          historico: [],
          customer_phone: '5511999999999'
        }
      });

      if (error) throw error;

      setTestResponse(data?.resposta || 'Sem resposta');

      toast({
        title: "Teste executado",
        description: "Verifique a resposta abaixo"
      });

    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const revertToVersion = async (historyItem: PromptHistory) => {
    setValue('template', historyItem.template);
    setValue('vars', JSON.stringify(historyItem.vars, null, 2));
    setVars(historyItem.vars || {});
    
    toast({
      title: "Versão carregada",
      description: `Template da versão ${historyItem.version} carregado. Clique em Salvar para aplicar.`
    });
  };

  const addVar = () => {
    const newKey = `var_${Object.keys(vars).length + 1}`;
    setVars(prev => ({ ...prev, [newKey]: '' }));
  };

  const updateVar = (key: string, value: string) => {
    setVars(prev => ({ ...prev, [key]: value }));
    setValue('vars', JSON.stringify({ ...vars, [key]: value }, null, 2));
  };

  const removeVar = (key: string) => {
    const newVars = { ...vars };
    delete newVars[key];
    setVars(newVars);
    setValue('vars', JSON.stringify(newVars, null, 2));
  };

  const uploadJson = async (type: 'produtos' | 'config', file: File) => {
    if (!slug) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      formData.append('company_slug', slug);

      const { error } = await supabase.storage
        .from('ai-knowledge')
        .upload(`${slug}/${type}.json`, file);

      if (error) throw error;

      toast({
        title: "Arquivo enviado!",
        description: `${type}.json foi enviado com sucesso.`
      });

    } catch (error: any) {
      toast({
        title: "Erro ao enviar arquivo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/prompts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Editor de Prompt Unificado</h1>
            <p className="text-muted-foreground">Agente: {slug}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => setShowHistory(!showHistory)} variant="outline">
            <History className="h-4 w-4 mr-2" />
            Histórico ({history.length})
          </Button>
          <Button onClick={testPrompt} disabled={testing} variant="outline">
            <TestTube2 className="h-4 w-4 mr-2" />
            {testing ? 'Testando...' : 'Testar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Coluna Principal - Editor de Prompt */}
        <div className="xl:col-span-2 space-y-6">
          {/* Editor de Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Template do Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Template do Prompt</Label>
                <Textarea 
                  {...register('template')}
                  value={template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER' 
                    ? 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER\n\n⚡ Este template é processado automaticamente pelo sistema usando as variáveis abaixo.\nO prompt final será gerado dinamicamente com regras anti-loop e proibições contra links de cardápio.'
                    : processPromptTemplate(template, vars)
                  }
                  placeholder="Template do prompt com variáveis {{variavel}}"
                  rows={15}
                  className="font-mono text-sm"
                  readOnly={template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER'}
                />
                {template === 'PROMPT_SERÁ_RENDERIZADO_PELO_BUILDER' && (
                  <div className="text-xs text-amber-600 mt-1 p-2 bg-amber-50 rounded border">
                    ⚡ Este prompt é gerado automaticamente pelo sistema usando as variáveis configuradas abaixo. 
                    O template final incluirá regras anti-loop, proibições contra "Confira nosso cardápio" e instruções específicas de atendimento.
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  Use variáveis como: {`{{agent_name}}, {{company_name}}, {{company_address}}, {{working_hours}}, {{cardapio_url}}, {{customer_name}}`}
                </div>
              </div>

              {/* Variáveis do Template */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Variáveis do Template</Label>
                  <Button size="sm" variant="outline" onClick={addVar}>+ Adicionar Variável</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {Object.entries(vars).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Label className="min-w-0 text-xs">{key}:</Label>
                      <Input 
                        value={String(value)}
                        onChange={(e) => updateVar(key, e.target.value)}
                        placeholder={`Valor para {{${key}}}`}
                        className="text-sm"
                      />
                      <Button size="sm" variant="ghost" onClick={() => removeVar(key)} className="text-red-500 hover:text-red-700">×</Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instruções Extras */}
              <div className="space-y-2">
                <Label>Instruções Extras (anexadas ao prompt enviado à OpenAI)</Label>
                <Textarea 
                  value={vars?.extra_instructions || ''}
                  onChange={(e) => updateVar('extra_instructions', e.target.value)}
                  placeholder="Diretrizes adicionais específicas desta loja. Ex.: Não oferecer bebidas alcoólicas; Nunca mencionar taxa de entrega fixa; etc."
                  rows={6}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-muted-foreground">
                  Dica: deixe em branco se não quiser adicionar regras específicas. Este conteúdo será concatenado ao final do prompt de sistema.
                </div>
              </div>

              <Button onClick={handleSubmit(onSubmit)} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Prompt'}
              </Button>
            </CardContent>
          </Card>

          {/* Teste de Resposta */}
          {testResponse && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube2 className="h-5 w-5" />
                  Resposta do Teste
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm">{testResponse}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Lateral - Configurações e Histórico */}
        <div className="space-y-6">
          {/* Configurações do Assistant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações do Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nome do Bot</Label>
                <Input 
                  value={assistantForm.bot_name} 
                  onChange={(e) => setAssistantForm(prev => ({ ...prev, bot_name: e.target.value }))} 
                  placeholder="RangoBot" 
                />
              </div>
              
              <div>
                <Label>Assistant ID (OpenAI)</Label>
                <Input 
                  value={assistantForm.assistant_id} 
                  onChange={(e) => setAssistantForm(prev => ({ ...prev, assistant_id: e.target.value }))} 
                  placeholder="asst_..." 
                />
              </div>
              
              <div>
                <Label>Link do Cardápio</Label>
                <Input 
                  value={assistantForm.cardapio_url} 
                  onChange={(e) => setAssistantForm(prev => ({ ...prev, cardapio_url: e.target.value }))} 
                  placeholder="https://pedido.dominio.tech/minha-loja" 
                />
              </div>

              <div>
                <Label>produtos.json</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input readOnly value={assistantForm.produtos_path} />
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files && uploadJson('produtos', e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm"><Upload className="h-4 w-4 mr-2"/>Enviar</Button>
                  </label>
                </div>
              </div>
              
              <div>
                <Label>config.json</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input readOnly value={assistantForm.config_path} />
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="file" accept=".json" className="hidden" onChange={(e) => e.target.files && uploadJson('config', e.target.files[0])} />
                    <Button type="button" variant="outline" size="sm"><Upload className="h-4 w-4 mr-2"/>Enviar</Button>
                  </label>
                </div>
              </div>

              <Button onClick={saveAssistantConfig} disabled={saving} className="w-full">
                <Save className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>

          {/* Histórico de Versões */}
          {showHistory && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico de Versões
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{item.version}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.template.length} chars
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => revertToVersion(item)}>
                      Restaurar
                    </Button>
                  </div>
                ))}
                
                {history.length === 0 && (
                  <div className="text-center text-muted-foreground py-4">
                    Nenhuma versão anterior encontrada
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}