import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Send, X } from 'lucide-react';
import FormularioInscricao from './FormularioInscricao';

interface VagaApplicationSectionProps {
  showForm: boolean;
  vaga: any;
  primaryColor: string;
  onShowForm: () => void;
  onCloseForm: () => void;
  onInscricaoEnviada: () => void;
}

const VagaApplicationSection: React.FC<VagaApplicationSectionProps> = ({
  showForm,
  vaga,
  primaryColor,
  onShowForm,
  onCloseForm,
  onInscricaoEnviada
}) => {
  return (
    <>
      <Card className="shadow-lg border-0 bg-white sticky top-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Candidatar-se
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button
              onClick={onShowForm}
              className="w-full text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor
              }}
            >
              <Send className="h-5 w-5 mr-2" />
              Enviar Candidatura
            </Button>
          </div>
          <p className="text-xs text-gray-500 text-center">
            Preencha o formulário para se candidatar a esta vaga
          </p>
        </CardContent>
      </Card>

      <Dialog open={showForm} onOpenChange={onCloseForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 bg-white border-gray-200">
          <DialogHeader className="p-6 pb-0 bg-white">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Formulário de Candidatura
              </DialogTitle>

            </div>
            <DialogDescription className="sr-only">
              Formulário para envio de candidatura para a vaga {vaga.title}
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6 bg-white">
            <FormularioInscricao
              vagaId={vaga.id}
              companyId={vaga.company_id}
              vagaTitulo={vaga.title}
              primaryColor={primaryColor}
              onSuccess={onInscricaoEnviada}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
};

export default VagaApplicationSection;
