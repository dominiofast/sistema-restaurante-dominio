import React from 'react';
import { Plus, FileText, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface TipoFiscalEmptyStateProps {
  onCreate: () => void;
}

export function TipoFiscalEmptyState({ onCreate }: TipoFiscalEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="text-center py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-muted/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold mb-3">
            Nenhum tipo fiscal configurado
          </h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Configure tipos fiscais para organizar e gerenciar os dados tributários 
            dos seus produtos de forma eficiente
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Dica</h4>
                <p className="text-sm text-blue-700">
                  Crie tipos como "Comida", "Bebida", "Produto" para categorizar 
                  diferentes grupos de produtos com configurações fiscais similares.
                </p>
              </div>
            </div>
          </div>
          
          <Button onClick={onCreate} size="lg" className="h-11 px-6">
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeiro Tipo Fiscal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}