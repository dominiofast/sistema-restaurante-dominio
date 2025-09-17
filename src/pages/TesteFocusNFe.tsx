import React from 'react';
import { TesteFocusNFe } from '@/components/fiscal/TesteFocusNFe';

export default function TesteFocusNFePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Teste Focus NFe</h1>
        <p className="text-muted-foreground">
          Página para testar a integração com a Focus NFe
        </p>
      </div>
      
      <TesteFocusNFe />
    </div>
  );
}