
import React from 'react';
import { User } from 'lucide-react';
import { ModernInput } from './ModernFormComponents';

interface PersonalInfoSectionProps {
  formData: {
    nome_completo: string;
    email: string;
    telefone: string;
  };
  onFormDataChange: (data: any) => void;
  primaryColor: string;
  errors?: any;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
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
          <User size={16} style={{ color: primaryColor }} />
        </div>
        <h2 className="text-lg font-semibold text-gray-700">Informações Pessoais</h2>
      </div>
      
      <div className="space-y-5">
        <ModernInput
          label="Nome Completo"
          value={formData.nome_completo || ''}
          onChange={(e) => onFormDataChange({ nome_completo: e.target.value })}
          placeholder="Digite seu nome completo"
          required
          error={errors.nome_completo}
          primaryColor={primaryColor}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ModernInput
            label="E-mail"
            type="email"
            value={formData.email || ''}
            onChange={(e) => onFormDataChange({ email: e.target.value })}
            placeholder="seu@email.com"
            required
            error={errors.email}
            primaryColor={primaryColor}
          />
          
          <ModernInput
            label="Telefone/WhatsApp"
            type="tel"
            value={formData.telefone || ''}
            onChange={(e) => onFormDataChange({ telefone: e.target.value })}
            placeholder="(11) 99999-9999"
            required
            error={errors.telefone}
            primaryColor={primaryColor}
          />
        </div>
      </div>
    </div>
  )
};

export default PersonalInfoSection;
