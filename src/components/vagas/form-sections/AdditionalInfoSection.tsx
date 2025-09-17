
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { ModernTextArea } from './ModernFormComponents';

interface AdditionalInfoSectionProps {
  formData: {
    carta_apresentacao: string;
    experiencia_relevante: string;
  };
  onFormDataChange: (data: any) => void;
  primaryColor: string;
  errors?: any;
}

const AdditionalInfoSection: React.FC<AdditionalInfoSectionProps> = ({
  formData,
  onFormDataChange,
  primaryColor,
  errors = {}
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
      <div className="flex items-center mb-6">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <MessageSquare size={16} style={{ color: primaryColor }} />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Informações Adicionais</h2>
      </div>
      
      <div className="space-y-5">
        <ModernTextArea
          label="Experiência Relevante"
          value={formData.experiencia_relevante || ''}
          onChange={(e) => onFormDataChange({ experiencia_relevante: e.target.value })}
          placeholder="Conte-nos sobre sua experiência relevante para esta vaga..."
          rows={4}
          error={errors.experiencia_relevante}
          primaryColor={primaryColor}
        />
        
        <ModernTextArea
          label="Carta de Apresentação"
          value={formData.carta_apresentacao || ''}
          onChange={(e) => onFormDataChange({ carta_apresentacao: e.target.value })}
          placeholder="Escreva uma breve carta de apresentação..."
          rows={5}
          error={errors.carta_apresentacao}
          primaryColor={primaryColor}
        />
      </div>
    </div>
  );
};

export default AdditionalInfoSection;
