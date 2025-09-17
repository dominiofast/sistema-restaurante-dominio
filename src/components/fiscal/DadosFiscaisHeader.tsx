import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DadosFiscaisHeaderProps {
  onCreateNew: () => void;
}

export function DadosFiscaisHeader({ onCreateNew }: DadosFiscaisHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dados Fiscais</h1>
        <p className="text-muted-foreground text-lg">
          Gerencie os tipos fiscais e configure os dados tributários para sua empresa
        </p>
      </div>
      
      <Button 
        onClick={onCreateNew}
        className="h-11 px-6"
        size="lg"
      >
        <Plus className="w-4 h-4 mr-2" />
        Novo Tipo Fiscal
      </Button>
    </div>
  );
}