
import React from 'react';
import AccountRoutes from './AccountRoutes'; 
import PublicRoutes from './PublicRoutes';
import MainRoutes from './MainRoutes';
import VagasRoutes from './VagasRoutes';
import { useAuth } from '../contexts/AuthContext';

const AppRouter: React.FC = () => {
  const hostname = window.location.hostname;
  const path = window.location.pathname;
  
  // Verificar se há usuário autenticado (apenas em contextos que têm AuthProvider)
  let user = null;
  try {
    const auth = useAuth()
    user = auth?.user;
  } catch {
    // Ignorar erro se não houver AuthProvider (páginas de landing)
    user = null;
  }
  
  console.log('🔄 AppRouter - hostname:', hostname)
  console.log('🔄 AppRouter - path:', path)
  console.log('🔐 AppRouter - usuário logado:', !!user, user?.email || 'não logado')

  // Em ambiente de desenvolvimento e Replit preview
  if (hostname === 'localhost' || hostname.includes('127.0.0.1') || hostname.includes('replit.dev')) {
    // 🚀 FORÇAR DOMINIOPIZZAS PARA PUBLICROUTES
    console.log('🔍 FORÇANDO TESTE - dominiopizzas detectado!', path)
    if (path === '/dominiopizzas') {
      console.log('🎯 FORÇANDO PUBLICROUTES PARA DOMINIOPIZZAS')
      return <PublicRoutes />;
    }
    
    // Páginas da landing page
    if (path === '/demonstracao' || path === '/cadastro') {
      return <MainRoutes />;
    }
    // Verificar se é uma rota de autoatendimento
    if (path.startsWith('/autoatendimento/')) {
      console.log('🎯 Direcionando autoatendimento para PublicRoutes')
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
      console.log('🎯 Direcionando para AccountRoutes')
      return <AccountRoutes />;
    }
    // CARDÁPIO PÚBLICO - RESTO
    if (path.includes('/cardapio/') || /^\/\d+$/.test(path) || 
        /^\/[a-zA-Z0-9-]+/.test(path) || 
        path.includes('/acompanhar-pedido/') || path.includes('/pedido/')) {
      console.log('🎯 DIRECIONANDO PARA PUBLICROUTES - OUTROS')
      return <PublicRoutes />;
    }
    // Verificar se há usuário logado antes do fallback
    if (user) {
      console.log('🎯 Usuário logado detectado, direcionando para AccountRoutes')
      return <AccountRoutes />;
    } else {
      console.log('🎯 Usuário NÃO logado, direcionando para MainRoutes (landing)')
      return <MainRoutes />;
    }
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
      console.log('🎯 Direcionando autoatendimento para PublicRoutes')
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
