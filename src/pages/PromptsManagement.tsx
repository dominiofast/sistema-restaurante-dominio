import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';
import { 
  ArrowLeft, 
  Search, 
  Edit, 
  Eye, 
  Code, 
  Building, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: string;


interface PromptData {
  agent_slug: string;
  template: string;
  vars: any;
  version: number;
  updated_at: string;


export default function PromptsManagement() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [prompts, setPrompts] = useState<Record<string, PromptData>>({})
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [globalTemplate, setGlobalTemplate] = useState<any>(null)
  const [showGlobalModal, setShowGlobalModal] = useState(false)
  const [applyingTemplate, setApplyingTemplate] = useState(false)

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
    )


  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Carregar empresas
      const companiesData = null as any; const companiesError = null as any;
      setCompanies(companiesData || [])

      // Carregar prompts de todas as empresas
      const promptsData = null as any; const promptsError = null as any;
      
      const promptsMap: Record<string, PromptData> = {} catch (error) { console.error('Error:', error) };
      (promptsData || []).forEach(prompt => {
        promptsMap[prompt.agent_slug] = prompt;
      })
      setPrompts(promptsMap)

      // Carregar template global
      const globalData = null as any; const globalError = null as any;


    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setLoading(false)

  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPromptStatus = (companySlug: string) => {
    const prompt = prompts[companySlug];
    if (!prompt) return 'missing';
    if (prompt.template.length < 100) return 'incomplete';
    return 'complete';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'complete':;
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completo</Badge>;
      case 'incomplete':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Incompleto</Badge>;
      case 'missing':
        return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Faltando</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;

  };

  const updateGlobalTemplate = async (newTemplate: string) => {
    try {
      const { error }  catch (error) { console.error('Error:', error) }= 
        
        
          template: newTemplate,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        

      if (error) throw error;

      toast({
        title: "Template global atualizado",
        description: "O template foi salvo com sucesso!",
      })

      setGlobalTemplate(prev => ({ ...prev, template: newTemplate }))
      setShowGlobalModal(false)
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar template",
        description: error.message,
        variant: "destructive"
      })

  };

  const applyGlobalTemplate = async () => {
    try {
      setApplyingTemplate(true)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { companiesToUpdate: 'all' }
      })

      if (error) throw error;

      toast({
        title: "Template aplicado com sucesso!",
        description: `${data.summary?.successful || 0} empresas atualizadas com horários reais`,
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      toast({
        title: "Erro ao aplicar template",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setApplyingTemplate(false)

  };

  const fixHorariosReais = async () => {
    try {
      setApplyingTemplate(true)
      
      toast({
        title: "🚨 CORREÇÃO URGENTE INICIADA",
        description: "Aplicando horários reais aos prompts...",
      } catch (error) { console.error('Error:', error) })

      const { data, error } = await Promise.resolve()
      if (error) throw error;

      toast({
        title: "✅ CORREÇÃO CONCLUÍDA!",
        description: `${data.summary?.successful || 0} empresas corrigidas com horários reais`,
      })

      // Recarregar dados
      await loadData()
    } catch (error: any) {
      toast({
        title: "❌ Erro na correção",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setApplyingTemplate(false)

  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit';
    })
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando...</div>
        </div>
      </div>
    )


  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/super-admin/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Gerenciamento de Prompts IA</h1>
            <p className="text-muted-foreground">Gerencie os prompts de IA de todas as empresas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowGlobalModal(true)}
            className="flex items-center gap-2"
          >
            <Code className="h-4 w-4" />
            Template Global
          </Button>
          
          <Button
            onClick={applyGlobalTemplate}
            disabled={applyingTemplate}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {applyingTemplate ? 'Aplicando...' : 'Aplicar para Todas'}
          </Button>
          
          <Button
            onClick={fixHorariosReais}
            disabled={applyingTemplate}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            {applyingTemplate ? 'Corrigindo...' : 'CORREÇÃO URGENTE'}
          </Button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Prompts Completos</p>
                <p className="text-2xl font-bold">
                  {companies.filter(c => getPromptStatus(c.slug) === 'complete').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Prompts Incompletos</p>
                <p className="text-2xl font-bold">
                  {companies.filter(c => getPromptStatus(c.slug) === 'incomplete').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Sem Prompt</p>
                <p className="text-2xl font-bold">
                  {companies.filter(c => getPromptStatus(c.slug) === 'missing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((company) => {
          const prompt = prompts[company.slug];
          const status = getPromptStatus(company.slug)
          
          return (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      {company.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">@{company.slug}</p>
                  </div>
                  {getStatusBadge(status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span>Status: {company.status}</span>
                </div>
                
                {prompt && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Code className="h-4 w-4" />
                      <span>Versão: {prompt.version}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Atualizado: {formatDate(prompt.updated_at)}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Template: {prompt.template.length} caracteres
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/admin/agents/${company.slug}`)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {prompt ? 'Editar' : 'Criar'}
                  </Button>
                  
                  {prompt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Preview do prompt
                        toast({
                          title: "Preview do Prompt",
                          description: `Template de ${company.name} (${prompt.template.length} chars)`,
                        })
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Tente ajustar os termos de busca.' : 'Não há empresas cadastradas.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal do Template Global */}
      {showGlobalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Template Global de Prompts</h2>
              <p className="text-gray-600 mt-1">
                Este template será aplicado a todas as empresas com variáveis dinâmicas
              </p>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Template (com variáveis dinâmicas)
                  </label>
                  <textarea
                    className="w-full h-96 p-3 border rounded-lg font-mono text-sm"
                    value={globalTemplate?.template || ''}
                    onChange={(e) => setGlobalTemplate(prev => ({ ...prev, template: e.target.value }))}
                    placeholder="Digite o template com variáveis como {{company_name}}, {{working_hours}}, etc."
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Variáveis Disponíveis:</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div><code>{"{{company_name}}"}</code> - Nome da empresa</div>
                    <div><code>{"{{company_slug}}"}</code> - Slug da empresa</div>
                    <div><code>{"{{agent_name}}"}</code> - Nome do assistente</div>
                    <div><code>{"{{working_hours}}"}</code> - Horários reais da loja (dinâmico)</div>
                    <div><code>{"{{opening_hours}}"}</code> - Alias para working_hours</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowGlobalModal(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => updateGlobalTemplate(globalTemplate?.template || '')}
              >
                Salvar Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

