export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'super_admin' | 'admin' | 'user';
  company_domain?: string;
  user_metadata?: {
    company_id?: string;
    [key: string]: any;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  slug?: string;
  store_code?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthContextType {
  user: User | null;
  currentCompany: Company | null;
  companies: Company[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: string) => void;
  isLoading: boolean;
  getCompanyData: () => any;
}
