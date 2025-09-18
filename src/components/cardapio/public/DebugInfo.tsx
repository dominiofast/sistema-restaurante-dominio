
import React from 'react';

interface Categoria {
  id: string;
  name: string;
}

interface Produto {
  id: string;
  name: string;
  categoria_id?: string;
  destaque?: boolean;
}

interface DebugInfoProps {
  company: {
    id: string;
    name: string;
  } | null;
  categorias: Categoria[];
  produtos: Produto[];
  categoriaSelecionada: string | null;
  produtosFiltrados: Produto[];
  produtosFinal: Produto[];
  searchTerm: string;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  company,
  categorias,
  produtos,
  categoriaSelecionada,
  produtosFiltrados,
  produtosFinal,
  searchTerm
}) => {
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
      <div><strong>Debug Info:</strong></div>
      <div>• Empresa: {company?.name} (ID: {company?.id})</div>
      <div>• Categorias: {categorias.length}</div>
      <div>• Produtos: {produtos.length}</div>
      <div>• Categoria selecionada: {categoriaSelecionada ? categorias.find(c => c.id === categoriaSelecionada)?.name : 'Destaques'}</div>
      <div>• Produtos filtrados: {produtosFiltrados.length}</div>
      <div>• Produtos finais (após busca): {produtosFinal.length}</div>
      <div>• Termo de busca: "{searchTerm}"</div>
    </div>
  )
};
