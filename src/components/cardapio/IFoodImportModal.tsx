import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Rocket, AlertTriangle, CheckCircle, Loader2, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCardapio } from '@/hooks/useCardapio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Tipagem para o preview do item
interface PreviewItem {
  name: string;
  description?: string;
  price: number;
  image?: string;
  selected: boolean;
  categoria_id?: string;
}

interface IFoodImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  // onImport será usado na próxima fase
}

export const IFoodImportModal: React.FC<IFoodImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentCompany } = useAuth();
  const { categorias } = useCardapio();
  
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewItems, setPreviewItems] = useState<PreviewItem[]>([]);

  const handlePreview = async () => {
    setIsLoading(true);
    setError(null);
    setPreviewItems([]);

    try {
      // Usar a função Supabase para fazer o preview
      const { data, error: functionError } = await supabase.functions.invoke('ifood-import-preview', {
        body: { url }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Erro ao chamar a função de preview');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data || !Array.isArray(data)) {
        throw new Error('Resposta inválida do servidor');
      }

      // Adicionar o campo selected e categoria_id aos itens
      const itemsWithSelection = data.map(item => ({
        ...item,
        selected: true,
        categoria_id: categorias[0]?.id || '' // Seleciona a primeira categoria por padrão
      }));

      setPreviewItems(itemsWithSelection);

      if (itemsWithSelection.length === 0) {
        throw new Error('Nenhum item encontrado. A loja pode estar fechada ou a URL pode estar incorreta.');
      }

    } catch (err: any) {
      console.error('Erro ao fazer preview:', err);
      setError(err.message || 'Ocorreu um erro ao analisar o cardápio.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImport = async () => {
    setIsImporting(true);
    setError(null);
    setSuccessMessage(null);
    const itemsToImport = previewItems.filter(item => item.selected);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ifood-import-execute', {
        body: { 
          company_id: currentCompany?.id,
          items: itemsToImport,
          source_url: url 
        },
      });

      // Tratamento de erro mais robusto
      if (functionError) {
        console.error('Erro da função Supabase:', functionError);
        throw new Error(functionError.message || 'Ocorreu um erro na execução da importação.');
      }
      
      if (data && data.error) {
        console.error('Erro retornado no corpo da função:', data.error);
        throw new Error(data.error);
      }
      
      if (data && data.message) {
        setSuccessMessage(data.message);
        setPreviewItems([]); // Limpa a lista de preview no sucesso
      } else {
        // Lida com casos onde a resposta é 200 OK, mas o corpo é inesperado
        console.error('Resposta de sucesso inesperada do servidor:', data);
        throw new Error('A importação parece ter sido concluída, mas a resposta do servidor foi inválida.');
      }

    } catch (err: any) {
      console.error('Erro capturado durante a importação:', err);
      setError(err.message || 'Ocorreu um erro desconhecido durante a importação.');
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleClose = () => {
    // Resetar o estado ao fechar
    setUrl('');
    setPreviewItems([]);
    setError(null);
    setSuccessMessage(null);
    onClose();
  };

  const toggleItemSelection = (index: number) => {
    const updatedItems = [...previewItems];
    updatedItems[index].selected = !updatedItems[index].selected;
    setPreviewItems(updatedItems);
  };

  const handleCategoryChange = (index: number, categoria_id: string) => {
    const updatedItems = [...previewItems];
    updatedItems[index].categoria_id = categoria_id;
    setPreviewItems(updatedItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Importar Cardápio do iFood
          </DialogTitle>
          <DialogDescription>
            Cole a URL do seu cardápio no iFood para importar. O sistema usa a API do Firecrawl para extrair automaticamente os itens do cardápio.
          </DialogDescription>
        </DialogHeader>
        
        {successMessage && (
          <div className="py-4">
            <div className="text-green-600 text-sm flex items-center gap-2 bg-green-50 p-3 rounded-md">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          </div>
        )}
        
        {previewItems.length === 0 && !successMessage && (
          <div className="py-4 space-y-2">
            <Input
              placeholder="https://www.ifood.com.br/delivery/sua-loja"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            
            {/* Info sobre Firecrawl */}
            <div className="text-blue-600 text-sm flex items-start gap-2 bg-blue-50 p-3 rounded-md">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Powered by Firecrawl</p>
                <p className="text-xs text-blue-700">
                  Usamos a API do Firecrawl para extração inteligente de dados. 
                  <a 
                    href="https://www.firecrawl.dev/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 ml-1 text-blue-800 hover:underline"
                  >
                    Saiba mais <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            
            {error && (
              <div className="text-red-600 text-sm flex items-center gap-2 bg-red-50 p-3 rounded-md">
                <AlertTriangle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {previewItems.length > 0 && (
          <div className="mt-4 max-h-80 overflow-y-auto pr-2">
            <h3 className="font-semibold mb-2">{previewItems.length} itens encontrados:</h3>
            <ul className="space-y-3">
              {previewItems.map((item, index) => (
                <li key={index} className="flex gap-3 items-start p-3 border rounded-md bg-gray-50">
                  <input 
                    type="checkbox" 
                    checked={item.selected} 
                    onChange={() => toggleItemSelection(index)} 
                    className="h-4 w-4 mt-1" 
                  />
                  {item.image && (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                  )}
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-xs text-green-600 font-bold">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <Select 
                      value={item.categoria_id} 
                      onValueChange={(value) => handleCategoryChange(index, value)}
                      disabled={!item.selected}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.id} value={categoria.id}>
                            {categoria.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {successMessage ? 'Fechar' : (previewItems.length > 0 ? 'Cancelar' : 'Fechar')}
          </Button>
          {!successMessage && (
            <Button 
              onClick={previewItems.length > 0 ? handleImport : handlePreview} 
              disabled={isLoading || isImporting || !url || (previewItems.length > 0 && previewItems.filter(item => item.selected).length === 0)}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Analisando...' : (isImporting ? 'Importando...' : (previewItems.length > 0 ? 'Importar Selecionados' : 'Analisar Cardápio'))}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 