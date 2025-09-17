
import React from 'react';
import AccountRoutes from './AccountRoutes'; 
import PublicRoutes from './PublicRoutes';
import MainRoutes from './MainRoutes';
import VagasRoutes from './VagasRoutes';

const AppRouter: React.FC = () => {
  const hostname = window.location.hostname;
  const path = window.location.pathname;
  
  console.log('🔄 AppRouter - hostname:', hostname);
  console.log('🔄 AppRouter - path:', path);

  // Em ambiente de desenvolvimento, carregamos o painel de controle
  if (hostname === 'localhost' || hostname.includes('127.0.0.1')) {
    // Páginas da landing page
    if (path === '/demonstracao' || path === '/cadastro') {
      return <MainRoutes />;
    }
    // Verificar se é uma rota de autoatendimento
    if (path.startsWith('/autoatendimento/')) {
      console.log('🎯 Direcionando autoatendimento para PublicRoutes');
      return <PublicRoutes />;
    }
    // Verificar se é uma rota do sistema administrativo primeiro
    if (path.startsWith('/pedidos') || path.startsWith('/pdv') || path.startsWith('/caixa') || 
        path.startsWith('/settings') || path.startsWith('/clientes') || path.startsWith('/login') ||
        path.startsWith('/empresas') || path.startsWith('/admin') || path.startsWith('/super-admin') ||
        path.startsWith('/gestor-cardapio') || path.startsWith('/opcoes-loja') || path.startsWith('/estoque') ||
        path.startsWith('/whatsapp') || path.startsWith('/chat') || path.startsWith('/kds') ||
        path.startsWith('/cashback') || path.startsWith('/agente-ia') || path.startsWith('/config') ||
        path.startsWith('/teste-') || path.startsWith('/ferramentas') || path.startsWith('/tools') ||
        path.startsWith('/demo-navigation') || path.startsWith('/reset-password') || path.startsWith('/auth/') || path === '/auth' || path === '/sync-test') {
      console.log('🎯 Direcionando para AccountRoutes');
      return <AccountRoutes />;
    }
    // CARDÁPIO PÚBLICO: Slugs de empresa, cardápio, pedidos, etc
    if (path.includes('/cardapio/') || /^\/\d+$/.test(path) || /^\/[a-zA-Z0-9-]+/.test(path) || path.includes('/acompanhar-pedido/') || path.includes('/pedido/') || path === '/dominiopizzas') {
      console.log('🎯 Direcionando para PublicRoutes - DOMINIOPIZZAS');
      return <PublicRoutes />;
    }
    console.log('🎯 Direcionando para AccountRoutes como fallback');
    return <AccountRoutes />;
  }

  // Para domínios de preview do Lovable (*.lovableproject.com e *.lovable.app)
  if (hostname.includes('lovableproject.com') || hostname.includes('lovable.app')) {
    // Para rotas específicas do painel administrativo
    if (path === '/demonstracao' || path === '/cadastro' || path === '/login' || path === '/reset-password' ||
        path.startsWith('/pedidos') || path.startsWith('/pdv') || path.startsWith('/caixa') || 
        path.startsWith('/settings') || path.startsWith('/clientes') || path.startsWith('/admin') ||
        path.startsWith('/empresas') || path.startsWith('/super-admin') || path.startsWith('/gestor-cardapio') ||
        path.startsWith('/opcoes-loja') || path.startsWith('/estoque') || path.startsWith('/whatsapp') ||
        path.startsWith('/chat') || path.startsWith('/kds') || path.startsWith('/cashback') ||
        path.startsWith('/agente-ia') || path.startsWith('/config') || path.startsWith('/ferramentas') ||
        path.startsWith('/tools') || path.startsWith('/demo-navigation') || path.startsWith('/auth/') ||
        path === '/auth' || path.startsWith('/sync-test')) {
      return <AccountRoutes />;
    }
    // Para outras rotas (incluindo / e slugs de empresa), usar o cardápio público
    return <PublicRoutes />;
  }

  // Roteamento para o subdomínio de contas
  if (hostname === 'conta.dominio.tech') {
    // Verificar se é uma rota de autoatendimento
    if (path.startsWith('/autoatendimento/')) {
      console.log('🎯 Direcionando autoatendimento para PublicRoutes');
      return <PublicRoutes />;
    }
    return <AccountRoutes />;
  }

  // Roteamento para o subdomínio de pedidos
  if (hostname === 'pedido.dominio.tech') {
    return <PublicRoutes />;
  }

  // Roteamento para o subdomínio de vagas
  if (hostname === 'vagas.dominio.tech') {
    return <VagasRoutes />;
  }

  // Roteamento para o subdomínio de programas
  if (hostname === 'programas.dominio.tech') {
    return <AccountRoutes />;
  }

  // Fallback para o domínio principal (com ou sem www)
  if (hostname === 'dominio.tech' || hostname === 'www.dominio.tech') {
    // Se for a página inicial, mostra a landing page
    if (path === '/' || path === '/demonstracao' || path === '/cadastro' || path === '/login' || path === '/reset-password') {
      return <MainRoutes />;
    }
    // Para outras rotas (como /pedidos), direciona para o painel administrativo
    return <AccountRoutes />;
  }

  // Fallback padrão para qualquer outro domínio não configurado
  return <AccountRoutes />;
};

export default AppRouter;
