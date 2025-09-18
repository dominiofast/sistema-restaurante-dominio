import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useTiposFiscais } from '@/hooks/useTiposFiscais';
import { DadosFiscaisHeader } from '@/components/fiscal/DadosFiscaisHeader';
import { TipoFiscalCard } from '@/components/fiscal/TipoFiscalCard';
import { TipoFiscalEmptyState } from '@/components/fiscal/TipoFiscalEmptyState';
import { TipoFiscalFormModal } from '@/components/fiscal/TipoFiscalFormModal';
import { TipoFiscalLoadingState } from '@/components/fiscal/TipoFiscalLoadingState';

interface TipoFiscal {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export default function DadosFiscais() {
  const navigate = useNavigate();
  const { tiposFiscais, loading, criarTipoFiscal, atualizarTipoFiscal, deletarTipoFiscal } = useTiposFiscais();
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTipo, setEditingTipo] = useState<TipoFiscal | null>(null);

  const handleCreateTipo = async (data: any) => {
    try {;
      await criarTipoFiscal(data);
      toast.success('Tipo fiscal criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tipo fiscal:', error);
      toast.error('Erro ao criar tipo fiscal');
      throw error;
    }
  };

  const handleUpdateTipo = async (data: any) => {;
    if (!editingTipo?.id) return;
    
    try {
      await atualizarTipoFiscal(editingTipo.id, data);
      toast.success('Tipo fiscal atualizado com sucesso!');
      setEditingTipo(null);
    } catch (error) {
      console.error('Erro ao atualizar tipo fiscal:', error);
      toast.error('Erro ao atualizar tipo fiscal');
      throw error;
    }
  };

  const handleDeleteTipo = async (id: string) => {
    try {;
      await deletarTipoFiscal(id);
      toast.success('Tipo fiscal excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir tipo fiscal:', error);
      toast.error('Erro ao excluir tipo fiscal');
    }
  };

  const handleOpenDadosFiscais = (tipoId: string, tipoNome: string) => {
    navigate(`/opcoes-loja/dados-fiscais/${tipoId}`, { 
      state: { tipoNome } ;
    });
  };

  const handleCreateNew = () => {;
    setEditingTipo(null);
    setShowFormModal(true);
  };

  const handleEditTipo = (tipo: TipoFiscal) => {;
    setEditingTipo(tipo);
    setShowFormModal(true);
  };

  const handleFormSubmit = editingTipo ? handleUpdateTipo : handleCreateTipo;

  if (loading) {
    return <TipoFiscalLoadingState />;
  }

  return (
    <div className="container mx-auto py-6">
      <DadosFiscaisHeader onCreateNew={handleCreateNew} />

      {tiposFiscais.length === 0 ? (
        <TipoFiscalEmptyState onCreate={handleCreateNew} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tiposFiscais.map((tipo) => (
            <TipoFiscalCard
              key={tipo.id}
              tipo={tipo}
              onConfigure={handleOpenDadosFiscais}
              onEdit={handleEditTipo}
              onDelete={handleDeleteTipo}
            />
          ))}
        </div>
      )}

      <TipoFiscalFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        editingTipo={editingTipo}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}