
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Briefcase } from 'lucide-react';

interface VagasDisponiveisHeaderProps {
  currentCompanyName?: string;
  vagasCount: number;
  activeVagasCount: number;
  onNewVaga: () => void;
}

export const VagasDisponiveisHeader: React.FC<VagasDisponiveisHeaderProps> = ({
  currentCompanyName,
  vagasCount,
  activeVagasCount,
  onNewVaga
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-8 text-white w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Vagas Disponíveis</h1>
          <p className="text-blue-100 text-lg">
            Gerencie as vagas abertas da {currentCompanyName}
          </p>
          <div className="mt-4 flex items-center gap-6 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>{vagasCount} {vagasCount === 1 ? 'vaga cadastrada' : 'vagas cadastradas'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{activeVagasCount} {activeVagasCount === 1 ? 'vaga ativa' : 'vagas ativas'}</span>
            </div>
          </div>
        </div>
        <Button 
          onClick={onNewVaga} 
          className="gap-2 bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 text-lg font-medium"
        >
          <Plus className="h-5 w-5" />
          Nova Vaga
        </Button>
      </div>
    </div>
  )
};
