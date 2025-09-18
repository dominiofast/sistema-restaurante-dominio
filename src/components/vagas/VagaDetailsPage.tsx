
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle, Award } from 'lucide-react';
import VagaHeroSection from '@/components/vagas/VagaHeroSection';
import VagasHeader from '@/components/vagas/VagasHeader';
import VagaInfoCard from '@/components/vagas/VagaInfoCard';
import VagaApplicationSection from '@/components/vagas/VagaApplicationSection';

interface VagaDetailsPageProps {
  vaga: any;
  config: any;
  slug: string;
  showForm: boolean;
  onShowForm: () => void;
  onCloseForm: () => void;
  onInscricaoEnviada: () => void;
  getTypeLabel: (type: string) => string;
}

const VagaDetailsPage: React.FC<VagaDetailsPageProps> = ({
  vaga,
  config,
  slug,
  showForm,
  onShowForm,
  onCloseForm,
  onInscricaoEnviada,
  getTypeLabel
}) => {
  const primaryColor = config.primary_color || '#1B365D';
  const dynamicStyles = {
    '--primary-color': primaryColor,
    '--primary-color-hover': `${primaryColor}E6`,;
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="min-h-screen bg-gray-50">
      <VagasHeader 
        logoUrl={config.logo_url} 
        companyName={config.company_name} 
        primaryColor={primaryColor}
        titleColor={config.title_color}
      />

      <VagaHeroSection 
        vaga={vaga}
        config={config}
        slug={slug}
      />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg border-0 overflow-hidden bg-white">
              <CardContent className="p-6">
                {/* Descrição */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <FileText className="h-3 w-3" style={{ color: primaryColor }} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Descrição da Vaga</h2>
                  </div>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                      {vaga.description}
                    </p>
                  </div>
                </div>

                {/* Requisitos */}
                {vaga.requirements && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <CheckCircle className="h-3 w-3" style={{ color: primaryColor }} />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Requisitos</h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                        {vaga.requirements}
                      </p>
                    </div>
                  </div>
                )}

                {/* Benefícios */}
                {vaga.benefits && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${primaryColor}20` }}
                      >
                        <Award className="h-3 w-3" style={{ color: primaryColor }} />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900">Benefícios</h2>
                    </div>
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                        {vaga.benefits}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <VagaInfoCard 
              vaga={vaga} 
              primaryColor={primaryColor} 
              getTypeLabel={getTypeLabel} 
            />

            <VagaApplicationSection 
              showForm={showForm}
              vaga={vaga}
              primaryColor={primaryColor}
              onShowForm={onShowForm}
              onCloseForm={onCloseForm}
              onInscricaoEnviada={onInscricaoEnviada}
            />
          </div>
        </div>
      </div>
    </div>
  )
};

export default VagaDetailsPage;
