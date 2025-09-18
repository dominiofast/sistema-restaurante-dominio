import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
// SUPABASE REMOVIDO
import { focusNFeService } from '@/services/focusNFeService';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export const TesteFocusNFe: React.FC = () => {
  const { currentCompany } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);

  const testarNFCe = async () => {
    if (!currentCompany?.id) {
      setErro('Nenhuma empresa selecionada');
      return;
    }

    setLoading(true);
    setErro(null);
    setResultado(null);

    try {
      // Primeiro teste: chamar função de teste simples
      console.log('Testando função básica...');
      const testResponse = await /* supabase REMOVIDO */ null; //functions.invoke('focus-nfe-test', {
        body: {
          test: true,
          company_id: currentCompany.id,
          timestamp: Date.now()
        }
      });

      console.log('Resposta do teste:', testResponse);

      if (testResponse.error) {
        setErro('Erro no teste básico: ' + testResponse.error.message);
        return;
      }

      // Criar dados de teste
      const dadosTeste = {
        numero_pedido: `TESTE-${Date.now()}`,
        mesa: "01",
        atendente: "Sistema",
        cliente: {
          nome: "Cliente Teste",
          cpf: "12345678901"
        },
        itens: [
          {
            codigo: "PROD001",
            nome: "Pizza Margherita",
            quantidade: 1,
            preco_unitario: 25.90,
            unidade: "UN",
            ncm: "21069090",
            cfop: "5102",
            cst_csosn: "102",
            aliquota_icms: 0.00,
            origem_produto: "0"
          }
        ],
        pagamentos: [
          {
            tipo: "dinheiro",
            valor: 25.90
          }
        ]
      };

      console.log('Testando NFCe com dados:', dadosTeste);
      
      const result = await focusNFeService.gerarNFCe(currentCompany.id, dadosTeste);
      console.log('Resultado:', result);
      
      if (result.success) {
        setResultado(result);
      } else {
        setErro(result.error || 'Erro desconhecido');
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      setErro(error.message || 'Erro ao testar NFCe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Teste Focus NFe - Homologação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Este teste irá gerar uma NFCe de teste no ambiente de homologação da Focus NFe.
        </div>

        <Button 
          onClick={testarNFCe} 
          disabled={loading || !currentCompany?.id}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Geração de NFCe'
          )}
        </Button>

        {erro && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro:</strong> {erro}
            </AlertDescription>
          </Alert>
        )}

        {resultado && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Sucesso!</strong> NFCe gerada com sucesso.
              <div className="mt-2 text-xs">
                <pre className="bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(resultado, null, 2)}
                </pre>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {!currentCompany?.id && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhuma empresa selecionada. Selecione uma empresa para testar.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};