import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bug, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export const DominioPrinterDebug: React.FC = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState<Array<{
    endpoint: string;
    status: 'success' | 'error' | 'testing';
    message: string;
    data?: any;
  }>>([]);

  const endpoints = [
    { url: 'http://localhost:3001/health', name: 'Health Check (v2.0.1)' },
    { url: 'http://localhost:3001/api/status', name: 'Status API' },
    { url: 'http://localhost:3001/printers', name: 'Printers Direct' },
    { url: 'http://localhost:3001/api/printers', name: 'Printers API' },
  ];

  const testEndpoints = async () => {
    setIsChecking(true);
    setResults([]);
    
    for (const endpoint of endpoints) {
      // Adicionar status "testing"
      setResults(prev => [...prev, {
        endpoint: endpoint.name,
        status: 'testing',
        message: 'Testando...'
      }]);

      try {
        console.log(`🧪 Testando: ${endpoint.url}`);
        
        const response = await fetch(endpoint.url, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint.name} sucesso:`, data);
          
          setResults(prev => prev.map(r => 
            r.endpoint === endpoint.name 
              ? {
                  endpoint: endpoint.name,
                  status: 'success',
                  message: `Status: ${response.status} - ${data.success ? 'Conectado' : 'Resposta inválida'}`,
                  data
                }
              : r
          ));
        } else {
          console.log(`❌ ${endpoint.name} falhou:`, response.status, response.statusText);
          
          setResults(prev => prev.map(r => 
            r.endpoint === endpoint.name 
              ? {
                  endpoint: endpoint.name,
                  status: 'error',
                  message: `Erro: ${response.status} - ${response.statusText}`
                }
              : r
          ));
        }
      } catch (error: any) {
        console.error(`💥 Erro em ${endpoint.name}:`, error);
        
        setResults(prev => prev.map(r => 
          r.endpoint === endpoint.name 
            ? {
                endpoint: endpoint.name,
                status: 'error',
                message: `Erro de conexão: ${error.message}`
              }
            : r
        ));
      }

      // Pequena pausa entre testes
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'testing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testando...</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="w-5 h-5" />
          Diagnóstico Dominio Printer v2.0.1
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Este teste verifica todos os endpoints possíveis para determinar qual estrutura de API está sendo usada pelo Dominio Printer.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={testEndpoints} 
          disabled={isChecking}
          className="w-full"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando Endpoints...
            </>
          ) : (
            'Executar Diagnóstico Completo'
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Resultados dos Testes:</h4>
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  <span className="font-medium">{result.endpoint}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {results.some(r => r.status === 'success') && (
          <Alert>
            <CheckCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Sucesso!</strong> Pelo menos um endpoint está funcionando. 
              O sistema deve conseguir se conectar ao Dominio Printer.
            </AlertDescription>
          </Alert>
        )}

        {results.length > 0 && results.every(r => r.status === 'error') && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              <strong>Todos os endpoints falharam!</strong> Verifique se:
              <ul className="list-disc list-inside mt-2">
                <li>O Dominio Printer v2.0.1 está instalado e rodando</li>
                <li>A aplicação está na porta 3001</li>
                <li>Não há bloqueio de firewall</li>
                <li>O navegador permite conexões HTTP locais</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};