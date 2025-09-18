
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { Produto } from '@/types/cardapio';
// Função para fazer requests à API PostgreSQL
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}

interface CopiarAdicionaisTabProps {
  produto: Produto;
  produtos: Produto[];
  onRefresh: () => void;
}

export const CopiarAdicionaisTab: React.FC<CopiarAdicionaisTabProps> = ({
  produto,
  produtos,
  onRefresh
}) => {
  const [loading, setLoading] = useState(false);
  const [produtoParaCopiar, setProdutoParaCopiar] = useState('');

  const copiarAdicionaisDeProduto = async () => {
    if (!produtoParaCopiar) return;

    try {
      setLoading(true);
      
      const categoriasParaCopiar = await apiRequest(`/api/produto-categorias-adicionais?produto_id=${produtoParaCopiar}`);

      for (const categoria of categoriasParaCopiar || []) {
        await apiRequest('/api/produto-categorias-adicionais', {
          method: 'POST',
          body: JSON.stringify({
            produto_id: produto.id,
            categoria_adicional_id: categoria.categoria_adicional_id,
            is_required: categoria.is_required,
            min_selection: categoria.min_selection,
            max_selection: categoria.max_selection
          })
        });
      }

      onRefresh();
      setProdutoParaCopiar('');
    } catch (error) {
      console.error('Erro ao copiar adicionais:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-900">Copiar Adicionais de Outro Produto</h3>
      
      <div>
        <Label className="text-sm font-medium text-gray-900">Selecionar Produto</Label>
        <Select value={produtoParaCopiar} onValueChange={setProdutoParaCopiar}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecione um produto para copiar os adicionais" />
          </SelectTrigger>
          <SelectContent>
            {produtos
              .filter(p => p.id !== produto.id)
              .map((prod) => (
              <SelectItem key={prod.id} value={prod.id}>
                {prod.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button 
        onClick={copiarAdicionaisDeProduto} 
        disabled={loading || !produtoParaCopiar}
        className="bg-gray-600 hover:bg-gray-700 text-white"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copiar Adicionais
      </Button>
    </div>
  );
};
