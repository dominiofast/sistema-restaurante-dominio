import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Mail, Phone, Linkedin, FileText, Eye, Calendar, User, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

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


interface InscricaoCardProps {
  inscricao: Inscricao;
  index: number;
  onArquivar: (inscricaoId: string) => void;


export const InscricaoCard: React.FC<InscricaoCardProps> = ({ inscricao, index, onArquivar }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: inscricao.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm transition-all cursor-grab ${
        isDragging 
          ? 'shadow-lg ring-2 ring-blue-400 cursor-grabbing scale-105 opacity-75' 
          : 'hover:shadow-md'
      }`}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 truncate">
              {inscricao.nome_completo}
            </h4>
            <p className="text-sm text-gray-500 truncate">
              {inscricao.rh_vagas.title}
            </p>
          </div>
          <div className="flex gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                window.open(`mailto:${inscricao.email}`, '_blank')
              }}
              className="h-8 w-8 p-0"
            >
              <Mail className="h-3 w-3" />
            </Button>
            {inscricao.curriculo_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(inscricao.curriculo_url, '_blank')
                }}
                className="h-8 w-8 p-0"
              >
                <FileText className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onArquivar(inscricao.id)
              }}
              className="h-8 w-8 p-0 text-gray-400 hover:text-red-500"
            >
              <Archive className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{inscricao.email}</span>
          </div>
          
          {inscricao.telefone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone className="h-3 w-3" />
              <span>{inscricao.telefone}</span>
            </div>
          )}
          
          {inscricao.linkedin_url && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Linkedin className="h-3 w-3" />
              <a 
                href={inscricao.linkedin_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 truncate"
                onClick={e => e.stopPropagation()}
              >
                LinkedIn
              </a>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date(inscricao.created_at).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {inscricao.pretensao_salarial && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Pretensão:</span> {inscricao.pretensao_salarial}
            </div>
          </div>
        )}
      </div>
    </div>
  )
};
