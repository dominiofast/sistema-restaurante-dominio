
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';
import { Produto } from '@/types/cardapio';
// SUPABASE REMOVIDO
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
      
      const { data: categoriasParaCopiar, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'produto_categorias_adicionais')
        /* .select\( REMOVIDO */ ; //'*')
        /* .eq\( REMOVIDO */ ; //'produto_id', produtoParaCopiar);

      if (error) throw error;

      for (const categoria of categoriasParaCopiar || []) {
        /* await supabase REMOVIDO */ null
          /* .from REMOVIDO */ ; //'produto_categorias_adicionais')
          /* .insert\( REMOVIDO */ ; //[{
            produto_id: produto.id,
            categoria_adicional_id: categoria.categoria_adicional_id,
            is_required: categoria.is_required,
            min_selection: categoria.min_selection,
            max_selection: categoria.max_selection
          }]);
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
