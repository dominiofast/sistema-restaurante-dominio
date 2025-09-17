
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, Clock, DollarSign } from 'lucide-react';

interface VagaListPublicaProps {
  vagas: any[];
  config: any;
  slug: string;
}

const VagaListPublica: React.FC<VagaListPublicaProps> = ({ vagas, config, slug }) => {
  const primaryColor = config.primary_color || '#1B365D';
  const dynamicStyles = {
    '--primary-color': primaryColor,
    '--primary-color-hover': `${primaryColor}E6`,
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="min-h-screen bg-gray-50">
      {/* Banner */}
      <header className="h-44 bg-cover bg-center relative shadow-lg" style={{ backgroundImage: `url(${config?.banner_url || '/placeholder-banner.jpg'})` }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(0deg, ${primaryColor}CC 0%, ${primaryColor}99 100%)` }} />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="text-center">
            {config.logo_url && (
              <img src={config.logo_url} alt={config.company_name + ' Logo'} className="w-24 h-24 mx-auto mb-4 rounded-full bg-white p-2 shadow-md" />
            )}
            <h1 className="text-3xl md:text-5xl font-bold mb-2 drop-shadow-lg text-white">{config.page_title}</h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto drop-shadow">{config.welcome_message}</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </header>

      {/* Lista de vagas */}
      <section className="max-w-7xl w-full mx-auto px-0 mt-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">Vagas Abertas</h2>
        {vagas.length === 0 ? (
          <div className="text-center text-gray-600">Nenhuma vaga disponível no momento.</div>
        ) : (
          <div className="space-y-6">
            {vagas.map((vaga: any) => (
              <Card key={vaga.id} className="w-full hover:shadow-xl transition-all duration-200 bg-white border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{vaga.title}</h3>
                        <Badge className={vaga.is_active ? 'bg-green-600' : 'bg-gray-400'}>
                          {vaga.is_active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-700 mb-2">
                        <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{vaga.location}</span>
                        <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" />{vaga.type}</span>
                        {vaga.salary_range && <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{vaga.salary_range}</span>}
                        <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(vaga.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-gray-700 line-clamp-2 mb-2">{vaga.description}</p>
                    </div>
                    <div className="flex gap-2 md:ml-8">
                      <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50" asChild>
                        <a href={`/${slug}/${vaga.id}`} target="_blank" rel="noopener noreferrer">Ver Detalhes</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VagaListPublica;
