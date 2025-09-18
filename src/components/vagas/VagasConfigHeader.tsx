
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface VagasConfigHeaderProps {
  publicUrl: string;
}

const VagasConfigHeader: React.FC<VagasConfigHeaderProps> = ({ publicUrl }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Página de Vagas</h1>
        <p className="text-gray-600">Personalize a página de carreiras da sua empresa.</p>
      </div>
      <a href={publicUrl} target="_blank" rel="noopener noreferrer">
        <Button variant="outline">
          <Eye className="mr-2 h-4 w-4" />
          Ver Página Pública
        </Button>
      </a>
    </div>
  )
};

export default VagasConfigHeader;
