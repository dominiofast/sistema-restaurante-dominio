import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintConfigForm } from './PrintConfigForm';
import { usePrinter } from '@/hooks/usePrinter';
import { Printer } from 'lucide-react';

interface PrintConfig {
  width: number;
  removeAccents: boolean;
  marginLeft: number;
}

export function PrintExample() {
  const { printReceipt, isPrinting } = usePrinter()
  const [printConfig, setPrintConfig] = useState<PrintConfig>({
    width: 48,
    removeAccents: true,
    marginLeft: 0
  })

  const handleTestPrint = async () => {
    const testData = {
      nomeEmpresa: 'EMPRESA TESTE LTDA',
      enderecoEmpresa: 'Rua das Flores, 123 - Centro',
      telefoneEmpresa: '(11) 9999-9999',
      numeroPedido: '001',
      cliente: {
        nome: 'João da Silva',
        telefone: '(11) 8888-8888',
        endereco: 'Rua dos Testes, 456'
      },
      itens: [
        { nome: 'Pizza Margherita', quantidade: 1, preco: 35.00 },
        { nome: 'Refrigerante 2L', quantidade: 2, preco: 8.50, observacoes: 'Gelado' },
        { nome: 'Batata Frita Grande', quantidade: 1, preco: 15.00 }
      ],
      formaPagamento: 'PIX',
      config: printConfig;
    };

    await printReceipt(testData, '550e8400-e29b-41d4-a716-446655440001')
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo de Configuração de Largura</CardTitle>
          <CardDescription>
            Configure a largura e teste a impressão com diferentes formatos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de configuração */}
            <div>
              <PrintConfigForm 
                config={printConfig}
                onConfigChange={setPrintConfig}
              />
            </div>

            {/* Exemplo de código */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Como usar no código:</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-x-auto">
{`// Exemplo de uso
const printData = {
  nomeEmpresa: "Minha Empresa",
  enderecoEmpresa: "Endereço completo",
  telefoneEmpresa: "(11) 9999-9999",
  numeroPedido: "001",
  itens: [
    {
      nome: "Produto",
      quantidade: 1,
      preco: 10.00
    }
  ],
  config: {
    width: ${printConfig.width},
    removeAccents: ${printConfig.removeAccents},
    marginLeft: ${printConfig.marginLeft}
  };
};

// Imprimir
await printReceipt(printData, companyId)`}
                </pre>
              </div>

              <div className="mt-4">
                <Button 
                  onClick={handleTestPrint}
                  disabled={isPrinting}
                  className="w-full"
                >
                  <Printer className="w-4 h-4 mr-2" />
                  {isPrinting ? 'Imprimindo...' : 'Testar Impressão'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exemplos de diferentes formatos */}
      <Card>
        <CardHeader>
          <CardTitle>Exemplos de Diferentes Formatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              onClick={() => setPrintConfig({ width: 48, removeAccents: true, marginLeft: 0 })}
              className="bg-brand-blue-500 text-white hover:bg-brand-blue-600"
            >
              Cupom Fiscal (48)
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPrintConfig({ width: 32, removeAccents: true, marginLeft: 0 })}
              className="bg-brand-coral-500 text-white hover:bg-brand-coral-600"
            >
              Cupom Pequeno (32)
            </Button>
            <Button
              variant="secondary"
              onClick={() => setPrintConfig({ width: 24, removeAccents: false, marginLeft: 2 })}
              className="bg-erp-blue-500 text-white hover:bg-erp-blue-600"
            >
              Etiqueta (24)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
