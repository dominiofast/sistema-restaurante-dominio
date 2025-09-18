import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Store, Settings, ExternalLink } from 'lucide-react';

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
  company_name?: string;
}

interface Company {
  id: string;
  name: string;
}

const SuperAdminIFoodIntegrations = () => {
  const [integrations, setIntegrations] = useState<IFoodIntegration[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Integration states
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<IFoodIntegration | null>(null);
  const [integrationFormData, setIntegrationFormData] = useState({
    company_id: '',
    merchant_id: '',
    store_name: '',
    environment: 'sandbox',
    webhook_url: '',
    webhook_secret: '',
    is_active: true,
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar empresas
      const { data: companiesData, error: companiesError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'companies')
        /* .select\( REMOVIDO */ ; //'id, name')
        /* .order\( REMOVIDO */ ; //'name');

      if (companiesError) throw companiesError;
      setCompanies(companiesData || []);

      // Buscar integrações
      const { data: integrationsData, error: integrationsError } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'ifood_integrations')
        /* .select\( REMOVIDO */ ; //'*')
        /* .order\( REMOVIDO */ ; //'created_at', { ascending: false });

      if (integrationsError) throw integrationsError;
      
      // Buscar nomes das empresas
      const integrationsWithCompanyName = await Promise.all(
        (integrationsData || []).map(async (integration) => {
          const { data: companyData } = /* await supabase REMOVIDO */ null
            /* .from REMOVIDO */ ; //'companies')
            /* .select\( REMOVIDO */ ; //'name')
            /* .eq\( REMOVIDO */ ; //'id', integration.company_id)
            /* .single\( REMOVIDO */ ; //);
          
          return {
            ...integration,
            company_name: companyData?.name || 'Empresa não encontrada'
          };
        })
      );

      setIntegrations(integrationsWithCompanyName);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  // Integration functions
  const handleIntegrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingIntegration) {
        const { error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'ifood_integrations')
          /* .update\( REMOVIDO */ ; //integrationFormData)
          /* .eq\( REMOVIDO */ ; //'id', editingIntegration.id);

        if (error) throw error;
        toast.success('Integração atualizada!');
      } else {
        const { error } = /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'ifood_integrations')
          /* .insert\( REMOVIDO */ ; //[integrationFormData]);

        if (error) throw error;
        toast.success('Integração criada!');
      }

      setIntegrationDialogOpen(false);
      resetIntegrationForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar integração:', error);
      toast.error('Erro ao salvar integração');
    }
  };

  const handleEditIntegration = (integration: IFoodIntegration) => {
    setEditingIntegration(integration);
    setIntegrationFormData({
      company_id: integration.company_id,
      merchant_id: integration.merchant_id || '',
      store_name: integration.store_name || '',
      environment: integration.environment || 'sandbox',
      webhook_url: integration.webhook_url || '',
      webhook_secret: integration.webhook_secret || '',
      is_active: integration.is_active,
      notes: integration.notes || ''
    });
    setIntegrationDialogOpen(true);
  };

  const handleDeleteIntegration = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta integração?')) return;

    try {
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'ifood_integrations')
        /* .delete\( REMOVIDO */ ; //)
        /* .eq\( REMOVIDO */ ; //'id', id);

      if (error) throw error;
      toast.success('Integração excluída!');
      fetchData();
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast.error('Erro ao excluir integração');
    }
  };

  const resetIntegrationForm = () => {
    setIntegrationFormData({
      company_id: '',
      merchant_id: '',
      store_name: '',
      environment: 'sandbox',
      webhook_url: '',
      webhook_secret: '',
      is_active: true,
      notes: ''
    });
    setEditingIntegration(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações iFood</h1>
        <p className="text-gray-600">Configuração de lojas integradas com iFood</p>
      </div>

      {/* Link para Configuração Global */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Configuração Global iFood</h3>
                <p className="text-sm text-gray-600">Configure as credenciais globais (Client ID e Client Secret)</p>
              </div>
            </div>
            <Button asChild variant="outline">
              <a href="/super-admin/ifood-global-config">
                <ExternalLink className="w-4 h-4 mr-2" />
                Configurar
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lojas Integradas</h2>
        <Dialog open={integrationDialogOpen} onOpenChange={setIntegrationDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetIntegrationForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? 'Editar' : 'Nova'} Loja iFood
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleIntegrationSubmit} className="space-y-4">
              <div>
                <Label htmlFor="company_id">Empresa</Label>
                <Select
                  value={integrationFormData.company_id}
                  onValueChange={(value) => setIntegrationFormData({...integrationFormData, company_id: value})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store_name">Nome da Loja</Label>
                  <Input
                    id="store_name"
                    value={integrationFormData.store_name}
                    onChange={(e) => setIntegrationFormData({...integrationFormData, store_name: e.target.value})}
                    placeholder="Ex: Loja Centro"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="merchant_id">Merchant ID</Label>
                  <Input
                    id="merchant_id"
                    value={integrationFormData.merchant_id}
                    onChange={(e) => setIntegrationFormData({...integrationFormData, merchant_id: e.target.value})}
                    placeholder="ID da loja no iFood"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="environment">Ambiente</Label>
                <Select
                  value={integrationFormData.environment}
                  onValueChange={(value) => setIntegrationFormData({...integrationFormData, environment: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Produção</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="webhook_url">URL do Webhook</Label>
                <Input
                  id="webhook_url"
                  value={integrationFormData.webhook_url}
                  onChange={(e) => setIntegrationFormData({...integrationFormData, webhook_url: e.target.value})}
                  placeholder="https://seu-dominio.com/webhook/ifood"
                />
              </div>

              <div>
                <Label htmlFor="webhook_secret">Secret do Webhook</Label>
                <Input
                  id="webhook_secret"
                  type="password"
                  value={integrationFormData.webhook_secret}
                  onChange={(e) => setIntegrationFormData({...integrationFormData, webhook_secret: e.target.value})}
                  placeholder="Secret para validação do webhook"
                />
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={integrationFormData.notes}
                  onChange={(e) => setIntegrationFormData({...integrationFormData, notes: e.target.value})}
                  placeholder="Observações sobre esta loja..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={integrationFormData.is_active}
                  onCheckedChange={(checked) => setIntegrationFormData({...integrationFormData, is_active: checked})}
                />
                <Label htmlFor="is_active">Loja Ativa</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIntegrationDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingIntegration ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    {integration.store_name || 'Loja sem nome'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{integration.company_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={integration.is_active ? "default" : "secondary"}>
                    {integration.is_active ? 'Ativa' : 'Inativa'}
                  </Badge>
                  <Badge variant="outline">
                    {integration.environment === 'sandbox' ? 'Sandbox' : 'Produção'}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditIntegration(integration)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteIntegration(integration.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Merchant ID:</span>
                  <p className="text-gray-600">{integration.merchant_id}</p>
                </div>
                {integration.webhook_url && (
                  <div>
                    <span className="font-medium">Webhook URL:</span>
                    <p className="text-gray-600 truncate">{integration.webhook_url}</p>
                  </div>
                )}
                {integration.notes && (
                  <div className="col-span-2">
                    <span className="font-medium">Observações:</span>
                    <p className="text-gray-600">{integration.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {integrations.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Store className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma loja integrada</h3>
              <p className="text-gray-600 mb-4">Configure primeiro as credenciais globais e depois adicione suas lojas</p>
              <Button asChild>
                <a href="/super-admin/ifood-global-config">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar Credenciais Globais
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SuperAdminIFoodIntegrations;