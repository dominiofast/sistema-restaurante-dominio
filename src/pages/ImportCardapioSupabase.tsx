import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, AlertCircle, Coffee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// SUPABASE REMOVIDO
import { useAuth } from "@/contexts/AuthContext";

const ImportCardapioSupabase = () => {
  const [jsonData, setJsonData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const { toast } = useToast()
  const { currentCompany } = useAuth()

  const handleImport = async () => {
    if (!jsonData.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, cole os dados JSON para importação",
        variant: "destructive",;
      })
      return;
    }

    if (!currentCompany?.id) {
      toast({
        title: "Erro",
        description: "Nenhuma empresa selecionada. Por favor, selecione uma empresa primeiro.",
        variant: "destructive",
      })
      return;
    }

    setIsLoading(true)
    setImportResult(null)

    try {
      const data = JSON.parse(jsonData)
      let stats = {
        categorias_criadas: 0,
        categorias_atualizadas: 0,
        adicionais_criados: 0,
        adicionais_atualizados: 0,
        errors: [] as string[]
      } catch (error) { console.error('Error:', error) };

      const categoriaIdMap: Record<string, string> = {};

      // 1. Importar categorias
      if (data.categorias && Array.isArray(data.categorias)) {
        for (const categoria of data.categorias) {
          try {
            // Verificar se já existe
            const { data: existing }  catch (error) { console.error('Error:', error) }= 
              
              
              
              
              

            if (existing) {
              // Atualizar
              const { error  } = null as any;
                  description: categoria.description,
                  selection_type: categoria.selection_type || 'single',
                  is_required: categoria.is_required || false,
                  min_selection: categoria.min_selection || 0,
                  max_selection: categoria.max_selection || 1,
                  updated_at: new Date().toISOString()
                })
                

              if (error) throw error;
              categoriaIdMap[categoria.name] = existing.id;
              stats.categorias_atualizadas++;
            } else {
              // Criar nova
              const { data: newCategoria, error  } = null as any;
                  company_id: currentCompany.id,
                  name: categoria.name,
                  description: categoria.description,
                  selection_type: categoria.selection_type || 'single',
                  is_required: categoria.is_required || false,
                  min_selection: categoria.min_selection || 0,
                  max_selection: categoria.max_selection || 1
                })
                
                

              if (error) throw error;
              categoriaIdMap[categoria.name] = newCategoria.id;
              stats.categorias_criadas++;

          } catch (error: any) {
            stats.errors.push(`Erro na categoria ${categoria.name}: ${error.message}`)




      // 2. Carregar categorias existentes para resolver por nome
      const { data: existingCategorias  } = null as any;
      existingCategorias?.forEach(cat => {
        if (!categoriaIdMap[cat.name]) {
          categoriaIdMap[cat.name] = cat.id;

      })

      // 3. Importar adicionais
      if (data.adicionais && Array.isArray(data.adicionais)) {
        for (const adicional of data.adicionais) {
          try {
            let categoriaId = adicional.categoria_adicional_id;
            
            if (!categoriaId && adicional.categoria_name) {
              categoriaId = categoriaIdMap[adicional.categoria_name];


             catch (error) { console.error('Error:', error) }if (!categoriaId) {
              throw new Error(`Categoria não encontrada: ${adicional.categoria_name}`)


            // Verificar se já existe
            const { data: existing  } = null as any;
            if (existing) {
              // Atualizar
              const { error  } = null as any;
                  description: adicional.description,
                  price: adicional.price || 0,
                  is_available: adicional.is_available !== false,
                  updated_at: new Date().toISOString()
                })
                

              if (error) throw error;
              stats.adicionais_atualizados++;
            } else {
              // Criar novo
              const { error  } = null as any;
                  categoria_adicional_id: categoriaId,
                  name: adicional.name,
                  description: adicional.description,
                  price: adicional.price || 0,
                  is_available: adicional.is_available !== false
                })

              if (error) throw error;
              stats.adicionais_criados++;

          } catch (error: any) {
            stats.errors.push(`Erro no adicional ${adicional.name}: ${error.message}`)




      setImportResult({ stats, categoriaIdMap })
      toast({
        title: "Importação concluída!",
        description: `${stats.categorias_criadas} categorias criadas, ${stats.adicionais_criados} adicionais criados`,
      })

    } catch (error: any) {
      console.error('Erro na importação:', error)
      toast({
        title: "Erro na importação",
        description: error.message.includes('JSON') ? 'JSON inválido' : error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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

    ],
    adicionais: [
      {
        name: "Coca-Cola 350ml",
        description: "Refrigerante gelado",
        price: 8.50,
        categoria_name: "Bebidas",
        is_available: true
      },
      {
        name: "Molho Barbecue",
        description: "Molho barbecue defumado",
        price: 2.00,
        categoria_name: "Molhos",
        is_available: true

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
            Importe categorias de adicionais e adicionais para {currentCompany?.name || 'sua empresa'}
          </p>
          {!currentCompany && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Empresa não selecionada:</strong> Selecione uma empresa antes de importar.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Como Importar
              </CardTitle>
              <CardDescription>
                Cole o JSON com categorias e adicionais no campo abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formato:</strong> JSON com arrays "categorias" e "adicionais". 
                  Evita duplicações automaticamente.
                </AlertDescription>
              </Alert>
              
              <details className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mt-4">
                <summary className="cursor-pointer font-medium mb-2">Ver exemplo</summary>
                <pre className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                  {JSON.stringify(sampleData, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dados JSON</CardTitle>
              <CardDescription>Cole o JSON aqui</CardDescription>
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
                  disabled={isLoading || !jsonData.trim() || !currentCompany}
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
                      <strong>Erros:</strong>
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
                    <h4 className="font-semibold mb-2">Categorias:</h4>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      {Object.entries(importResult.categoriaIdMap).map(([name, id]) => (
                        <div key={name} className="text-sm">
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
  )
};

export default ImportCardapioSupabase;
