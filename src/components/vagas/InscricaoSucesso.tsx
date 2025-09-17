import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface InscricaoSucessoProps {
  nomeVaga: string;
  nomeEmpresa: string;
  corPrimaria?: string;
}

const InscricaoSucesso: React.FC<InscricaoSucessoProps> = ({ 
  nomeVaga, 
  nomeEmpresa,
  corPrimaria = '#1B365D'
}) => {
  return (
    <div className="flex items-center justify-center p-4 md:p-8 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-lg shadow-lg animate-fade-in-up">
        <CardContent className="p-8 text-center">
          <CheckCircle 
            className="mx-auto h-16 w-16 mb-6 animate-pulse"
            style={{ color: corPrimaria }}
          />
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Inscrição Recebida!</h2>
          <p className="text-gray-600 mb-2">
            Obrigado por se candidatar à vaga de <strong style={{ color: corPrimaria }}>{nomeVaga}</strong> na empresa <strong>{nomeEmpresa}</strong>.
          </p>
          <p className="text-gray-600 mb-8">
            Analisaremos seu perfil e entraremos em contato em breve. Boa sorte!
          </p>
          <Button 
            onClick={() => window.history.back()} 
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para a vaga
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InscricaoSucesso;
