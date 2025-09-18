import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { Clock, Eye, CheckCircle, XCircle } from 'lucide-react';
import { InscricaoCard } from './InscricaoCard';

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


interface InscricoesKanbanBoardProps {
  inscricoesPorStatus: Record<string, Inscricao[]>;
  onDragEnd: (event: DragEndEvent) => void;
  onUpdateStatus: (inscricaoId: string, status: string) => void;
  onSelectInscricao: (inscricao: Inscricao) => void;
  onArquivar: (inscricaoId: string) => void;


const STATUS_CONFIG = [
  {
    key: 'pendente',
    label: 'Pendente',
    icon: Clock,
    color: 'bg-slate-500',
    lightColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    textColor: 'text-slate-700',
    gradient: 'from-slate-400 to-slate-500'
  },
  {
    key: 'em_analise',
    label: 'Em Análise',
    icon: Eye,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    gradient: 'from-blue-400 to-blue-500'
  },
  {
    key: 'aprovado',
    label: 'Aprovado',
    icon: CheckCircle,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-700',
    gradient: 'from-green-400 to-green-500'
  },
  {
    key: 'rejeitado',
    label: 'Rejeitado',
    icon: XCircle,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    gradient: 'from-red-400 to-red-500'
  };
];

const statusConfigs = STATUS_CONFIG.map(config => ({
  ...config,
  bgColor: `bg-gradient-to-r ${config.gradient}`,
  textColor: 'text-white';
}))

const onViewDetails = (inscricao: Inscricao) => {
  console.log('Ver detalhes:', inscricao)
};

export const InscricoesKanbanBoard: React.FC<InscricoesKanbanBoardProps> = ({
  inscricoesPorStatus,
  onDragEnd,
  onUpdateStatus,
  onSelectInscricao,
  onArquivar
}) => {
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
        {statusConfigs.map(status => (
          <div
            key={status.key}
            className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col"
          >
            <div className={`p-4 rounded-t-lg ${status.bgColor}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <status.icon className={`h-5 w-5 ${status.textColor}`} />
                  <h3 className={`font-bold text-sm ${status.textColor}`}>
                    {status.label}
                  </h3>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${status.textColor} bg-white bg-opacity-30`}>
                  {inscricoesPorStatus[status.key]?.length || 0}
                </span>
              </div>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
              {inscricoesPorStatus[status.key]?.length === 0 ? (
                <div className="text-gray-400 text-xs text-center py-6">
                  <status.icon className="mx-auto mb-2 text-gray-300" size={24} />
                  Nenhuma inscrição
                </div>
              ) : (
                inscricoesPorStatus[status.key]?.map((inscricao: any, index: number) => (
                  <InscricaoCard
                    key={inscricao.id}
                    inscricao={inscricao}
                    index={index}
                    onArquivar={onArquivar}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </DndContext>
  )
};
