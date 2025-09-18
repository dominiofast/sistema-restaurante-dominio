
import React from 'react';
import { User } from 'lucide-react';
import { PageConfig } from '../../types/vagas';

interface VagaApplicationCardProps {
  config: PageConfig;
  showForm: boolean;
  onShowForm: () => void;
}

const VagaApplicationCard: React.FC<VagaApplicationCardProps> = ({ 
  config, 
  showForm, 
  onShowForm 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 sticky top-24">
      <div className="text-center mb-6">
        <div 
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: `${config.primary_color}15` }}
        >
          <User 
            className="h-8 w-8"
            style={{ color: config.primary_color }}
          />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Interessado nesta vaga?
        </h3>
        <p className="text-gray-600 text-sm">
          Envie sua candidatura e faça parte do nosso time!
        </p>
      </div>

      {!showForm && (
        <button
          onClick={onShowForm}
          className="w-full py-4 px-6 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-lg"
          style={{ backgroundColor: config.primary_color }}
        >
          Candidatar-se Agora
        </button>
      )}
    </div>
  )
};

export default VagaApplicationCard;
