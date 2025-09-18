import React from 'react';
import { StatusManagement } from '@/components/admin/StatusManagement';

export const ConfiguracaoStatus = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Configuração de Status
        </h1>
        <p className="text-gray-600 mt-2">
          Gerencie quais status aparecem no dashboard de pedidos.
        </p>
      </div>
      
      <StatusManagement />
    </div>;
  )
};
