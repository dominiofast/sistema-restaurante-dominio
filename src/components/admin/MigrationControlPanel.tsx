import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Zap, Users, CheckCircle, AlertCircle, ArrowRight, RefreshCw, RotateCcw } from 'lucide-react';
// SUPABASE REMOVIDO
import { toast } from '@/hooks/use-toast';

interface CompanyMigrationStatus {
  id: string;
  name: string;
  slug: string;
  use_direct_mode: boolean;
  assistant_id: string | null;
}

export function MigrationControlPanel() {
  const [companies, setCompanies] = useState<CompanyMigrationStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [migrating, setMigrating] = useState<string | null>(null)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const loadCompanies = async () => {
    console.log('🔍 Iniciando carregamento de empresas...')
    try {
      // Primeira query: buscar os assistants
      const assistantsData = null as any; const assistantsError = null as any;
      console.log('❌ Assistants error:', assistantsError)

      if (assistantsError) throw assistantsError;

      if (!assistantsData || assistantsData.length === 0) {
        console.log('⚠️ Nenhum assistant encontrado')
        setCompanies([])
        setProgress(0)
        return;
      }

       catch (error) { console.error('Error:', error) }// Buscar dados das empresas
      const companyIds = assistantsData.map(a => a.company_id)
      console.log('🏢 Company IDs:', companyIds)
      
      const companiesData = null as any; const companiesError = null as any;

      console.log('🏢 Companies data:', companiesData)
      console.log('❌ Companies error:', companiesError)

      if (companiesError) throw companiesError;

      // Combinar os dados
      const combinedData = assistantsData.map(assistant => {
        const company = companiesData?.find(c => c.id === assistant.company_id)
        return {
          id: assistant.company_id,
          name: company?.name || 'Sem nome',
          slug: company?.slug || 'sem-slug',
          use_direct_mode: assistant.use_direct_mode || false,
          assistant_id: assistant.assistant_id
        };
      })

      console.log('✅ Dados combinados finais:', combinedData)
      setCompanies(combinedData)
      
      // Calcular progresso
      const directModeCount = combinedData.filter(c => c.use_direct_mode).length;
      const totalCount = combinedData.length;
      setProgress(totalCount > 0 ? (directModeCount / totalCount) * 100 : 0)
      
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados das empresas',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)

  };

  const toggleCompanyMode = async (companyId: string, enabled: boolean) => {
    setMigrating(companyId)
    try {
      const { error }  catch (error) { console.error('Error:', error) }= 
        
        
        

      if (error) throw error;

      // Atualizar estado local
      setCompanies(prev => prev.map(company => 
        company.id === companyId 
          ? { ...company, use_direct_mode: enabled }
          : company
      ))

      const companyName = companies.find(c => c.id === companyId)?.name;
      
      toast({
        title: `${companyName} migrada!`,
        description: `Agora usando modo ${enabled ? 'direto' : 'legado'}`,
      })

      // Recalcular progresso
      setTimeout(() => {
        const updatedCompanies = companies.map(c => 
          c.id === companyId ? { ...c, use_direct_mode: enabled } : c;
        )
        const directCount = updatedCompanies.filter(c => c.use_direct_mode).length;
        setProgress((directCount / updatedCompanies.length) * 100)
      }, 100)

    } catch (error) {
      console.error('Erro ao migrar empresa:', error)
      toast({
        title: 'Erro na migração',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setMigrating(null)

  };

  const migrateAllToDirectMode = async () => {
    const legacyCompanies = companies.filter(c => !c.use_direct_mode)
    
    if (legacyCompanies.length === 0) {
      toast({
        title: 'Nada para migrar',
        description: 'Todas as empresas já estão no modo direto',
      })
      return;


    setMigrating('ALL')
    
    try {
      for (const company of legacyCompanies) {
        await toggleCompanyMode(company.id, true)
        await new Promise(resolve => setTimeout(resolve, 500)) // Throttle
      }
      
       catch (error) { console.error('Error:', error) }toast({
        title: 'Migração completa!',
        description: `${legacyCompanies.length} empresas migradas para modo direto`,
      })
    } catch (error) {
      console.error('Erro na migração em lote:', error)
    } finally {
      setMigrating(null)

  };

  const syncAssistantWithOpenAI = async (companyId: string, companySlug: string) => {
    setSyncing(companyId)
    try {
      console.log('🔄 Iniciando sincronização com OpenAI...')
      
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { 
          company_id: companyId,
          slug: companySlug 
        }
      })

      if (error) {
        console.error('❌ Erro na função edge:', error)
        throw new Error(`Erro na sincronização: ${error.message}`)
      }

      if (!data?.success) {
        console.error('❌ Função retornou erro:', data)
        throw new Error(data?.error || 'Erro desconhecido na sincronização')
      }

      const companyName = companies.find(c => c.id === companyId)?.name;
      
      toast({
        title: `${companyName} sincronizada!`,
        description: 'Assistant atualizado com sucesso na OpenAI',
      })

      console.log('✅ Sincronização bem-sucedida:', data)

    } catch (error) {
      console.error('❌ Erro na sincronização:', error)
      toast({
        title: 'Erro na sincronização',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setSyncing(null)

  };

  useEffect(() => {
    loadCompanies()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Carregando empresas...</div>
        </CardContent>
      </Card>
    )


  const directModeCount = companies.filter(c => c.use_direct_mode).length;
  const legacyCount = companies.length - directModeCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Painel de Migração por Empresa
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Migre empresas individualmente para o modo direto
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-3 py-1">
            {directModeCount}/{companies.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progresso Geral */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso da Migração</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{legacyCount} pendentes</span>
            <span>{directModeCount} migradas</span>
          </div>
        </div>

        {/* Ações em Lote */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={migrateAllToDirectMode}
            disabled={migrating === 'ALL' || legacyCount === 0}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {migrating === 'ALL' ? 'Migrando...' : `Migrar Todas (${legacyCount})`}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setLoading(true)
              loadCompanies()
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>

        {/* Lista de Empresas */}
        <div className="space-y-2">
          <h4 className="font-medium">Empresas ({companies.length})</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  {company.use_direct_mode ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {company.slug} • {company.assistant_id ? 'Com Assistant' : 'Sem Assistant'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge variant={company.use_direct_mode ? 'default' : 'secondary'}>
                    {company.use_direct_mode ? 'Direto' : 'Legado'}
                  </Badge>
                  
                  <Switch
                    checked={company.use_direct_mode}
                    onCheckedChange={(enabled) => toggleCompanyMode(company.id, enabled)}
                    disabled={migrating === company.id || migrating === 'ALL' || syncing === company.id}
                  />
                  
                  {!company.use_direct_mode && company.assistant_id && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => syncAssistantWithOpenAI(company.id, company.slug)}
                      disabled={migrating === company.id || migrating === 'ALL' || syncing === company.id}
                      className="flex items-center gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      {syncing === company.id ? 'Sincronizando...' : 'Sync OpenAI'}
                    </Button>
                  )}
                  
                  {!company.use_direct_mode && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCompanyMode(company.id, true)}
                      disabled={migrating === company.id || migrating === 'ALL' || syncing === company.id}
                      className="flex items-center gap-1"
                    >
                      <ArrowRight className="h-3 w-3" />
                      Migrar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {companies.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhuma empresa encontrada com configuração de IA
          </div>
        )}
      </CardContent>
    </Card>
  )
}
