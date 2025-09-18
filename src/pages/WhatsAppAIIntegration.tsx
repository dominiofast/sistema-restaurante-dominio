import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
// SUPABASE REMOVIDO
import { 
  MessageSquare, 
  BrainCircuit, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Settings,
  Eye,
  TestTube
} from "lucide-react";

interface WhatsAppIntegration {
  id: string;
  company_id: string;
  host: string;
  instance_key: string;
  token: string;
  webhook?: string;


interface AIPrompt {
  id: string;
  agent_slug: string;
  template: string;
  vars: any;
  version: number;
  updated_at: string;


export default function WhatsAppAIIntegration() {
  const { currentCompany } = useAuth()
  const { toast } = useToast()
  const [whatsappIntegration, setWhatsappIntegration] = useState<WhatsAppIntegration | null>(null)
  const [aiPrompt, setAiPrompt] = useState<AIPrompt | null>(null)
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<string>("")

  useEffect(() => {
    if (currentCompany) {
      loadIntegrationData()
    }
  }, [currentCompany])

  const loadIntegrationData = async () => {
    if (!currentCompany) return;

    setLoading(true)
    try {
      // Carregar integração WhatsApp
      const whatsappData = null as any; const whatsappError = null as any;
      setWhatsappIntegration(whatsappData)

      // Carregar prompt IA
      const promptData = null as any; const promptError = null as any;
      setAiPrompt(promptData)

    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  };

  const testIntegration = async () => {
    if (!whatsappIntegration || !currentCompany) return;

    setTesting(true)
    setTestResult("")

    try {
      // Simular uma mensagem de teste
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: {
          slug_empresa: currentCompany.slug || 'test',
          user_message: 'oi',
          historico: [],
          customer_phone: '5511999999999'
        }
      })

      if (error) throw error;

      setTestResult(data?.resposta || 'Sem resposta')
      
      toast({
        title: "Teste realizado com sucesso",
        description: "A integração WhatsApp + IA está funcionando!"
      })

    } catch (error: any) {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setTesting(false)
    }
  };

  const syncPromptToEdgeConfig = async () => {
    try {
      const { error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { agent_slug: 'agente-ia-conversa' }
      })

      if (error) throw error;

      toast({
        title: "Prompt sincronizado",
        description: "Edge Config atualizado com sucesso"
      })

    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      })
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando configurações...</div>
        </div>
      </div>
    )


  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Integração WhatsApp + IA
        </h1>
        <p className="text-muted-foreground">
          Status e configuração da integração entre WhatsApp e Agente IA
        </p>
      </div>

      <div className="grid gap-6">
        {/* Status da Integração */}
        <Card>
          <CardHeader>
            <CardTitle>Status da Integração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {/* WhatsApp */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <div>
                    <h3 className="font-medium">WhatsApp</h3>
                    <p className="text-sm text-muted-foreground">
                      Integração de mensagens
                    </p>
                  </div>
                </div>
                <Badge variant={whatsappIntegration ? "default" : "secondary"}>
                  {whatsappIntegration ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Conectado
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Não configurado
                    </>
                  )}
                </Badge>
              </div>

              {/* IA Agent */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BrainCircuit className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-medium">Agente IA</h3>
                    <p className="text-sm text-muted-foreground">
                      Prompts dinâmicos
                    </p>
                  </div>
                </div>
                <Badge variant={aiPrompt ? "default" : "secondary"}>
                  {aiPrompt ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      v{aiPrompt.version}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 mr-1" />
                      Não configurado
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalhes da Configuração */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* WhatsApp Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WhatsApp</CardTitle>
            </CardHeader>
            <CardContent>
              {whatsappIntegration ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Host</p>
                    <p className="text-sm text-muted-foreground">{whatsappIntegration.host}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Instance Key</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {whatsappIntegration.instance_key?.substring(0, 16)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Webhook</p>
                    <p className="text-sm text-muted-foreground">
                      {whatsappIntegration.webhook ? 'Configurado' : 'Não configurado'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">WhatsApp não configurado</p>
                  <Button variant="outline" asChild>
                    <a href="/whatsapp-connect">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar WhatsApp
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Prompt Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Agente IA</CardTitle>
            </CardHeader>
            <CardContent>
              {aiPrompt ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Versão</p>
                    <p className="text-sm text-muted-foreground">v{aiPrompt.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Última atualização</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(aiPrompt.updated_at).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Template</p>
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded max-h-20 overflow-hidden">
                      {aiPrompt.template.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href="/settings/assistente-ia">
                        <Eye className="h-3 w-3 mr-1" />
                        Editar
                      </a>
                    </Button>
                    <Button size="sm" variant="outline" onClick={syncPromptToEdgeConfig}>
                      <Zap className="h-3 w-3 mr-1" />
                      Sincronizar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">Prompt não configurado</p>
                  <Button variant="outline" asChild>
                    <a href="/settings/assistente-ia">
                      <BrainCircuit className="h-4 w-4 mr-2" />
                      Configurar Prompt
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Teste da Integração */}
        {whatsappIntegration && aiPrompt && (
          <Card>
            <CardHeader>
              <CardTitle>Teste da Integração</CardTitle>
              <p className="text-sm text-muted-foreground">
                Teste se a integração WhatsApp + IA está funcionando corretamente
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={testIntegration} 
                  disabled={testing}
                  className="w-full"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  {testing ? 'Testando...' : 'Testar Integração'}
                </Button>

                {testResult && (
                  <div className="border rounded-lg p-4 bg-muted">
                    <p className="text-sm font-medium mb-2">Resposta do Teste:</p>
                    <p className="text-sm">{testResult}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Como Funciona */}
        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium">Mensagem Recebida</h4>
                  <p className="text-sm text-muted-foreground">Cliente envia mensagem via WhatsApp</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium">Webhook Processa</h4>
                  <p className="text-sm text-muted-foreground">Webhook recebe e identifica a empresa</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium">IA Gera Resposta</h4>
                  <p className="text-sm text-muted-foreground">Agente IA usa prompts dinâmicos para responder</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h4 className="font-medium">Resposta Enviada</h4>
                  <p className="text-sm text-muted-foreground">Resposta é enviada de volta ao cliente</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
