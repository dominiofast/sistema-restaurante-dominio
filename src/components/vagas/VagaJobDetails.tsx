
import React from 'react';
import { Vaga, PageConfig } from '../../types/vagas';

interface VagaJobDetailsProps {
  vaga: Vaga;
  config: PageConfig;
}

const VagaJobDetails: React.FC<VagaJobDetailsProps> = ({ vaga, config }) => {
  return (
    <div className="lg:col-span-2 space-y-8">
      {/* Descrição da Vaga */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center mb-6">
          <div 
            className="w-1 h-8 rounded-full mr-4"
            style={{ backgroundColor: config.primary_color }}
          ></div>
          <h2 className="text-2xl font-bold text-gray-900">Sobre a Vaga</h2>
        </div>
        <div 
          className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: vaga.description || '' }}
        />
      </div>

      {/* Requisitos */}
      {vaga.requirements && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div 
              className="w-1 h-8 rounded-full mr-4"
              style={{ backgroundColor: config.primary_color }}
            ></div>
            <h2 className="text-2xl font-bold text-gray-900">Requisitos</h2>
          </div>
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: vaga.requirements }}
          />
        </div>
      )}

      {/* Benefícios */}
      {vaga.benefits && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center mb-6">
            <div 
              className="w-1 h-8 rounded-full mr-4"
              style={{ backgroundColor: config.primary_color }}
            ></div>
            <h2 className="text-2xl font-bold text-gray-900">Benefícios</h2>
          </div>
          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: vaga.benefits }}
          />
        </div>
      )}
    </div>
  );
};

export default VagaJobDetails;
