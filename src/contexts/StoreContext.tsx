import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Company {
  id: string;
  name: string;
  domain: string;
  status: string;
  plan?: string;
  user_count?: number;
}

interface StoreInfo {
  id: string;
  name: string;
  domain: string;
  status: string;
  plan: string;
  user_count: number;
}

interface StoreContextType {
  selectedStore: StoreInfo | null;
  selectCompany: (company: StoreInfo | null) => void;
  userCompanies: Company[];
  isStoreFilterActive: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const { user, currentCompany, companies } = useAuth();
  
  // CRITICAL: Extract companies from AuthContext
  const userCompanies = companies || [];
  
  // Helper function to convert Company to StoreInfo
  const convertToStoreInfo = (company: Company): StoreInfo => ({
    id: company.id,
    name: company.name,
    domain: company.domain,
    status: company.status,
    plan: company.plan || 'standard',
    user_count: company.user_count || 0
  });
  
  // Enhanced initialization with validation
  const [selectedStore, setSelectedStoreState] = useState<StoreInfo | null>(() => {
    try {
      // Priority: 1. Stored in localStorage 2. Current company 3. First company 4. Null
      const storedCompany = localStorage.getItem('selectedCompany');
      const parsedStoredCompany = storedCompany ? JSON.parse(storedCompany) : null;
      
      // Validate stored company exists in user's companies
      const validatedCompany = userCompanies.find(
        (company: Company) => company.id === parsedStoredCompany?.id
      );
      
      if (validatedCompany) {
        return convertToStoreInfo(validatedCompany);
      }
      
      } catch (error) {
        console.error('Error:', error);
      }
      
      if (currentCompany) {
        return convertToStoreInfo(currentCompany);
      }
      
      if (userCompanies[0]) {
        return convertToStoreInfo(userCompanies[0]);
      }
      
      return null;
    } catch (error) {
      if (currentCompany) {
        return convertToStoreInfo(currentCompany);
      }
      if (userCompanies[0]) {
        return convertToStoreInfo(userCompanies[0]);
      }
      return null;
    }
  });

  const selectCompany = (company: StoreInfo | null) => {
    if (!company) {
      console.log('❌ Clearing company selection');
      setSelectedStoreState(null);
      localStorage.removeItem('selectedCompany');
      return;

    
    // ENHANCED VALIDATION
    if (!userCompanies.some((c: Company) => c.id === company.id)) {
      console.error('❌ Invalid company selection', { company, userCompanies });
      return;

    
    console.log('✅ Selecting company:', company.name, 'ID:', company.id);
    setSelectedStoreState(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    
    // Optional: Dispatch event for cross-component communication
    window.dispatchEvent(new CustomEvent('companyChanged', { detail: company }));
  };

  const isStoreFilterActive = selectedStore !== null;

  // Debug logging
  useEffect(() => {
    console.log('🔍 StoreContext State:', {
      selectedStore,
      userCompanies,
      currentCompany,
      storedCompany: localStorage.getItem('selectedCompany')
    });
  }, [selectedStore, userCompanies, currentCompany]);

  return (
    <StoreContext.Provider value={{
      selectedStore,
      selectCompany,
      userCompanies,
      isStoreFilterActive
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {;
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');

  return context;
};