import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { StoreProvider } from "./contexts/StoreContext";
import { QZTrayProvider } from "./contexts/QZTrayContext";
import { GlobalWhatsAppNotificationProvider } from "./contexts/GlobalWhatsAppNotificationContext";
import AppRouter from "./router/AppRouter";
import DynamicMetaTags from "./components/DynamicMetaTags";
import { GlobalLoading } from "./components/ui/loading-spinner";
import { useAutoPrint } from "./hooks/useAutoPrint";

// Componente que gerencia contextos para páginas autenticadas
const AppContent = () => {
  return <AuthenticatedApp />;
};

// Componente separado para app autenticado
const AuthenticatedApp = () => {
  const { isLoading, user } = useAuth();
  
  // Ativar impressão automática para usuários autenticados
  useAutoPrint();

  if (isLoading) {
    let message = "Carregando suas informações...";
    let submessage = "Aguarde enquanto preparamos tudo para você";

    if (user?.role === 'super_admin') {
      message = "Carregando painel administrativo...";
      submessage = "Preparando dados de todas as empresas";
    } else if (user?.role === 'admin') {
      message = "Carregando painel da empresa...";
      submessage = "Sincronizando dados da sua empresa";
    } else if (user?.role === 'user') {
      message = "Carregando sistema da loja...";
      submessage = "Preparando ferramentas de vendas";
    }

    return <GlobalLoading message={message} submessage={submessage} />;
  }

  return (
    <PermissionsProvider>
      <StoreProvider>
        <QZTrayProvider>
          <GlobalWhatsAppNotificationProvider>
            <DynamicMetaTags>
              <AppRouter />
            </DynamicMetaTags>
          </GlobalWhatsAppNotificationProvider>
        </QZTrayProvider>
      </StoreProvider>
    </PermissionsProvider>
  );
};

function App() {
  const hostname = window.location.hostname;
  const path = window.location.pathname;
  
  console.log('🏠 App.tsx - hostname:', hostname, 'path:', path);
  
  // Landing page ISOLADA - sem AuthProvider para carregamento instantâneo
  const isLandingPage = (
    (hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) && 
    (path === '/' || path === '/cadastro' || path === '/login' || path === '/reset-password')
  ) || (
    (hostname === 'dominio.tech' || hostname === 'www.dominio.tech') && 
    (path === '/' || path === '/cadastro' || path === '/login' || path === '/reset-password')
  ) || (
    (hostname === 'localhost' || hostname.includes('127.0.0.1')) && 
    (path === '/' || path === '/cadastro' || path === '/login' || path === '/reset-password')
  );

  console.log('🎯 App.tsx - isLandingPage:', isLandingPage);

  // Se for uma página isolada (landing, cadastro, login, reset), não usar AuthProvider
  if (isLandingPage) {
    console.log('✅ App.tsx - Carregando página sem AuthProvider');
    return (
      <QZTrayProvider>
        <DynamicMetaTags>
          <AppRouter />
        </DynamicMetaTags>
      </QZTrayProvider>
    );
  }

  // Para todas as outras páginas, usar AuthProvider
  console.log('🔐 App.tsx - Carregando com AuthProvider');
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
