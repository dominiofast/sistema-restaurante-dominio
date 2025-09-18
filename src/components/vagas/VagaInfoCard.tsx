
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, DollarSign, Clock, Users } from 'lucide-react';

interface VagaInfoCardProps {
  vaga: any;
  primaryColor: string;
  getTypeLabel: (type: string) => string;
}

const VagaInfoCard: React.FC<VagaInfoCardProps> = ({ vaga, primaryColor, getTypeLabel }) => {
  return (
    <Card className="shadow-lg border-0 bg-white sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Users className="h-4 w-4" style={{ color: primaryColor }} />
          Informações da Vaga
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <MapPin className="h-3 w-3 text-gray-500" />
          <span className="font-medium">Localização:</span>
          <span>{vaga.location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <Briefcase className="h-3 w-3 text-gray-500" />
          <span className="font-medium">Tipo:</span>
          <span>{getTypeLabel(vaga.type)}</span>
        </div>

        {vaga.salary_range && (
          <div className="flex items-center gap-2 text-gray-700 text-sm">
            <DollarSign className="h-3 w-3 text-gray-500" />
            <span className="font-medium">Salário:</span>
            <span>{vaga.salary_range}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-gray-700 text-sm">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="font-medium">Publicada em:</span>
          <span>{new Date(vaga.created_at).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <Badge 
            className="text-white px-3 py-1 text-xs font-semibold rounded-full"
            style={{ backgroundColor: primaryColor }}
          >
            Vaga Ativa
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
};

export default VagaInfoCard;
