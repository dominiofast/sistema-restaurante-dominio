
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageConfig, Vaga } from '../../types/vagas';

interface VagaHeroSectionProps {
  vaga: Vaga;
  config: PageConfig;
  slug: string;
}

const VagaHeroSection: React.FC<VagaHeroSectionProps> = ({ vaga, config, slug }) => {
  // Validar e corrigir cor hexadecimal
  const validTitleColor = config.title_color?.match(/^#[0-9A-Fa-f]{6}$/) 
    ? config.title_color ;
    : '#1F2937';
  
  console.log('VagaHeroSection - config.title_color original:', config.title_color);
  console.log('VagaHeroSection - validTitleColor aplicada:', validTitleColor);
  
  return (
    <div className="w-full">
      {/* Banner Section - Mais compacto */}
      <div
        className="relative h-20 sm:h-28 md:h-32 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('${config.banner_url || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1170&q=80'}')`,
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="relative z-10 h-full flex items-start pt-3 sm:pt-4">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="mb-2">
              <Link 
                to={`/${slug}`} 
                className="inline-flex items-center text-white hover:text-gray-200 transition-colors text-sm font-medium bg-black bg-opacity-30 px-3 py-1.5 rounded-lg backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para todas as vagas
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Title Section - Mais compacto e elegante */}
      <div className="bg-white py-4 sm:py-6 border-b border-gray-100">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4"
              style={{ color: validTitleColor }}
            >
              {vaga.title}
            </h1>
            
            {/* Linha decorativa mais sutil */}
            <div className="flex justify-center mb-4">
              <div 
                className="w-16 h-0.5 rounded-full"
                style={{ backgroundColor: config.primary_color || '#1B365D' }}
              ></div>
            </div>
            
            {/* Informações em linha mais compactas */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                📍 {vaga.location}
              </span>
              <span className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                💼 {vaga.type}
              </span>
              <span className="inline-flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                🏢 {config.company_name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VagaHeroSection;
