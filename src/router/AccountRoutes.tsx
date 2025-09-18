
import React, { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ProtectedRouteWithPermissions } from "@/components/auth/ProtectedRouteWithPermissions";
import AppLayout from "@/layouts/AppLayout";

// Import direto para melhorar LCP
import { CompaniesPage } from "@/pages/CompaniesPage";
import PedidosPage from "@/pages/PedidosPage";
import PedidosDashboard from "@/pages/PedidosDashboard";
import ClientePedidoPage from "@/pages/ClientePedidoPage";
import PDVPage from "@/pages/PDVPage";
import Caixa from "@/pages/Caixa";
import KDS from "@/pages/KDS";
import WhatsappChat from "@/pages/WhatsappChat";

import WhatsappConnect from "@/pages/WhatsappConnect";
import WhatsappIntegrationsAdmin from "@/pages/WhatsappIntegrationsAdmin";

import Clientes from "@/pages/Clientes";
import GestorCardapio from "@/pages/GestorCardapio";
import EstabelecimentoConfig from "@/pages/EstabelecimentoConfig";
import CardapioDigitalConfig from "@/pages/CardapioDigitalConfig";
// Páginas que são lazy loaded
const LoginPage = lazy(() => import("@/pages/LoginPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword").then(m => ({ default: m.ResetPassword })));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
// Removed thermal printing config
const FacebookPixelConfig = lazy(() => import("@/pages/FacebookPixelConfig").then(m => ({ default: m.FacebookPixelConfig })));
const SuperAdminIFoodImportConfig = lazy(() => import("@/pages/SuperAdminIFoodImportConfig"));
const SuperAdminIFoodGlobalConfig = lazy(() => import("@/pages/SuperAdminIFoodGlobalConfig"));
const SuperAdminIFoodIntegrations = lazy(() => import("@/pages/SuperAdminIFoodIntegrations"));
const IFoodIntegrationsLojista = lazy(() => import("@/pages/IFoodIntegrationsLojista"));
// Páginas públicas não devem ser importadas aqui para evitar duplicação
const Unauthorized = lazy(() => import("@/pages/Unauthorized"));
const NotasEntradaPage = lazy(() => import("@/pages/NotasEntrada"));
const PaginaVagasConfig = lazy(() => import("@/pages/PaginaVagasConfig"));
const VagasDisponiveis = lazy(() => import("@/pages/VagasDisponiveis"));
const InscricoesVagas = lazy(() => import("@/pages/InscricoesVagas"));
const MercadoriasIngredientes = lazy(() => import("@/pages/MercadoriasIngredientes"));
const ReceitasFichasTecnicas = lazy(() => import("@/pages/ReceitasFichasTecnicas"));
const CompanyAdminManager = lazy(() => import("@/components/admin/CompanyAdminManager").then(m => ({ default: m.CompanyAdminManager })));
const CompanyUsersManager = lazy(() => import("@/pages/CompanyUsersManager"));
const SuperAdminDashboard = lazy(() => import("@/pages/SuperAdminDashboard"));
const ConfiguracaoFiscalCompleta = lazy(() => import("@/components/fiscal/ConfiguracaoFiscalCompleta").then(m => ({ default: m.ConfiguracaoFiscalCompleta })));
const DadosFiscais = lazy(() => import("@/pages/DadosFiscais"));
const DadosFiscaisConfig = lazy(() => import("@/pages/DadosFiscaisConfig"));
const TesteFocusNFePage = lazy(() => import("@/pages/TesteFocusNFe"));
const AcceptInvitation = lazy(() => import("@/pages/AcceptInvitation"));
const TestIntegration = lazy(() => import("@/pages/TestIntegration"));
const AdminAgents = lazy(() => import("@/pages/AdminAgents"));
const PromptsManagement = lazy(() => import("@/pages/PromptsManagement"));
const WhatsAppAIIntegration = lazy(() => import("@/pages/WhatsAppAIIntegration"));
const ImportCardapioSupabase = lazy(() => import("@/pages/ImportCardapioSupabase"));
const CampanhaWhatsApp = lazy(() => import("@/pages/marketing/CampanhaWhatsApp"));
const CampanhasSalvas = lazy(() => import("@/pages/marketing/CampanhasSalvas"));

const ImpressaoQZTrayConfig = lazy(() => import("@/pages/ImpressaoQZTrayConfig"));
const HorariosFuncionamentoSimples = lazy(() => import("@/pages/HorariosFuncionamentoSimples"));
const PrintNodeIntegrationPage = lazy(() => import("@/pages/PrintNodeIntegrationPage"));
const TesteAgentePedidos = lazy(() => import("@/pages/TesteAgentePedidos"));

const FerramentasIndex = lazy(() => import('@/pages/FerramentasIndex'));
const Cashback = lazy(() => import('@/pages/Cashback'));

