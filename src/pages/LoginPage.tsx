import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';
import { Navigate } from 'react-router-dom';

const LoginPageContent = () => {
  const { user, isLoading } = useAuth();

  // Loading simples sem animações
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-600">Carregando...</div>
        </div>
      </div>
    );
  }

  if (user) {
    // Redireciona baseado no role
    if (user.role === 'super_admin') {
      return <Navigate to="/empresas" replace />;
    } else {
      // Logistas vão direto para pedidos
      return <Navigate to="/pedidos" replace />;
    }
  }

  return <LoginForm />;
};

const LoginPage = () => {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
};

export default LoginPage;
