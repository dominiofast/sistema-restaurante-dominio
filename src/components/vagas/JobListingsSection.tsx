
import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Calendar } from 'lucide-react';
import { Vaga } from '../../types/vagas';

interface JobListingsSectionProps {
  vagas: Vaga[];
  primaryColor: string;
  slug: string;
}

const JobListingsSection: React.FC<JobListingsSectionProps> = ({
  vagas,
  primaryColor,
  slug
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric';
    })
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
      <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oportunidades Disponíveis</h2>
        <p className="text-gray-600">Encontre a vaga perfeita para você</p>
      </div>
      
      <div className="divide-y divide-gray-100">
        {vagas.length > 0 ? (
          vagas.map((vaga) => (
            <div key={vaga.id} className="p-8 hover:bg-gray-50 transition-all duration-200 group">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-grow">
                  <div className="flex items-center mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[var(--primary-color)] transition-colors duration-200">
                      {vaga.title}
                    </h3>
                    <span 
                      className="ml-3 px-3 py-1 text-xs font-semibold rounded-full text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Nova
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{vaga.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">{vaga.type}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">Publicado em {formatDate(vaga.created_at)}</span>
                    </div>
                  </div>

                  {vaga.description && (
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-4">
                      {vaga.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  )}

                  {vaga.salary_range && (
                    <div className="flex items-center mb-4">
                      <span className="text-sm text-gray-500 mr-2">Salário:</span>
                      <span className="text-sm font-semibold text-gray-900">{vaga.salary_range}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0 lg:ml-8">
                  <Link 
                    to={`/${slug}/vaga/${vaga.id}`} 
                    className="inline-flex items-center justify-center px-6 py-3 text-sm text-white font-semibold rounded-lg shadow-sm hover:opacity-90 transition-all duration-200 whitespace-nowrap"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Briefcase className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>Ver Detalhes</span>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Briefcase className="h-8 w-8" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma vaga disponível</h3>
            <p className="text-gray-600">No momento não temos posições abertas, mas fique atento para futuras oportunidades!</p>
          </div>
        )}
      </div>
    </div>
  )
};

export default JobListingsSection;
