import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
// SUPABASE REMOVIDO
import type { Session } from '@supabase/supabase-js';
import { cleanupAuthState } from '@/utils/authCleanup';
import { toast } from 'sonner';
import { useAuthCleanup } from '@/hooks/useAuthCleanup';
import { authOptimizer } from '@/utils/authOptimizer';

interface Company {
  id: string;
  name: string;
  logo?: string;
  domain: string;
  status: string;
  store_code: number;
  slug?: string;
  plan?: string;
  userCount?: number;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  company_domain?: string;
  user_metadata?: {
    company_id?: string;
    [key: string]: any;
  };
}

interface CompanyData {
  totalRevenue: string;
  totalOrders: number;
  activeUsers: number;
  conversionRate: string;
  recentActivity: Array<{
    type: string;
    description: string;
    time: string;
    value?: string;
  }>;
}

interface AuthContextType {
  user: AuthUser | null;
  currentCompany: Company | null;
  companyId: string | null;
  companies: Company[];
  isLoading: boolean;
  selectCompany: (company: Company) => void;
  switchCompany: (companyId: string) => void;
  exitCompanyMode: () => void;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getCompanyData: () => CompanyData | null;
  reloadCompanies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  currentCompany: null,
  companyId: null,
  companies: [],
  isLoading: true,
  selectCompany: () => {},
  switchCompany: () => {},
  exitCompanyMode: () => {},
  signOut: async () => {},
  login: async () => {},
  logout: async () => {},
  getCompanyData: () => null,
  reloadCompanies: async () => {}
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook para gerenciar cleanup
  const { isMounted, registerTimeout, registerSubscription, clearRegisteredTimeout, mountedRef } = useAuthCleanup();

