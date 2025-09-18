
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Briefcase } from 'lucide-react';
import { VagaCard } from './VagaCard';

interface Vaga {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range?: string;
  requirements?: string;
  benefits?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  config_id: string;
  company_id: string;
  apply_url?: string;


interface VagasListProps {
  vagas: Vaga[];
  currentCompanySlug?: string;
  onNewVaga: () => void;
  onEdit: (vaga: Vaga) => void;
  onDelete: (vaga: Vaga) => void;


export const VagasList: React.FC<VagasListProps> = ({
  vagas,
  currentCompanySlug,
  onNewVaga,
  onEdit,
  onDelete
}) => {
  if (vagas.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
        <Briefcase className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma vaga cadastrada
        </h3>
        <p className="text-gray-600 mb-6">
          Comece criando sua primeira vaga
        </p>
        <Button onClick={onNewVaga} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4" />
          Nova Vaga
        </Button>
      </div>
    )


  return (
    <div className="space-y-4">
      {vagas.map((vaga) => (
        <VagaCard
          key={vaga.id}
          vaga={vaga}
          currentCompanySlug={currentCompanySlug}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
};
