import React from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const NoCompanySelected: React.FC = () => {
  const { user, companies, reloadCompanies } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhuma Empresa Selecionada
          </h2>
          <p className="text-gray-600">
            {user?.role === 'super_admin' 
              ? 'Como Super Admin, selecione uma empresa no menu superior para continuar.'
              : 'Não foi possível carregar as informações da empresa.'}
          </p>
        </div>

        {companies.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao carregar empresas</AlertTitle>
            <AlertDescription>
              Houve um problema ao carregar as empresas. Isso pode ser devido a permissões de acesso.
              Por favor, tente recarregar ou entre em contato com o suporte.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-center gap-4">
          <Button onClick={() => window.location.reload()} variant="outline">
            Recarregar Página
          </Button>
          <Button onClick={reloadCompanies}>
            Tentar Novamente
          </Button>
          <Button onClick={() => {
            // Forçar refresh da sessão
            window.location.href = '/login?refresh=true';
          }} variant="default">
            Refazer Login
          </Button>
        </div>
      </div>
    </div>
  );
}; 