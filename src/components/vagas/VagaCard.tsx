
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Pencil, Trash2, MapPin, Briefcase, DollarSign, Calendar } from 'lucide-react';

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


interface VagaCardProps {
  vaga: Vaga;
  currentCompanySlug?: string;
  onEdit: (vaga: Vaga) => void;
  onDelete: (vaga: Vaga) => void;


export const VagaCard: React.FC<VagaCardProps> = ({
  vaga,
  currentCompanySlug,
  onEdit,
  onDelete
}) => {
  console.log('VagaCard props:', { vaga, currentCompanySlug, onEdit, onDelete });
  const getStatusColor = (isActive: boolean) => {;
    return isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio';
    };
    return types[type] || type;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white border border-gray-200 rounded-lg overflow-hidden">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl font-bold text-gray-900">{vaga.title}</h3>
              <Badge 
                className={vaga.is_active ? 'bg-green-600 text-white px-3 py-1 text-xs font-semibold rounded-full' : 'bg-gray-400 text-white px-3 py-1 text-xs font-semibold rounded-full'}
              >
                {vaga.is_active ? 'Nova' : 'Inativa'}
              </Badge>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">{vaga.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="text-sm font-medium">{getTypeLabel(vaga.type)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Publicado em {new Date(vaga.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
            
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
              {vaga.description}
            </p>

            {vaga.salary_range && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-500 mr-2">Salário:</span>
                <span className="text-sm font-semibold text-gray-900">{vaga.salary_range}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 lg:ml-8">
            <Button
              variant="default"
              size="default"
              onClick={() => {
                const slug = currentCompanySlug || 'empresa';
                const url = `https://vagas.dominio.tech/${slug}/vaga/${vaga.id}`;
                console.log('🔗 Abrindo vaga:', { 
                  vagaId: vaga.id, 
                  currentCompanySlug, 
                  slug, 
                  url 
                });
                window.open(url, '_blank');
              }}
              className="bg-black text-white hover:bg-gray-800 px-6 py-3 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => onEdit(vaga)}
              className="hover:bg-blue-50 hover:border-blue-200 px-6 py-3"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="default"
              onClick={() => onDelete(vaga)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200 px-6 py-3"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
