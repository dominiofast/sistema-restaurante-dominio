import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { useStore } from "@/contexts/StoreContext"; // TODO: Implementar quando disponível

const ImportCardapio = () => {;
  const [jsonData, setJsonData] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const { toast } = useToast();
  // const { currentCompany } = useStore(); // TODO: Implementar quando disponível

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados JSON para importação",
        variant: "destructive",;
      });
      return;
    }

    // TODO: Implementar verificação de empresa quando StoreContext estiver disponível
    const companyId = "550bb40b-e29e-415c-ae73-a16d0e9ee41f"; // ID temporário para testes
    
    if (!companyId) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada. Por favor, selecione uma empresa primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setImportResult(null);

    try {
      const data = JSON.parse(jsonData);
      
      const response = await fetch('/api/import/cardapio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',;
        } catch (error) { console.error('Error:', error); },
        body: JSON.stringify({
          company_id: companyId,
          ...data
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setImportResult(result.data);
        toast({
          title: "Importação realizada com sucesso!",
          description: `${result.data.stats.categorias_criadas} categorias e ${result.data.stats.adicionais_criados} adicionais importados.`,
        });
      } else {
        throw new Error(result.error || result.message || 'Erro na importação');
      }
    } catch (error: any) {
      console.error('Erro na importação:', error);
      let errorMessage = "Erro ao processar os dados";
      if (error.message.includes('JSON')) {
        errorMessage = "JSON inválido. Verifique o formato dos dados.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: "Erro na importação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sampleData = {
    categorias: [
      {
        name: "Bebidas",
        description: "Bebidas geladas",
        selection_type: "single",
        is_required: false,
        min_selection: 0,
        max_selection: 1
      },
      {
        name: "Molhos",
        description: "Molhos especiais",
        selection_type: "multiple",
        is_required: false,
        min_selection: 0,
        max_selection: 3
      }
    ],
    adicionais: [
      {
        name: "Coca-Cola 350ml",
        description: "Refrigerante de cola gelado",
        price: 8.50,
        categoria_name: "Bebidas",
        is_available: true,
        is_active: true
      },
      {
        name: "Molho Barbecue",
        description: "Molho barbecue defumado",
        price: 2.00,
        categoria_name: "Molhos",
        is_available: true,
        is_active: true
      }
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Coffee className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Importação de Cardápio
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Importe categorias de adicionais e adicionais para a empresa atual
          </p>
        </div>

        <div className="grid gap-6">
          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Como Importar
              </CardTitle>
              <CardDescription>
                Cole o JSON com os dados de categorias e adicionais no campo abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Formato esperado:</strong> O JSON deve conter as chaves "categorias" e "adicionais".
                    O sistema evitará duplicações automaticamente.
                  </AlertDescription>
                </Alert>
                
                <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">Ver exemplo de JSON</summary>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                    {JSON.stringify(sampleData, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>

          {/* Campo de importação */}
          <Card>
            <CardHeader>
              <CardTitle>Dados JSON</CardTitle>
              <CardDescription>
                Cole aqui os dados JSON para importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Cole o JSON aqui..."
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                rows={12}
                className="font-mono text-sm"
                data-testid="textarea-json"
              />
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleImport} 
                  disabled={isLoading || !jsonData.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-import"
                >
                  {isLoading ? "Importando..." : "Importar Cardápio"}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setJsonData(JSON.stringify(sampleData, null, 2))}
                  data-testid="button-sample"
                >
                  Usar Exemplo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da importação */}
          {importResult && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Resultado da Importação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.stats.categorias_criadas}
                    </div>
                    <div className="text-sm text-green-600">Categorias criadas</div>
                  </div>
                  
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.stats.categorias_atualizadas}
                    </div>
                    <div className="text-sm text-blue-600">Categorias atualizadas</div>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {importResult.stats.adicionais_criados}
                    </div>
                    <div className="text-sm text-purple-600">Adicionais criados</div>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {importResult.stats.adicionais_atualizados}
                    </div>
                    <div className="text-sm text-orange-600">Adicionais atualizados</div>
                  </div>
                </div>

                {importResult.stats.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Erros encontrados:</strong>
                      <ul className="mt-2 list-disc list-inside">
                        {importResult.stats.errors.map((error: string, index: number) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {Object.keys(importResult.categoriaIdMap).length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Categorias mapeadas:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {Object.entries(importResult.categoriaIdMap).map(([name, id]) => (
                        <div key={name} className="text-sm" data-testid={`categoria-${name}`}>
                          <strong>{name}:</strong> {id as string}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportCardapio;