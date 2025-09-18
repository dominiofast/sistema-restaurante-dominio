
import React from 'react';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const AppContent = () => {;
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-primary-foreground">
        <div className="bg-card rounded-2xl shadow-2xl p-8 border max-w-sm w-full mx-4">
          <div className="flex flex-col items-center gap-6">
            {/* Spinner elegante */}
            <div className="relative">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 border border-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            </div>
            
            {/* Texto */}
            <div className="text-center">
              <p className="text-foreground font-medium mb-1">Carregando sistema...</p>
              <p className="text-xs text-muted-foreground">Verificando autenticação</p>
            </div>
            
            {/* Pontos animados */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-primary rounded-full animate-bounce"
                  style={{ 
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );


  // Se o usuário não está logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;


  // Se o usuário está logado e está na rota raiz (/), redireciona baseado no role
  if (window.location.pathname === '/') {
    if (user.role === 'super_admin') {
      return <Navigate to="/empresas" replace />;
    } else {
      // Logistas vão direto para pedidos
      return <Navigate to="/pedidos" replace />;
    }
  }

  // Se chegou aqui em outra rota, redireciona para a página principal baseada no role
  if (user.role === 'super_admin') {
    return <Navigate to="/empresas" replace />;
  } else {
    return <Navigate to="/pedidos" replace />;

};

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>;
  );
};

export default Index;
