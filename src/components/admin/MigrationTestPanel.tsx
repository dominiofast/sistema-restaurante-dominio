import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Zap, Bot, CheckCircle, XCircle, Search } from 'lucide-react';
import { aiService } from '@/services/aiService';
// SUPABASE REMOVIDO
import { toast } from '@/hooks/use-toast';

interface TestResult {
  method: 'direct' | 'legacy';
  response: string;
  tokensUsed: number;
  responseTime: number;
  success: boolean;
  error?: string;
}

export function MigrationTestPanel() {
  const [companyId, setCompanyId] = useState('11e10dba-8ed0-47fc-91f5-bc88f2aef4ca')
  const [testMessage, setTestMessage] = useState('Olá! Vocês têm promoção hoje?')
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [isDebugging, setIsDebugging] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)

  const debugDirectMode = async () => {
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma empresa primeiro',
        variant: 'destructive';
      })
      return;
    }

    setIsDebugging(true)
    setDebugResult(null)

    try {
      console.log('🔍 Investigando modo direto para empresa:', companyId)
      
      const { data, error }  catch (error) { console.error('Error:', error) }= await Promise.resolve()
        body: { company_id: companyId }
      })

      if (error) {
        console.error('❌ Erro na edge function de debug:', error)
        throw error;
      }

      console.log('✅ Resultado do debug:', data)
      setDebugResult(data)

      toast({
        title: 'Debug Concluído',
        description: 'Verifique o resultado abaixo',
      })

    } catch (error) {
      console.error('❌ Erro no debug:', error)
      toast({
        title: 'Erro no Debug',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setIsDebugging(false)
    }
  };

  const runComparison = async () => {
    if (!companyId.trim() || !testMessage.trim()) {
      toast({
        title: 'Erro',
        description: 'Company ID e mensagem são obrigatórios',
        variant: 'destructive';
      })
      return;
    }

    setTesting(true)
    setResults([])

    try {
      // Testar método legado (Assistants)
      console.log('🔄 Testando método legado...')
      aiService.setDirectMode(false)
      const startLegacy = Date.now()
      const legacyResult = await aiService.generateResponse(
        companyId,
        testMessage,
        [],
        '5511999999999',
        'Cliente Teste';
      )
      const legacyTime = Date.now() - startLegacy;

      const legacyTestResult: TestResult = {
        method: 'legacy',
        success: !!legacyResult,
        response: legacyResult?.response || 'Erro',
        tokensUsed: legacyResult?.tokensUsed || 0,
        responseTime: legacyTime,
        error: !legacyResult ? 'Falha na geração de resposta' : undefined
      } catch (error) { console.error('Error:', error) };

      setResults(prev => [...prev, legacyTestResult])

      // Aguardar 1 segundo entre testes
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Testar método direto (Chat Completions)
      console.log('🔄 Testando método direto...')
      aiService.setDirectMode(true)
      const startDirect = Date.now()
      const directResult = await aiService.generateResponse(
        companyId,
        testMessage,
        [],
        '5511999999999',
        'Cliente Teste';
      )
      const directTime = Date.now() - startDirect;

      const directTestResult: TestResult = {
        method: 'direct',
        success: !!directResult,
        response: directResult?.response || 'Erro',
        tokensUsed: directResult?.tokensUsed || 0,
        responseTime: directTime,
        error: !directResult ? 'Falha na geração de resposta' : undefined
      };

      setResults(prev => [...prev, directTestResult])

      // Análise dos resultados
      if (legacyTestResult.success && directTestResult.success) {
        const speedImprovement = legacyTime > directTime ? 
          `${Math.round(((legacyTime - directTime) / legacyTime) * 100)}% mais rápido` : ;
          `${Math.round(((directTime - legacyTime) / directTime) * 100)}% mais lento`;

        toast({
          title: 'Comparação concluída!',
          description: `Modo direto foi ${speedImprovement}`,
        })
      }

    } catch (error) {
      console.error('Erro na comparação:', error)
      toast({
        title: 'Erro no teste',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive'
      })
    } finally {
      setTesting(false)
    }
  };

  const renderResult = (result: TestResult) => (
    <div key={`${result.method}-${Date.now()}`} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {result.method === 'direct' ? (
            <Zap className="h-4 w-4 text-green-600" />
          ) : (
            <Bot className="h-4 w-4 text-blue-600" />
          )}
          <h4 className="font-medium">
            {result.method === 'direct' ? 'Chat Completions Direto' : 'OpenAI Assistants'}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <Badge variant={result.success ? 'default' : 'destructive'}>
            {result.success ? 'Sucesso' : 'Falha'}
          </Badge>
        </div>
      </div>

      {result.success && (
        <>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>{result.responseTime}ms</span>
            </div>
            <div>
              <span>{result.tokensUsed} tokens</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded p-3">
            <Label className="text-xs font-medium text-gray-600">Resposta:</Label>
            <p className="text-sm mt-1 whitespace-pre-wrap">
              {result.response.length > 200 
                ? result.response.substring(0, 200) + '...' 
                : result.response
              }
            </p>
          </div>
        </>
      )}

      {result.error && (
        <div className="bg-red-50 border border-red-200 rounded p-3">
          <Label className="text-xs font-medium text-red-600">Erro:</Label>
          <p className="text-sm mt-1 text-red-700">{result.error}</p>
        </div>
      )}
    </div>;
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Teste de Migração & Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Company ID</Label>
            <Input
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="UUID da empresa"
            />
          </div>
          <div>
            <Label>Mensagem de Teste</Label>
            <Input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Mensagem para teste"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={runComparison} 
            disabled={testing}
            className="flex-1"
          >
            {testing ? 'Testando...' : 'Comparar Métodos'}
          </Button>
          
          <Button 
            onClick={debugDirectMode} 
            disabled={isDebugging || !companyId}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isDebugging ? 'Investigando...' : 'Debug'}
          </Button>
        </div>

        {debugResult && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Search className="h-4 w-4" />
              🔍 Investigação Profunda
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Condições de Verificação:</h4>
                <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                  <div>use_direct_mode: <code>{String(debugResult.debug?.use_direct_mode_value)}</code></div>
                  <div>tipo: <code>{debugResult.debug?.use_direct_mode_type}</code></div>
                  <div>=== true: <code>{String(debugResult.debug?.strict_equality_check)}</code></div>
                  <div>== true: <code>{String(debugResult.debug?.loose_equality_check)}</code></div>
                  <div>Boolean(): <code>{String(debugResult.debug?.boolean_cast)}</code></div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Resultado:</h4>
                <div className={`p-3 rounded text-sm font-medium ${
                  debugResult.shouldUseDirectMode 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {debugResult.shouldUseDirectMode ? '✅ MODO DIRETO' : '❌ MODO LEGADO'}
                </div>
              </div>
            </div>

            <details className="border rounded">
              <summary className="p-3 cursor-pointer font-medium">Dados Completos</summary>
              <div className="border-t p-3 bg-gray-50">
                <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-medium">Resultados da Comparação:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map(renderResult)}
            </div>

            {results.length === 2 && results.every(r => r.success) && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <h4 className="font-medium text-blue-800 mb-2">Análise:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Método direto: {results[1].responseTime}ms</li>
                  <li>• Método legado: {results[0].responseTime}ms</li>
                  <li>• Diferença: {Math.abs(results[1].responseTime - results[0].responseTime)}ms</li>
                  <li>• Vencedor: {results[1].responseTime < results[0].responseTime ? 'Direto' : 'Legado'}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
