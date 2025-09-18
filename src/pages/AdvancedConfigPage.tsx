import React, { useEffect, useMemo, useState } from 'react';
// SUPABASE REMOVIDO
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Bot, MessageSquare, Settings, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// ---------------------------------------------------------------------------
// TIPAGENS SIMPLIFICADAS
// ---------------------------------------------------------------------------
interface ConfigAgenteIA {
  id?: string;
  company_id: string;
  agent_name: string;
  personality: string;
  language: string;
  welcome_message?: string;
  away_message?: string;
  goodbye_message?: string;
  sales_phrases?: string;
  is_active: boolean;
  sales_aggressiveness: number;
  detail_level: number;
  response_speed: number;
  auto_suggestions: boolean;
  product_knowledge: boolean;
  promotion_knowledge: boolean;
  stock_knowledge: boolean;
  whatsapp_integration: boolean;
  data_collection: boolean;
  order_reminders: boolean;
  manager_notifications: boolean;
  message_limit: number;
  working_hours: string;
  habilitar_lancamento_pedidos: boolean;


interface StatusConexao {
  openai: boolean;
  whatsapp: boolean;
  supabase: boolean;


// ---------------------------------------------------------------------------
// CONFIGURAÇÃO INICIAL
// ---------------------------------------------------------------------------
const configInicial: Partial<ConfigAgenteIA> = {
  agent_name: 'Assistente Virtual',
  personality: 'simpatico',
  language: 'pt-br',
  welcome_message: 'Olá! Sou o assistente virtual. Posso te ajudar a fazer seu pedido? 😊',
  away_message: 'Estamos offline no momento. Deixe sua mensagem e responderemos assim que possível.',
  goodbye_message: 'Obrigado pelo seu contato! Qualquer coisa é só chamar. 👋',
  sales_phrases: 'Não perca nossa promoção especial hoje!\nExperimente nossos pratos mais pedidos.\nTemos opções vegetarianas disponíveis.',
  is_active: true,
  sales_aggressiveness: 2,
  detail_level: 3,
  response_speed: 2,
  auto_suggestions: true,
  product_knowledge: true,
  promotion_knowledge: true,
  stock_knowledge: false,
  whatsapp_integration: false,
  data_collection: false,
  order_reminders: true,
  manager_notifications: true,
  message_limit: 50,
  working_hours: '24/7',
  habilitar_lancamento_pedidos: false
};

// ---------------------------------------------------------------------------
// COMPONENTE PRINCIPAL
// ---------------------------------------------------------------------------
const AdvancedConfigPage: React.FC = () => {
  const { currentCompany } = useAuth()
  const [tab, setTab] = useState('config')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<Partial<ConfigAgenteIA>>(configInicial)
  const [testMessage, setTestMessage] = useState('Qual a promoção de hoje?')
  const [testResponse, setTestResponse] = useState<string>('')
  const [statusConexao, setStatusConexao] = useState<StatusConexao>({
    openai: false,
    whatsapp: false,
    supabase: true
  })
  const { toast } = useToast()

  const companyId = currentCompany?.id;

  // Verificar conexões das APIs
  const verificarConexoes = async () => {
    try {
      // Testar conexão Supabase;
      const { error: supabaseError }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
      setStatusConexao(prev => ({ ...prev, supabase: !supabaseError }))

      // Testar OpenAI via edge function
      try {
        const testData = null as any; const testError = null as any;
        console.log('Teste OpenAI:', { testData, testError } catch (error) { console.error('Error:', error) })
        setStatusConexao(prev => ({ ...prev, openai: testData?.resposta && !testError }))
      } catch (error) {
        console.error('Erro teste OpenAI:', error)
        setStatusConexao(prev => ({ ...prev, openai: false }))
      }

      // Verificar integração WhatsApp
      const { data: whatsappData } = await Promise.resolve()
      const hasWhatsapp = whatsappData && whatsappData.length > 0;
      const webhookCorreto = whatsappData?.[0]?.webhook?.includes('whatsapp-webhook')
      setStatusConexao(prev => ({ 
        ...prev, 
        whatsapp: hasWhatsapp && webhookCorreto 
      }))
    } catch (error) {
      console.error('Erro ao verificar conexões:', error)

  };

  // Carregar dados iniciais
  const carregarDados = async () => {
    setLoading(true)
    try {
      // Buscar configuração do agente
      const configData = null as any; const configError = null as any;
      }

       catch (error) { console.error('Error:', error) }if (configData) {
        setConfig({
          ...configData,
          sales_phrases: typeof configData.sales_phrases === 'string' 
            ? configData.sales_phrases 
            : ''
        })
      }
    } catch (error: any) {
      toast({ 
        title: 'Erro ao carregar dados', 
        description: error.message, 
        variant: 'destructive' 
      })
    } finally {
      setLoading(false)

  };

  useEffect(() => {
    carregarDados()
    verificarConexoes()
  }, [])

  const salvarConfig = async () => {
    setSaving(true)
    try {
      if (!config.agent_name) {
        throw new Error('Nome do assistente é obrigatório')
      }

       catch (error) { console.error('Error:', error) }const configParaSalvar = {
        ...config,
        company_id: config.company_id || 'default-company';
      };

      let resultado;
      if (config.id) {
        resultado = 
          
          
          
      } else {
        resultado = 
          
          
          
          
      }

      if (resultado.error) throw resultado.error;

      if (!config.id && resultado.data) {
        setConfig(prev => ({ ...prev, id: resultado.data.id }))
      }

      toast({ title: 'Configuração salva com sucesso!' })
    } catch (error: any) {
      toast({ 
        title: 'Erro ao salvar', 
        description: error.message, 
        variant: 'destructive' 
      })
    } finally {
      setSaving(false)

  };

  const testarAgente = async () => {
    if (!testMessage.trim()) return;
    
    setTestResponse('Processando...')
    try {
      // Buscar o slug da empresa atual
      const company = null as any; const companyError = null as any;
      }

       catch (error) { console.error('Error:', error) }const { data, error } = await Promise.resolve()
        body: {
          slug_empresa: company.slug,
          user_message: testMessage,
          historico: []
        }
      })

      if (error) throw error;
      setTestResponse(data?.resposta || 'Resposta não recebida')
    } catch (error: any) {
      setTestResponse(`Erro: ${error.message}`)

  };

  const gerarPromptPreview = () => {
    const frases = typeof config.sales_phrases === 'string' 
      ? config.sales_phrases.split('\n').filter(f => f.trim())
      : [];

    return `Você é ${config.agent_name || 'Assistente'} da empresa.
Personalidade: ${config.personality || 'simpatico'}
Idioma: ${config.language || 'pt-br'}

MENSAGENS PADRÃO:
- Boas vindas: ${config.welcome_message || ''}
- Ausência: ${config.away_message || ''}  
- Despedida: ${config.goodbye_message || ''}

FRASES DE VENDA:
${frases.map(f => `- ${f}`).join('\n')}

CONFIGURAÇÕES:
- Agressividade de venda: ${config.sales_aggressiveness || 2}/5
- Nível de detalhamento: ${config.detail_level || 3}/5
- Velocidade de resposta: ${config.response_speed || 2}/5
- Auto sugestões: ${config.auto_suggestions ? 'Sim' : 'Não'}
- Conhecimento de produtos: ${config.product_knowledge ? 'Sim' : 'Não'}
- Conhecimento de promoções: ${config.promotion_knowledge ? 'Sim' : 'Não'}
- Horário de funcionamento: ${config.working_hours || '24/7'}
- Limite de mensagens: ${config.message_limit || 50}`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuração Avançada do Agente IA</h1>
          <p className="text-muted-foreground">Configure o comportamento e conhecimento do seu assistente virtual</p>
        </div>
        <Badge variant={config.is_active ? "default" : "secondary"} className="flex items-center gap-2">
          {config.is_active ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {config.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Status das Conexões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status das Conexões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {statusConexao.supabase ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              <span>Supabase Database</span>
            </div>
            <div className="flex items-center gap-2">
              {statusConexao.openai ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              <span>OpenAI API</span>
            </div>
            <div className="flex items-center gap-2">
              {statusConexao.whatsapp ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
              <span>WhatsApp Integration</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={verificarConexoes}
            className="mt-4"
          >
            Verificar Novamente
          </Button>
        </CardContent>
      </Card>



      {loading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>Carregando configurações...</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="prompt">System Prompt</TabsTrigger>
            <TabsTrigger value="teste" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Teste
            </TabsTrigger>
          </TabsList>

          {/* CONFIGURAÇÃO */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Assistente</Label>
                    <Input 
                      value={config.agent_name || ''} 
                      onChange={e => setConfig(c => ({ ...c, agent_name: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <Label>Personalidade</Label>
                    <select 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={config.personality || 'simpatico'}
                      onChange={e => setConfig(c => ({ ...c, personality: e.target.value }))}
                    >
                      <option value="simpatico">Simpático</option>
                      <option value="profissional">Profissional</option>
                      <option value="divertido">Divertido</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={config.is_active || false} 
                    onCheckedChange={v => setConfig(c => ({ ...c, is_active: v }))} 
                  />
                  <Label>Agente ativo</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mensagens Personalizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Mensagem de Boas Vindas</Label>
                  <Textarea 
                    value={config.welcome_message || ''} 
                    onChange={e => setConfig(c => ({ ...c, welcome_message: e.target.value }))} 
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label>Mensagem de Ausência</Label>
                  <Textarea 
                    value={config.away_message || ''} 
                    onChange={e => setConfig(c => ({ ...c, away_message: e.target.value }))} 
                    className="min-h-[80px]"
                  />
                </div>
                
                <div>
                  <Label>Mensagem de Despedida</Label>
                  <Textarea 
                    value={config.goodbye_message || ''} 
                    onChange={e => setConfig(c => ({ ...c, goodbye_message: e.target.value }))} 
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Frases de Venda (uma por linha)</Label>
                  <Textarea 
                    value={config.sales_phrases || ''} 
                    onChange={e => setConfig(c => ({ ...c, sales_phrases: e.target.value }))} 
                    className="min-h-[120px]"
                    placeholder="Digite uma frase por linha..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conhecimento e Recursos</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Configure que informações o assistente deve usar para responder
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.product_knowledge || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, product_knowledge: v }))} 
                      />
                      <Label>Conhecimento de Produtos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.promotion_knowledge || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, promotion_knowledge: v }))} 
                      />
                      <Label>Conhecimento de Promoções</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.stock_knowledge || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, stock_knowledge: v }))} 
                      />
                      <Label>Conhecimento de Estoque</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.auto_suggestions || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, auto_suggestions: v }))} 
                      />
                      <Label>Auto Sugestões</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.order_reminders || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, order_reminders: v }))} 
                      />
                      <Label>Lembrança de Pedidos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.manager_notifications || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, manager_notifications: v }))} 
                      />
                      <Label>Notificação ao Gerente</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações Avançadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Agressividade de Venda (1-5)</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={config.sales_aggressiveness || 2} 
                      onChange={e => setConfig(c => ({ ...c, sales_aggressiveness: Number(e.target.value) }))} 
                    />
                  </div>
                  <div>
                    <Label>Nível de Detalhamento (1-5)</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={config.detail_level || 3} 
                      onChange={e => setConfig(c => ({ ...c, detail_level: Number(e.target.value) }))} 
                    />
                  </div>
                  <div>
                    <Label>Velocidade de Resposta (1-5)</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="5" 
                      value={config.response_speed || 2} 
                      onChange={e => setConfig(c => ({ ...c, response_speed: Number(e.target.value) }))} 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.whatsapp_integration || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, whatsapp_integration: v }))} 
                      />
                      <Label>Integração WhatsApp</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={config.data_collection || false} 
                        onCheckedChange={v => setConfig(c => ({ ...c, data_collection: v }))} 
                      />
                      <Label>Coleta de Dados</Label>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Limite de Mensagens</Label>
                    <Input 
                      type="number" 
                      value={config.message_limit || 50} 
                      onChange={e => setConfig(c => ({ ...c, message_limit: Number(e.target.value) }))} 
                    />
                  </div>
                  <div>
                    <Label>Horário de Funcionamento</Label>
                    <Input 
                      value={config.working_hours || '24/7'} 
                      onChange={e => setConfig(c => ({ ...c, working_hours: e.target.value }))} 
                      placeholder="Ex: 09:00-18:00 ou 24/7"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={salvarConfig} disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Configuração'}
              </Button>
            </div>
          </TabsContent>

          {/* SYSTEM PROMPT */}
          <TabsContent value="prompt">
            <Card>
              <CardHeader>
                <CardTitle>Pré-visualização do System Prompt</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Este é o prompt que será enviado para o modelo de IA
                </p>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={gerarPromptPreview()} 
                  readOnly 
                  className="min-h-[400px] font-mono text-xs"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* TESTE */}
          <TabsContent value="teste">
            <Card>
              <CardHeader>
                <CardTitle>Teste do Agente IA</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Teste o agente IA em tempo real
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Sua pergunta</Label>
                  <div className="flex gap-2">
                    <Input 
                      value={testMessage} 
                      onChange={e => setTestMessage(e.target.value)}
                      placeholder="Digite sua pergunta..."
                      onKeyPress={e => e.key === 'Enter' && testarAgente()}
                    />
                    <Button onClick={testarAgente} disabled={!statusConexao.openai}>
                      Enviar
                    </Button>
                  </div>
                  {!statusConexao.openai && (
                    <p className="text-xs text-red-500 mt-1">
                      OpenAI não conectado. Verifique a configuração da API key.
                    </p>
                  )}
                </div>

                {testResponse && (
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Resposta do Assistente:</h4>
                    <p className="whitespace-pre-wrap text-sm">{testResponse}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTestMessage('Qual a promoção de hoje?')}
                  >
                    "Qual a promoção de hoje?"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTestMessage('Quais produtos vocês têm?')}
                  >
                    "Quais produtos vocês têm?"
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setTestMessage('O que você recomenda?')}
                  >
                    "O que você recomenda?"
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Aviso sobre OpenAI */}
      {!statusConexao.openai && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para que o agente IA funcione completamente, é necessário configurar a chave da API do OpenAI no Supabase.
            Acesse as configurações de Edge Functions e adicione a variável OPENAI_API_KEY.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
};

export default AdvancedConfigPage;