  const loadCompanies = useCallback(async (authUser: AuthUser) => {
    // Evitar carregamento duplicado
    if (!isMounted()) return;
    
    try {
      console.log('AuthProvider: Carregando empresas otimizadas para usuário:', authUser.role);
      
      // Usar o otimizador para carregar empresas
      const loadedCompanies = await authOptimizer.loadCompaniesOptimized(authUser);
      
      if (!isMounted()) return;
      
      setCompanies(loadedCompanies);
      
      // Para super admins, verificar empresa selecionada salva
      if (authUser.role === 'super_admin') {
        const savedSelection = localStorage.getItem('super_admin_selected_company');
        if (savedSelection) {
          try {
            const parsed = JSON.parse(savedSelection);
            // Verificar se a sessão não expirou (24 horas) e se a empresa ainda existe
            if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
              const existingCompany = loadedCompanies.find(c => c.id === parsed.company.id);
              if (existingCompany && isMounted()) {
                setCurrentCompany(existingCompany);
                setCompanyId(existingCompany.id);
              }
            } else {
              localStorage.removeItem('super_admin_selected_company');
            }
          } catch (error) {
            console.error('AuthProvider: Erro ao restaurar empresa selecionada:', error);
            localStorage.removeItem('super_admin_selected_company');
          }
        }
      } else {
        // Para usuários regulares, selecionar automaticamente se há apenas uma empresa
        if (loadedCompanies.length === 1 && isMounted()) {
          const company = loadedCompanies[0];
          setCurrentCompany(company);
          setCompanyId(company.id);
          console.log('AuthProvider: Empresa única selecionada automaticamente:', company.name);
        } else if (loadedCompanies.length === 0) {
          console.error('AuthProvider: Usuário sem empresa configurada:', authUser.email);
          toast.error('Usuário não tem empresa associada. Entre em contato com o suporte.', {
            duration: 5000
          });
        }
      }
    } catch (error) {
      console.error('AuthProvider: Erro ao carregar empresas:', error);
      if (isMounted()) {
        setCompanies([]);
        setCurrentCompany(null);
        setCompanyId(null);
      }
    }
  }, [isMounted]);

  const reloadCompanies = useCallback(async () => {
    if (!isMounted() || !user) {
      console.warn('AuthContext: Tentativa de recarregar empresas com contexto inválido');
      return;
    }

    console.log('AuthContext: Forçando recarregamento das empresas...');
    
    // Limpar cache antes de recarregar
    authOptimizer.clearCache(user.id);
    
    setIsLoading(true);
    
    try {
      await loadCompanies(user);
    } catch (error) {
      console.error('AuthContext: Erro ao recarregar empresas:', error);
    } finally {
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  }, [user, loadCompanies, isMounted]);

  // Função para forçar refresh dos metadados do usuário
  const refreshUserMetadata = useCallback(async () => {
    console.log('AuthContext: Forçando refresh dos metadados do usuário...');
    try {
      const session = null as any;
      const error = null as any;
      if (error) {
        console.error('Erro ao obter sessão:', error);
        return;
      }
      
      if (session?.user) {
        // Forçar refresh do token
        const refreshData = null as any;
        const refreshError = null as any;
        if (refreshError) {
          console.error('Erro no refresh:', refreshError);
        } else {
          console.log('Refresh da sessão realizado com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao fazer refresh dos metadados:', error);
    }
  }, []);

  // Estado para controlar se já foi inicializado
  const [isInitialized, setIsInitialized] = useState(false);
  const subscriptionRef = useRef<any>(null);
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Timeout de segurança para evitar loading infinito
    const timeout = registerTimeout(setTimeout(() => {
      if (isMounted() && isLoading) {
        console.warn('AuthProvider: Timeout de inicialização atingido, forçando parada do loading');
        setIsLoading(false);
      }
    }, 10000)); // 10 segundos timeout
    
    return () => {
      clearRegisteredTimeout(timeout);
    };
  }, [isLoading, isMounted, registerTimeout, clearRegisteredTimeout]);

  useEffect(() => {
    // Evitar re-execução se já foi inicializado
    if (isInitialized) return;
    
    console.log('AuthProvider: Inicializando autenticação...');
    
    let isMountedLocal = true;
    
    // Verificar se há uma sessão de empresa salva
    const companyAuth = localStorage.getItem('company_auth');
    if (companyAuth) {
      try {
        const parsed = JSON.parse(companyAuth);
        // Verificar se a sessão não expirou (24 horas)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log('AuthProvider: Restaurando sessão de empresa...');
          if (isMountedLocal && isMounted()) {
            setUser(parsed.user);
            setCurrentCompany(parsed.company);
            setCompanyId(parsed.company.id);
            setIsLoading(false);
            setIsInitialized(true);
            lastUserIdRef.current = parsed.user.id;
            return;
          }
        } else {
          // Remover sessão expirada
          localStorage.removeItem('company_auth');
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao restaurar sessão de empresa:', error);
        localStorage.removeItem('company_auth');
      }
    }
    
    // Verificar localStorage primeiro (para login PostgreSQL)
    const userAuth = localStorage.getItem('user_auth');
    if (userAuth) {
      try {
        const parsed = JSON.parse(userAuth);
        // Verificar se a sessão não expirou (24 horas)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          console.log('AuthProvider: Restaurando sessão PostgreSQL...');
          if (isMountedLocal && isMounted()) {
            setUser(parsed.user);
            setIsLoading(false);
            setIsInitialized(true);
            lastUserIdRef.current = parsed.user.id;
            return;
          }
        } else {
          // Remover sessão expirada
          localStorage.removeItem('user_auth');
        }
      } catch (error) {
        console.error('AuthProvider: Erro ao restaurar sessão PostgreSQL:', error);
        localStorage.removeItem('user_auth');
      }
    }
    
    // Configurar listener de autenticação do Supabase apenas uma vez
    const setupAuth = async () => {
      try {
        // Verificar sessão existente do Supabase primeiro
        const { data: { session: existingSession } } = await Promise.resolve();
        console.log('AuthProvider: Verificando sessão existente...');
        
        // Processar sessão existente se houver
        if (existingSession?.user && isMountedLocal && isMounted()) {
          await processAuthUser(existingSession, 'INITIAL_SESSION', isMountedLocal);
        }
        
        // Configurar listener apenas se não há subscription ativa
        if (!subscriptionRef.current) {
          // DESABILITADO: Auth state change listener do Supabase
          // const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
          //   async (event, session) => {
          //     if (!isMountedLocal || !isMounted()) return;
          //     
          //     console.log('AuthProvider: Auth state changed:', event);
          //     await processAuthUser(session, event, isMountedLocal);
          //   }
          // );

          const authSubscription = null;
          
          subscriptionRef.current = registerSubscription(authSubscription);
        }
        
        // Se não há sessão, parar loading
        if (!existingSession && isMountedLocal && isMounted()) {
          setIsLoading(false);
        }
        
        setIsInitialized(true);
        
      } catch (error) {
        console.error('AuthProvider: Erro na configuração de auth:', error);
        if (isMountedLocal && isMounted()) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Função para processar usuário autenticado
    const processAuthUser = async (session: any, event: string, mounted: boolean) => {
      if (!mounted || !isMounted()) return;
      
      setSession(session);
      
      if (session?.user) {
        // Evitar reprocessamento do mesmo usuário
        if (lastUserIdRef.current === session.user.id && event !== 'SIGNED_IN') {
          console.log('AuthProvider: Usuário já processado, ignorando evento:', event);
          if (mounted) setIsLoading(false);
          return;
        }
        
        // Acessar os metadados diretamente do objeto user
        const userMeta = (session.user as any).raw_user_meta_data || {};
        const fallbackMeta = session.user.user_metadata || {};
        
        // Para o usuário de suporte, forçar os dados corretos se necessário
        let role = userMeta.role || fallbackMeta.role;
        let company_domain = userMeta.company_domain || fallbackMeta.company_domain;
        
        // Correção específica para usuários de suporte
        if (session.user.email === 'suporte@dominio.tech' || session.user.email === 'contato@dominio.tech') {
          role = 'super_admin';
          company_domain = 'all';
        }
        
        const authUser: AuthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: userMeta.name || fallbackMeta.name || fallbackMeta.full_name,
          role: role,
          avatar: userMeta.avatar_url || fallbackMeta.avatar_url,
          company_domain: company_domain,
          user_metadata: session.user.user_metadata
        };
        
        setUser(authUser);
        lastUserIdRef.current = session.user.id;
        
        // Carregar empresas apenas quando necessário
        const shouldLoadCompanies = event === 'SIGNED_IN' || 
                                   (event === 'INITIAL_SESSION' && !user) ||
                                   lastUserIdRef.current !== session.user.id;
        
        if (mounted && shouldLoadCompanies && isMounted()) {
          setIsLoading(true);
          
          // Usar timeout mais curto e com cleanup adequado
          const loadTimeout = registerTimeout(setTimeout(async () => {
            if (mounted && isMounted()) {
              try {
                await loadCompanies(authUser);
              } catch (error) {
                console.error('AuthProvider: Erro ao carregar empresas:', error);
              } finally {
                if (mounted && isMounted()) {
                  setIsLoading(false);
                }
              }
            }
          }, 50)); // Delay menor
          
        } else {
          // Para outros eventos, apenas parar loading
          if (mounted && isMounted()) {
            setIsLoading(false);
          }
        }
      } else {
        // Usuário deslogado
        if (mounted) {
          setUser(null);
          setCurrentCompany(null);
          setCompanyId(null);
          setCompanies([]);
          setIsLoading(false);
          lastUserIdRef.current = null;
        }
      }
    };

    setupAuth();

    return () => {
      isMountedLocal = false;
      
      if (subscriptionRef.current) {
        console.log('AuthProvider: Limpando subscription');
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [isInitialized, isMounted, registerTimeout, registerSubscription]); // Dependências otimizadas

  const login = async (email: string, password: string) => {
    if (!isMounted()) {
      throw new Error('Componente foi desmontado durante o login');
    }
    
    setIsLoading(true);
    
    // Timeout de segurança para evitar loading infinito
    const loginTimeout = registerTimeout(setTimeout(() => {
      console.warn('AuthProvider: Timeout de login atingido, forçando parada do loading');
      if (isMounted()) {
        setIsLoading(false);
      }
    }, 15000)); // 15 segundos timeout
    
    try {
      console.log('AuthProvider: Iniciando processo de login...');
      
      // Limpar estado de autenticação antes do login
      cleanupAuthState();
      
      // LOGIN POSTGRESQL - Usar endpoint nativo
      console.log('AuthProvider: Enviando request de login para PostgreSQL...');
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password
        })
      });
      
      const result = await response.json();
      
      console.log('AuthProvider: Response do login PostgreSQL:', {
        success: result.success,
        hasUser: !!result.user,
        status: response.status
      });
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erro no login');
      }
      
      // Criar usuário autenticado com dados do PostgreSQL
      const authUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role,
        user_metadata: {
          company_id: result.user.company_id || null
        }
      };
      
      setUser(authUser);
      
      // Salvar no localStorage para persistência
      localStorage.setItem('user_auth', JSON.stringify({
        user: authUser,
        timestamp: Date.now()
      }));
      
      console.log('AuthProvider: Login PostgreSQL realizado com sucesso!', {
        email: authUser.email,
        role: authUser.role
      });
      
    } catch (error) {
      console.error('AuthProvider: Erro no login:', error);
      throw error;
    } finally {
      clearRegisteredTimeout(loginTimeout);
      if (isMounted()) {
        setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider: Fazendo logout...');
      
      // Limpar subscription
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      
      // Limpar cache do otimizador
      authOptimizer.clearCache();
      authOptimizer.clearLoadingPromises();
      
      // Limpar estado local primeiro
      cleanupAuthState();
      
      // Limpar sessão de empresa se existir
      localStorage.removeItem('company_auth');
      localStorage.removeItem('super_admin_selected_company');
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      setCurrentCompany(null);
      setCompanyId(null);
      setCompanies([]);
      setIsLoading(false);
      setIsInitialized(false);
      lastUserIdRef.current = null;
      
      const error = null as any;
      
      if (error) {
        console.error('AuthProvider: Erro no logout:', error);
      }
      
      // Redirecionar para login
      window.location.href = '/login';
    } catch (error) {
      console.error('AuthProvider: Erro no logout:', error);
      window.location.href = '/login';
    }
  };

  const logout = async () => {
    await signOut();
  };

  const selectCompany = (company: Company) => {
    setCurrentCompany(company);
    setCompanyId(company.id);
    
    // Persistir a seleção da empresa no localStorage para super admins
    if (user?.role === 'super_admin' || user?.email === 'suporte@dominio.tech') {
      localStorage.setItem('super_admin_selected_company', JSON.stringify({
        company: company,
        user: user,
        timestamp: Date.now()
      }));
      console.log('AuthProvider: Super admin selecionou empresa:', company.name);
    }
  };

  const switchCompany = (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (company) {
      setCurrentCompany(company);
      setCompanyId(company.id);
    }
  };

  const exitCompanyMode = () => {
    // Limpar seleção de empresa para super admins
    localStorage.removeItem('super_admin_selected_company');
    localStorage.removeItem('selected_company'); // Limpar também a chave antiga se existir
    
    // Limpar estado do contexto
    setCurrentCompany(null);
    setCompanyId(null);
    
    console.log('AuthProvider: Saindo do modo de empresa');
  };

  const getCompanyData = (): CompanyData | null => {
    if (!currentCompany) return null;

    return {
      totalRevenue: 'R$ 12.350,00',
      totalOrders: 156,
      activeUsers: 48,
      conversionRate: '3.2%',
      recentActivity: [
        {
          type: 'order',
          description: 'Novo pedido de Pizza Margherita',
          time: 'há 5 minutos',
          value: 'R$ 45,00'
        },
        {
          type: 'user',
          description: 'Novo cliente cadastrado',
          time: 'há 12 minutos',
        },
        {
          type: 'product',
          description: 'Produto adicionado ao cardápio',
          time: 'há 1 hora',
        }
      ]
    };
  };

  const value = {
    user,
    currentCompany,
    companyId,
    companies,
    isLoading,
    selectCompany,
    switchCompany,
    exitCompanyMode,
    signOut,
    login,
    logout,
    getCompanyData,
    reloadCompanies,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};