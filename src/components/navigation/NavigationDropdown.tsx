import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useStore } from '@/contexts/StoreContext';
import StoreSelector from '@/components/StoreSelector';
import { Badge } from '@/components/ui/badge';
import { ProBadge } from '@/components/ui/pro-badge';
import { ComingSoonBadge } from '@/components/ui/coming-soon-badge';
import { TurnoModal } from '@/components/TurnoModal';
import { CaixaModal } from '@/components/CaixaModal';
import { useTurnos } from '@/hooks/useTurnos';
import { useCaixa } from '@/hooks/useCaixa';
import {
  Menu,
  X,
  Search,
  Bell,
  Settings,
  ChevronRight,
  ShoppingCart,
  Users,
  Monitor,
  CreditCard,
  MessageSquare,
  UtensilsCrossed,
  Building,
  Package,
  UserCheck,
  BarChart3,
  Bot,
  Phone,
  Receipt,
  Calculator,
  Truck,
  FileText,
  Briefcase,
  Printer,
  Facebook,
  Gift,
  BrainCircuit,
  User,
  LogOut,
  ChefHat,
  Package2,
  ClockIcon,
  DollarSign,
  Download,
  Code,
  Zap,
  Tablet,
  List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MenuSection {
  title: string;
  icon: React.ComponentType<any>;
  items: {
    label: string;
    path: string;
    icon: React.ComponentType<any>;
    description?: string;
    isPro?: boolean;
    isComingSoon?: boolean;
    isKiosk?: boolean;
  }[];
}

export const NavigationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [turnoModalOpen, setTurnoModalOpen] = useState(false);
  const [caixaModalOpen, setCaixaModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, currentCompany, exitCompanyMode, selectCompany: authSelectCompany } = useAuth();
  const { selectedStore, selectCompany: storeSelectCompany } = useStore();
  const { temTurnoAtivo } = useTurnos();
  const { caixaAtual } = useCaixa();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const temCaixaAberto = caixaAtual && caixaAtual.status === 'aberto';

  // Mapeamento das seções baseado nas rotas existentes do app
  const sections: MenuSection[] = [
    {
      title: 'Vendas & Operação',
      icon: ShoppingCart,
      items: [
        { label: 'Pedidos', path: '/pedidos', icon: ShoppingCart, description: 'Gerenciar pedidos' },
        { label: 'PDV', path: '/pdv', icon: Monitor, description: 'Ponto de venda' },
        { label: 'Kiosk (Autoatendimento)', path: '/kiosk', icon: Tablet, description: 'Terminal de autoatendimento', isKiosk: true, isPro: true },
        { label: 'Caixa', path: '/caixa', icon: CreditCard, description: 'Controle de caixa' },
        { label: 'KDS', path: '/kds', icon: Monitor, description: 'Kitchen Display', isPro: true },
        { label: 'Clientes', path: '/clientes', icon: Users, description: 'Base de clientes' }
      ]
    },
    {
      title: 'Cardápio & Marketing',
      icon: UtensilsCrossed,
      items: [
        { label: 'Gestor Cardápio', path: '/gestor-cardapio', icon: UtensilsCrossed, description: 'Gerenciar produtos' },
        { label: 'Cashback', path: '/cashback', icon: Gift, description: 'Sistema de cashback' },
        { label: 'Integração Facebook', path: '/config/integracao-facebook', icon: Facebook, description: 'Configurar pixel e API' },
        { label: 'Cardápio Digital', path: '/settings/cardapio-digital', icon: UtensilsCrossed, description: 'Configurações digitais' }
      ]
    },
    {
      title: 'WhatsApp & IA',
      icon: MessageSquare,
      items: [
        { label: 'Chat WhatsApp', path: '/chat', icon: MessageSquare, description: 'Conversar com clientes' },
        
        
        
        { label: 'Integração WhatsApp + IA', path: '/whatsapp-ai-integration', icon: Zap, description: 'Status da integração' },
        { label: 'Conectar WhatsApp', path: '/whatsapp-connect', icon: Phone, description: 'Integração WhatsApp' }
      ]
    },
    {
      title: 'Marketing e atendimento',
      icon: MessageSquare,
      items: [
        { label: 'Campanha de WhatsApp', path: '/marketing/campanha-whatsapp', icon: MessageSquare, description: 'Criar e enviar campanhas', isPro: true },
        { label: 'Campanhas Salvas', path: '/marketing/campanhas-salvas', icon: List, description: 'Gerenciar campanhas', isPro: true }
      ]
    },
    {
      title: 'Gestão & Configurações',
      icon: Settings,
      items: [
        { label: 'Estabelecimento', path: '/settings/estabelecimento', icon: Building, description: 'Dados da empresa' },
        { label: 'Integrações', path: '/settings/integracoes', icon: Truck, description: 'Integrações externas' },
        { label: 'QZ Tray (Impressão)', path: '/settings/qz-tray', icon: Printer, description: 'Conectar e testar' },
        { label: 'Status de Pedidos', path: '/settings/status', icon: Settings, description: 'Config. status' },
        { label: 'Configuração Fiscal', path: '/settings/configuracao-fiscal', icon: Receipt, description: 'Setup fiscal' },
        { label: 'Integração PrintNode', path: '/settings/printnode-integration', icon: Printer, description: 'Impressão em nuvem', isPro: true }
      ]
    }
  ];

  // Adicionar seções específicas para Super Admin
  if (user?.role === 'super_admin') {
    sections.push({
      title: 'Super Admin',
      icon: BarChart3,
      items: [
        { label: 'Dashboard', path: '/super-admin/dashboard', icon: BarChart3, description: 'Painel administrativo' },
        { label: 'Editor de Prompts IA', path: '/admin/prompts', icon: Code, description: 'Editor unificado de prompts e configurações' },
        { label: 'Programas', path: '/programas', icon: Download, description: 'Gerenciar programas Saipos' },
        { label: 'Empresas', path: '/empresas', icon: Building, description: 'Gerenciar empresas' },
        { label: 'Usuários', path: '/admin/company-users', icon: Users, description: 'Gerenciar usuários' },
        { label: 'WhatsApp Admin', path: '/admin/whatsapp-integrations', icon: MessageSquare, description: 'Configurar instâncias WhatsApp' },
        { label: 'iFood Admin', path: '/super-admin/ifood-integrations', icon: Truck, description: 'Admin iFood' }
      ]
    });
  }

  // Seções extras (Estoque, Ficha Técnica e RH)
  const extraSections: MenuSection[] = [
    {
      title: 'Estoque & Compras',
      icon: Package,
      items: [
        { label: 'Notas de Entrada', path: '/estoque/notas-entrada', icon: FileText, description: 'Controle de entrada', isComingSoon: true }
      ]
    },
    {
      title: 'Ficha Técnica',
      icon: ChefHat,
      items: [
        { label: 'Mercadorias e Ingredientes', path: '/ficha-tecnica/mercadorias-ingredientes', icon: Package2, description: 'Gerenciar matérias-primas', isComingSoon: true },
        { label: 'Receitas Fichas Técnicas', path: '/ficha-tecnica/receitas-fichas-tecnicas', icon: ChefHat, description: 'Criar fichas de receitas', isComingSoon: true }
      ]
    },
    {
      title: 'Recursos Humanos',
      icon: UserCheck,
      items: [
        { label: 'Página de Vagas', path: '/meu-rh/pagina-vagas', icon: Briefcase, description: 'Configurar vagas', isComingSoon: true },
        { label: 'Vagas Disponíveis', path: '/meu-rh/vagas-disponiveis', icon: UserCheck, description: 'Ver vagas', isComingSoon: true },
        { label: 'Inscrições', path: '/meu-rh/inscricoes-vagas', icon: Users, description: 'Candidatos', isComingSoon: true }
      ]
    }
  ];

  // Filtrar itens baseado na busca
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item =>
      item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  })).filter(section => section.items.length > 0);

  // Função para gerar identificador da empresa para URLs públicas
  const getCompanyIdentifier = (company: any): string | null => {
    if (!company) {
      console.error('🖥️ Kiosk - No company provided');
      return null;
    }

    // 1. Primeiro tenta usar slug existente
    if (company.slug && company.slug.trim()) {
      return company.slug.trim();
    }

    // 2. Depois tenta usar domain
    if (company.domain && company.domain.trim()) {
      return company.domain.trim();
    }

    // 3. Gera slug baseado no nome da empresa
    if (company.name && company.name.trim()) {
      const generatedSlug = company.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-') // Substitui espaços por hífen
        .replace(/-+/g, '-'); // Remove hífens múltiplos
      
      if (generatedSlug) {
        return generatedSlug;
      }
    }

    // 4. Fallback: usa ID da empresa
    if (company.id) {
      return company.id;
    }

    return null;
  };

  const handleNavigation = (path: string, isComingSoon?: boolean, isKiosk?: boolean) => {
    if (isComingSoon) {
      // Não navegar para páginas em desenvolvimento
      return;
    }
    
    if (isKiosk) {
      // Abrir Kiosk em nova aba/janela para modo fullscreen
      const company = currentCompany;
      console.log('🖥️ Kiosk - Current company:', company);
      
      const companyIdentifier = getCompanyIdentifier(company);
      
      if (companyIdentifier) {
        const kioskUrl = `/autoatendimento/${companyIdentifier}`;
        console.log('🖥️ Kiosk - Opening URL:', kioskUrl);
        window.open(kioskUrl, '_blank');
      } else {
        console.error('🖥️ Kiosk - Could not generate company identifier:', company);
        alert('Erro: Não foi possível abrir o Kiosk. Configure o nome da empresa primeiro.');
      }
      setIsOpen(false);
      setSearchTerm('');
      return;
    }
    
    navigate(path);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchTerm('');
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  return (
    <>
      {/* Header Principal */}
      <header className="fixed top-0 left-0 right-0 z-40 shadow-lg" style={{ backgroundColor: '#224276' }}>
        <div className="flex items-center justify-between px-2 sm:px-4 h-14 gap-2">
          {/* Logo, Menu e PDV/KDS - agrupados */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Logo - clicável para ir ao início */}
            <button
              onClick={() => {
                if (user?.role === 'super_admin') {
                  navigate('/empresas');
                } else {
                  navigate('/pedidos');
                }
              }}
              className="transition-transform duration-300 hover:scale-105"
            >
              <img 
                src="/lovable-uploads/890942e2-83ea-4ad0-9513-af24d7bb0554.png" 
                alt="Domínio Tech" 
                className="h-10 sm:h-14 w-auto filter brightness-0 invert cursor-pointer"
              />
            </button>
            
            {/* Menu Button */}
            <Button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-2 sm:px-4 py-2 transition-all duration-300 hover:scale-105"
              variant="outline"
              size="sm"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline">MENU</span>
            </Button>

            {/* Divisor visual */}
            <div className="w-px h-6 bg-white/20 mx-1"></div>

            {/* Botões PDV e KDS */}
            <Button
              onClick={() => navigate('/pdv')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-300 hover:scale-105"
              variant="outline"
              size="sm"
            >
              <Monitor className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">PDV</span>
            </Button>
            <Button
              onClick={() => navigate('/kds')}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 px-2 sm:px-3 py-1.5 sm:py-2 transition-all duration-300 hover:scale-105"
              variant="outline"
              size="sm"
            >
              <UtensilsCrossed className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">KDS</span>
            </Button>
          </div>



          {/* Action Icons e User Menu */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Botões de Turno e Caixa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTurnoModalOpen(true)}
              className={`relative ${temTurnoAtivo() ? 'text-green-400 hover:text-green-300' : 'text-white hover:text-white/80'} hover:bg-white/10 px-2 py-1.5`}
              title={temTurnoAtivo() ? 'Turno Ativo - Clique para fechar' : 'Abrir Turno'}
            >
              <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              {temTurnoAtivo() && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500"></Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCaixaModalOpen(true)}
              className={`relative ${temCaixaAberto ? 'text-green-400 hover:text-green-300' : 'text-white hover:text-white/80'} hover:bg-white/10 px-2 py-1.5`}
              title={temCaixaAberto ? 'Caixa Aberto - Clique para fechar' : 'Abrir Caixa'}
            >
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              {temCaixaAberto && (
                <Badge className="absolute -top-1 -right-1 h-3 w-3 rounded-full p-0 bg-green-500"></Badge>
              )}
            </Button>

            {/* Divisor visual */}
            <div className="w-px h-6 bg-white/20 mx-1"></div>

          {/* Store Selector - visível para todos os usuários */}
          {user && (
            <div className="block mr-2">
              <StoreSelector 
                selectedStore={selectedStore ? {
                  id: selectedStore.id,
                  merchant_id: selectedStore.domain,
                  store_name: selectedStore.name,
                  is_active: selectedStore.status === 'active',
                  company_name: selectedStore.domain
                } : null}
                onStoreSelect={(store) => {
                  console.log('🏪 Loja selecionada no NavigationDropdown:', store);
                  if (store) {
                    const storeInfo = {
                      id: store.id,
                      name: store.store_name,
                      domain: store.merchant_id,
                      status: store.is_active ? 'active' : 'inactive',
                      plan: store.environment || 'standard',
                      user_count: 1
                    };
                    console.log('📦 Setando no StoreContext:', storeInfo);
                    storeSelectCompany(storeInfo);
                    
                    // IMPORTANTE: Também atualizar o currentCompany para carregar os dados da empresa
                    const companyForAuth = {
                      id: store.id,
                      name: store.store_name,
                      domain: store.merchant_id,
                      plan: store.environment || 'standard',
                      status: store.is_active ? 'active' : 'inactive',
                      user_count: 1,
                      store_code: 0,
                      slug: store.merchant_id,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString()
                    };
                    console.log('🔄 Chamando selectCompany para carregar dados da empresa:', companyForAuth);
                    authSelectCompany(companyForAuth);
                  } else {
                    console.log('❌ Removendo seleção de loja');
                    storeSelectCompany(null);
                  }
                }}
              />
            </div>
          )}

            {/* Action Icons */}
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-1.5 sm:p-2">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Notificações</span>
            </Button>
            
            {/* User Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 p-1.5 sm:p-2">
                  <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-white text-blue-600 text-xs font-semibold">
                      {user?.name?.split(' ')[0]?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || <User className="h-3 w-3 sm:h-4 sm:w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="font-medium">{user?.name || 'Usuário'}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Dropdown Popup */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 bg-black/40 z-50 transition-opacity duration-300" />
          
          {/* Popup */}
          <div 
            ref={dropdownRef}
            className="fixed top-16 left-4 right-4 max-w-6xl mx-auto bg-white rounded-lg shadow-2xl z-50 animate-fade-in"
            style={{
              animation: 'fadeInDown 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            {/* Header do Popup */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Navegação</h2>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Grid de Seções */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(searchTerm ? filteredSections : [...sections, ...extraSections]).map((section, index) => (
                  <div
                    key={section.title}
                    className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200"
                    style={{
                      animation: `fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) ${index * 100}ms both`
                    }}
                  >
                    {/* Cabeçalho da Seção */}
                    <div className="flex items-center mb-3">
                      <section.icon className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-semibold text-gray-900 text-sm">{section.title}</h3>
                    </div>

                    {/* Itens da Seção */}
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => handleNavigation(item.path, item.isComingSoon, item.isKiosk)}
                          className={`w-full text-left p-2 rounded-md transition-all duration-200 group ${
                            item.isComingSoon 
                              ? 'cursor-not-allowed opacity-75 hover:bg-gray-50' 
                              : 'hover:bg-blue-50 hover:translate-x-2'
                          }`}
                          disabled={item.isComingSoon}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <item.icon className="h-3 w-3 text-gray-500 mr-2" />
                              <span className="text-xs text-gray-700 group-hover:text-blue-600">
                                {item.label}
                              </span>
                              {item.isPro && (
                                <ProBadge size="sm" className="ml-2" />
                              )}
                              {item.isComingSoon && (
                                <ComingSoonBadge size="sm" className="ml-2" />
                              )}
                            </div>
                            <ChevronRight className="h-3 w-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 ml-5 mt-1">{item.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Empty state (when no companies) */}
            {(searchTerm ? filteredSections : [...sections, ...extraSections]).length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum item encontrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Tente usar outros termos de busca.
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modals */}
      <TurnoModal open={turnoModalOpen} onOpenChange={setTurnoModalOpen} />
      <CaixaModal open={caixaModalOpen} onOpenChange={setCaixaModalOpen} />

      {/* CSS Animations are handled via Tailwind classes and inline styles */}
    </>
  );
};