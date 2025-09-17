
import React from 'react';
import { Briefcase, MapPin, Clock, Building2, CheckCircle } from 'lucide-react';
import { Vaga, PageConfig } from '../../types/vagas';

interface VagaJobInfoProps {
  vaga: Vaga;
  config: PageConfig;
}

const VagaJobInfo: React.FC<VagaJobInfoProps> = ({ vaga, config }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Informações da Vaga */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Informações da Vaga</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Empresa</p>
              <p className="font-medium text-gray-900">{config.company_name}</p>
            </div>
          </div>

          <div className="flex items-start">
            <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Localização</p>
              <p className="font-medium text-gray-900">{vaga.location}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <Briefcase className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Tipo de Contrato</p>
              <p className="font-medium text-gray-900">{vaga.type}</p>
            </div>
          </div>

          {vaga.salary_range && (
            <div className="flex items-start">
              <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Faixa Salarial</p>
                <p className="font-medium text-gray-900">{vaga.salary_range}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <Clock className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Data de Publicação</p>
              <p className="font-medium text-gray-900">{formatDate(vaga.created_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status da Vaga */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-center">
          <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <p className="font-semibold text-green-800">Vaga Ativa</p>
            <p className="text-sm text-green-600">Estamos recebendo candidaturas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VagaJobInfo;
