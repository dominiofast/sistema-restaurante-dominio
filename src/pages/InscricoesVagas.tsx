
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InscricoesHeader } from '@/components/vagas/InscricoesHeader';
import { InscricoesLoadingState } from '@/components/vagas/InscricoesLoadingState';
import { InscricoesEmptyState } from '@/components/vagas/InscricoesEmptyState';
import { InscricoesKanbanBoard } from '@/components/vagas/InscricoesKanbanBoard';
import { InscricaoDetailsDialog } from '@/components/vagas/InscricaoDetailsDialog';
import { useInscricoes } from '@/hooks/useInscricoes';

interface Inscricao {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  linkedin_url?: string;
  curriculo_url?: string;
  curriculo_nome?: string;
  carta_apresentacao?: string;
  experiencia_relevante?: string;
  pretensao_salarial?: string;
  disponibilidade_inicio?: string;
  status: string;
  created_at: string;
  arquivado?: boolean;
  rh_vagas: {
    title: string;
    location: string;
  };


const InscricoesVagas: React.FC = () => {
  const { companyId, currentCompany, user } = useAuth()
  const [selectedInscricao, setSelectedInscricao] = useState<Inscricao | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const {
    inscricoes,
    loading,
    inscricoesPorStatus,
    updateStatus,
    arquivarInscricao,
    onDragEnd,
    fetchInscricoes
  } = useInscricoes(companyId)

  useEffect(() => {
    console.log('InscricoesVagas - Estado atual:')
    console.log('- User:', user)
    console.log('- CompanyId:', companyId)
    console.log('- CurrentCompany:', currentCompany)
    console.log('- Loading:', loading)
    console.log('- Inscricoes count:', inscricoes.length)
    console.log('- Inscricoes data:', inscricoes)
  }, [user, companyId, currentCompany, loading, inscricoes])

  const onSelectInscricao = useCallback((inscricao: Inscricao) => {
    setSelectedInscricao(inscricao)
    setDetailsOpen(true)
  }, [])

  const handleRefresh = useCallback(() => {
    console.log('Recarregando inscrições manualmente...')
    fetchInscricoes()
  }, [fetchInscricoes])

  const handleArquivar = useCallback((inscricaoId: string) => {
    arquivarInscricao(inscricaoId)
  }, [arquivarInscricao])

  if (loading) {
    return <InscricoesLoadingState />;


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <InscricoesHeader 
          currentCompanyName={currentCompany?.name} 
          onRefresh={handleRefresh}
        />
      </div>

      {inscricoes.length === 0 ? (
        <InscricoesEmptyState />
      ) : (
        <>
          <InscricoesKanbanBoard
            inscricoesPorStatus={inscricoesPorStatus}
            onDragEnd={onDragEnd}
            onUpdateStatus={updateStatus}
            onSelectInscricao={onSelectInscricao}
            onArquivar={handleArquivar}
          />

          <InscricaoDetailsDialog
            open={detailsOpen}
            onOpenChange={setDetailsOpen}
            inscricao={selectedInscricao}
            onUpdateStatus={updateStatus}
          />
        </>
      )}
    </div>
  )
};

export default InscricoesVagas;
