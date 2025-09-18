import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { Store, Calendar, Globe, Settings, MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface IFoodIntegration {
  id: string;
  company_id: string;
  merchant_id: string | null;
  store_name: string | null;
  is_active: boolean;
  created_at: string;
  notes: string | null;
  environment: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;


interface IntegrationData {
  accessToken: string;
  expiresIn: number;
  environment: string;
  message: string;


const IFoodIntegrationsLojista = () => {
  const { currentCompany } = useAuth()
  const [integrations, setIntegrations] = useState<IFoodIntegration[]>([])
  const [loading, setLoading] = useState(true)
  const [requestingToken, setRequestingToken] = useState(false)
  const [integrationData, setIntegrationData] = useState<IntegrationData | null>(null)

  useEffect(() => {
    if (currentCompany?.id) {
      fetchIntegrations()
    }
  }, [currentCompany?.id])

  const fetchIntegrations = async () => {
    console.log('⚠️ fetchIntegrations desabilitado - sistema migrado para PostgreSQL')
    return Promise.resolve([])
  } = 
        
        
          *
        `)
        
        

      if (error) throw error;
      setIntegrations(data || [])
    } catch (error) {
      console.error('Erro ao carregar integrações:', error)
      toast.error('Erro ao carregar integrações')
    } finally {
      setLoading(false)
    }
  };

  const handleRequestToken = async () => {
    if (!currentCompany?.id) return;

    try {
      setRequestingToken(true)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { environment: 'sandbox' } // Por padrão usar sandbox
      })

      if (error) throw error;

      if (data.success) {
        setIntegrationData(data)
        toast.success(data.message)
        // Recarregar integrações após sucesso
        fetchIntegrations()
      } else {
        toast.error(data.error || 'Erro ao configurar integração')
      }
    } catch (error) {
      console.error('Erro ao configurar integração:', error)
      toast.error('Erro ao configurar integração iFood')
    } finally {
      setRequestingToken(false)
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações iFood</h1>
        <p className="text-gray-600">
          Visualize as integrações iFood configuradas para sua loja
        </p>
      </div>

      {integrations.length === 0 ? (
        <div className="space-y-6">
          {/* Fluxo de Integração */}
          <Card>
            <CardHeader>
              <CardTitle>Integração com iFood</CardTitle>
              <p className="text-gray-600">
                Para configurar a integração com a nova versão da API do iFood devem ser seguidos os seguintes passos:
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">🔄 Aplicativo Centralizado</h4>
                <p className="text-sm text-blue-700">
                  Este sistema usa o fluxo de <strong>aplicativo centralizado</strong> do iFood. 
                  A integração é configurada automaticamente com um clique.
                </p>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-4">Configurar Integração</h4>
                <Button 
                  onClick={handleRequestToken}
                  disabled={requestingToken}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  {requestingToken && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  CONFIGURAR INTEGRAÇÃO IFOOD
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Clique para configurar automaticamente sua integração com o iFood
                </p>
              </div>

              {/* Exibir sucesso quando integração configurada */}
              {integrationData && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4 text-green-700">✅ Integração Configurada!</h4>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
                    <div className="text-sm text-green-700">
                      <p className="mb-2">
                        <strong>Integração configurada com sucesso!</strong>
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Token de acesso obtido automaticamente</li>
                        <li>Ambiente: {integrationData.environment === 'sandbox' ? 'Teste (Sandbox)' : 'Produção'}</li>
                        <li>Status: Ativa e funcionando</li>
                      </ul>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600">
                        Token expira em {Math.floor(integrationData.expiresIn / 3600)} horas
                      </span>
                      <Button 
                        onClick={() => fetchIntegrations()}
                        variant="outline"
                        size="sm"
                        className="text-green-700 border-green-300 hover:bg-green-100"
                      >
                        Atualizar Lista
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Como funciona */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Store className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Como funciona a integração iFood</h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p><strong>ID da Loja (Merchant ID):</strong> É o identificador único da sua loja no iFood. Cada loja tem um ID específico fornecido pelo iFood.</p>
                    <p><strong>App Configurado:</strong> Refere-se à aplicação global que gerencia as credenciais de acesso à API do iFood (configurado pelo nosso suporte).</p>
                    <p><strong>Ambiente:</strong> Teste (Sandbox) é usado para desenvolvimento e testes. Produção é o ambiente real onde os pedidos são processados.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Precisa de Ajuda */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <MessageSquare className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Precisa de uma integração?</h3>
                  <p className="text-sm text-gray-600">
                    Entre em contato com nosso suporte para configurar sua integração iFood.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6">
          {integrations.map((integration) => (
            <Card key={integration.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <Store className="w-6 h-6 text-red-600" />
                      </div>
                      {integration.store_name || 'Loja iFood'}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Criada em {new Date(integration.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={integration.is_active ? "default" : "secondary"}
                      className={integration.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {integration.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {integration.environment === 'sandbox' ? 'Teste' : 'Produção'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Informações da Loja */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      Informações da Loja
                    </h4>
                    
                    {integration.merchant_id && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">ID da Loja (Merchant ID)</label>
                        <div className="mt-1 p-2 bg-gray-50 rounded border text-sm font-mono">
                          {integration.merchant_id}
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700">Nome da Loja</label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {integration.store_name || 'Não informado'}
                      </div>
                    </div>
                  </div>

                  {/* Configurações */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 border-b pb-2">
                      Configurações
                    </h4>

                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <Settings className="w-4 h-4" />
                        Ambiente
                      </label>
                      <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                        {integration.environment === 'sandbox' ? 'Sandbox (Teste)' : 'Produção'}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">Status da Integração</span>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          integration.is_active ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm">
                          {integration.is_active ? 'Funcionando' : 'Desativada'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">Ambiente</span>
                      <span className="text-sm">
                        {integration.environment === 'sandbox' ? 'Teste (Sandbox)' : 'Produção'}
                      </span>
                    </div>
                  </div>
                </div>

                {integration.notes && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">{integration.notes}</p>
                    </div>
                  </div>
                )}

                {!integration.is_active && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <p className="text-sm text-yellow-800">
                        <strong>Integração Desativada:</strong> Esta integração está temporariamente desabilitada. 
                        Entre em contato com o suporte se precisar reativá-la.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Informações sobre como funciona */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Store className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Como funciona a integração iFood</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>ID da Loja (Merchant ID):</strong> É o identificador único da sua loja no iFood. 
                  Cada loja tem um ID específico fornecido pelo iFood.
                </p>
                <p>
                  <strong>App Configurado:</strong> Refere-se à aplicação global que gerencia as credenciais 
                  de acesso à API do iFood (configurado pelo nosso suporte).
                </p>
                <p>
                  <strong>Ambiente:</strong> Teste (Sandbox) é usado para desenvolvimento e testes. 
                  Produção é o ambiente real onde os pedidos são processados.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações de Suporte */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Precisa de Ajuda?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Nossa equipe de suporte está disponível para ajudar com suas integrações iFood.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Configuração de novas integrações</li>
                <li>• Resolução de problemas técnicos</li>
                <li>• Atualizações de configuração</li>
                <li>• Suporte para múltiplas lojas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default IFoodIntegrationsLojista;
