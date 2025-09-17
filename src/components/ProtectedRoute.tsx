import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BrandedLoadingScreen } from './loading';
import { NoCompanySelected } from './NoCompanySelected';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading, currentCompany, companies } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <BrandedLoadingScreen
        companyIdentifier={currentCompany?.slug || currentCompany?.domain || currentCompany?.id}
        isVisible={true}
        message="Carregando sistema..."
      />
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se é super admin e não tem empresa selecionada, mas está tentando acessar rotas de loja, redirecionar para dashboard
  if (user.role === 'super_admin' && !currentCompany) {
    const isLojaRoute = location.pathname.startsWith('/pedidos') || 
                       location.pathname.startsWith('/pdv') || 
                       location.pathname.startsWith('/caixa') ||
                       location.pathname.startsWith('/clientes') ||
                       location.pathname.startsWith('/gestor-cardapio') ||
                       location.pathname.startsWith('/settings') ||
                       location.pathname.startsWith('/opcoes-loja') ||
                       location.pathname.startsWith('/estoque') ||
                       location.pathname.startsWith('/meu-rh');
    
    if (isLojaRoute) {
      return <Navigate to="/super-admin/dashboard" replace />;
    }
  }

  // Se não é super admin e não tem empresa selecionada, mostrar mensagem
  if (user.role !== 'super_admin' && !currentCompany && companies.length === 0) {
    return <NoCompanySelected />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
