import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { testWhatsAppIntegration } from "@/utils/testIntegration";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const TestIntegration = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const testResult = await testWhatsAppIntegration();
      setResult(testResult);
    } catch (error) {
      setResult({ success: false, error: (error as Error).message });
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCESSO: Nome sendo usado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PROBLEMA: Nome não está sendo usado':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Teste de Integração WhatsApp + IA</h1>
          <p className="text-muted-foreground">
            Teste completo para verificar se o sistema está usando a nova configuração
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Executar Teste Completo</CardTitle>
            <CardDescription>
              Este teste vai verificar se o webhook, prompt e personalização estão funcionando
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={runTest} 
              disabled={testing}
              className="w-full"
            >
              {testing ? 'Testando...' : 'Executar Teste'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Resultado do Teste
                {getStatusIcon(result.conclusion)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.conclusion && (
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">Conclusão:</h3>
                  <Badge variant={
                    result.conclusion.includes('SUCESSO') ? 'default' : 
                    result.conclusion.includes('PROBLEMA') ? 'secondary' : 'destructive'
                  }>
                    {result.conclusion}
                  </Badge>
                </div>
              )}

              {result.results && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Configurações:</h3>
                    <div className="text-sm space-y-1">
                      <div>Integração: {result.results.integration_ok ? '✅' : '❌'}</div>
                      <div>Prompt versão: {result.results.prompt_version}</div>
                      <div>Tem customer_name: {result.results.prompt_has_customer_name ? '✅' : '❌'}</div>
                      <div>Atualizado em: {new Date(result.results.prompt_updated_at).toLocaleString('pt-BR')}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold">Teste de Execução:</h3>
                    <div className="text-sm space-y-1">
                      <div>Webhook: {result.results.webhook_test.success ? '✅' : '❌'}</div>
                      <div>Logs criados: {result.results.logs_created}</div>
                      {result.results.webhook_test.error && (
                        <div className="text-red-500">Erro: {result.results.webhook_test.error}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {result.results?.logs_content && (
                <div>
                  <h3 className="font-semibold mb-2">Logs criados:</h3>
                  <div className="space-y-2">
                    {result.results.logs_content.map((log: any, index: number) => (
                      <div key={index} className="p-2 bg-muted rounded text-sm">
                        <div className="font-mono">
                          <span className="text-blue-600">{log.type}:</span> {log.content}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h3 className="font-semibold text-red-800">Erro:</h3>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TestIntegration;