const DemoNavigationPage = lazy(() => import('@/pages/DemoNavigationPage'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const ProgramasPage = lazy(() => import('@/pages/ProgramasPage'));
const ConfiguracaoStatus = lazy(() => import('@/pages/ConfiguracaoStatus').then(m => ({ default: m.ConfiguracaoStatus })));
const IntegracoesConfig = lazy(() => import('@/pages/IntegracoesConfig'));
const IntegracaoFacebook = lazy(() => import("@/pages/IntegracaoFacebook"));
// LinksDemo removido - está em PublicRoutes
const TestCustomerAddresses = lazy(() => import("@/pages/TestCustomerAddresses"));


const ProtectedAppLayout = () => (
  <ProtectedRoute>
    <AppLayout />
  </ProtectedRoute>;
);

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>;
);

const AccountRoutes = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/accept-invitation" element={<AcceptInvitation />} />
      
      {/* Central de Ferramentas */}
      <Route path="/ferramentas" element={<FerramentasIndex />} />
      <Route path="/tools" element={<FerramentasIndex />} />
      
      {/* Links Demo */}
      
      {/* Demo Navigation */}
      <Route path="/demo-navigation" element={<DemoNavigationPage />} />
      
      
      {/* Rotas Principais com Novo Layout (Sidebar) */}
      <Route element={<ProtectedAppLayout />}>
        <Route path="/pdv" element={<PDVPage />} />
        <Route path="/pedidos" element={<PedidosDashboard />} />
        <Route path="/pedidos/cliente/:clienteId" element={<ClientePedidoPage />} />
        <Route path="/caixa" element={<Caixa />} />
        <Route path="/kds" element={<KDS />} />
        <Route path="/chat" element={<WhatsappChat />} />
        <Route path="/whatsapp" element={<WhatsappChat />} />

        
        
        <Route path="/whatsapp-connect" element={<WhatsappConnect />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/test-customer-addresses" element={<TestCustomerAddresses />} />
        <Route path="/cashback" element={<Cashback />} />
        <Route path="/cardapio" element={<GestorCardapio />} />
        <Route path="/gestor-cardapio" element={<GestorCardapio />} />
        <Route path="/estoque/notas-entrada" element={<NotasEntradaPage />} />
        <Route path="/meu-rh/pagina-vagas" element={<PaginaVagasConfig />} />
        <Route path="/meu-rh/vagas-disponiveis" element={<VagasDisponiveis />} />
        <Route path="/meu-rh/inscricoes-vagas" element={<InscricoesVagas />} />
        
        {/* Rotas de Ficha Técnica */}
        <Route path="/ficha-tecnica/mercadorias-ingredientes" element={<MercadoriasIngredientes />} />
        <Route path="/ficha-tecnica/receitas-fichas-tecnicas" element={<ReceitasFichasTecnicas />} />
        
        {/* Rotas de Configuração */}
        <Route path="/settings/estabelecimento" element={<EstabelecimentoConfig />} />
        <Route path="/settings/integracoes" element={<IntegracoesConfig />} />
        <Route path="/settings/qz-tray" element={<ImpressaoQZTrayConfig />} />
        <Route path="/settings/cardapio-digital" element={<CardapioDigitalConfig />} />
        <Route path="/settings/horarios" element={<HorariosFuncionamentoSimples />} />
        <Route path="/settings/printnode-integration" element={<PrintNodeIntegrationPage />} />
        <Route path="/settings/configuracao-fiscal" element={<ConfiguracaoFiscalCompleta />} />
        <Route path="/settings/status" element={<ConfiguracaoStatus />} />

        <Route path="/config/pixel" element={<FacebookPixelConfig />} />
        <Route path="/config/integracao-facebook" element={<IntegracaoFacebook />} />
        
        {/* Rotas de Marketing */}
        <Route path="/marketing/campanha-whatsapp" element={<CampanhaWhatsApp />} />
        <Route path="/marketing/campanhas-salvas" element={<CampanhasSalvas />} />
        
        {/* Rotas de Opções da Loja */}
        <Route path="/opcoes-loja" element={<EstabelecimentoConfig />} />
        <Route path="/opcoes-loja/horarios" element={<HorariosFuncionamentoSimples />} />
        <Route path="/opcoes-loja/configuracao-fiscal" element={<ConfiguracaoFiscalCompleta />} />
        <Route path="/opcoes-loja/dados-fiscais" element={<DadosFiscais />} />
        <Route path="/opcoes-loja/dados-fiscais/:tipoId" element={<DadosFiscaisConfig />} />
        <Route path="/opcoes-loja/ifood-integrations" element={<IFoodIntegrationsLojista />} />
        <Route path="/teste-focus-nfe" element={<TesteFocusNFePage />} />
        <Route path="/teste-agente-pedidos" element={<TesteAgentePedidos />} />
        
        {/* Rotas de Super Admin */}
        {/* LinksDemo movido para PublicRoutes */}
        <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
        <Route path="/super-admin/ifood-global-config" element={<SuperAdminIFoodGlobalConfig />} />
        <Route path="/super-admin/ifood-import-config" element={<SuperAdminIFoodImportConfig />} />
        <Route path="/super-admin/ifood-integrations" element={<SuperAdminIFoodIntegrations />} />
        <Route path="/programas" element={<ProgramasPage />} />
        <Route path="/" element={<ProgramasPage />} />
        <Route path="/admin/whatsapp-integrations" element={<WhatsappIntegrationsAdmin />} />
        
        <Route path="/admin/company-users" element={<CompanyUsersManager />} />
        <Route path="/admin/company-users-manager" element={<CompanyUsersManager />} />
        <Route path="/admin/user-management" element={<UserManagement />} />
        <Route path="/empresas" element={<CompaniesPage />} />
        
        {/* Rotas de Admin - Gestão de Prompts IA */}
        <Route path="/test-integration" element={<TestIntegration />} />
        <Route path="/admin/agents/:slug" element={<AdminAgents />} />
        <Route path="/admin/prompts" element={<PromptsManagement />} />
        <Route path="/admin/import-cardapio" element={<ImportCardapioSupabase />} />
        <Route path="/whatsapp-ai-integration" element={<WhatsAppAIIntegration />} />
      </Route>
      
      {/* Página de acesso negado */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      
      {/* Rota não encontrada */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>;
  );
};

export default AccountRoutes;
