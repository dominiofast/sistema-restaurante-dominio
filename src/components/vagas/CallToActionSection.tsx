
import React from 'react';
import { User } from 'lucide-react';

interface CallToActionSectionProps {
  primaryColor: string;
}

const CallToActionSection: React.FC<CallToActionSectionProps> = ({ primaryColor }) => {
  return (
    <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200 mb-6">
      <h3 className="text-2xl font-bold text-gray-900 mb-4">Não encontrou a vaga ideal?</h3>
      <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
        Cadastre seu currículo em nosso banco de talentos e seja o primeiro a saber sobre novas oportunidades que combinam com seu perfil.
      </p>
      <button 
        className="inline-flex items-center px-8 py-4 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        style={{ backgroundColor: primaryColor }}
      >
        <User className="h-5 w-5 mr-2" />
        Cadastrar Currículo
      </button>
    </div>
  )
};

export default CallToActionSection;
