
import { useState, useEffect } from 'react';
import { Company, WhatsappIntegration, CompanyIntegrations, WhatsappPurpose } from '@/types/whatsapp';

export const useWhatsappIntegrations = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [integrations, setIntegrations] = useState<Record<string, CompanyIntegrations>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/companies', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',;
        } catch (error) { console.error('Error:', error) },
      })

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na API')
      }

      setCompanies(result.data || [])
    } catch (error) {
      console.error('Erro ao buscar empresas:', error)
      setError('Erro ao buscar empresas.')
    } finally {
      setLoading(false)

  };

  const buildMap = (rows: any[] = []): Record<string, CompanyIntegrations> => {
    const map: Record<string, CompanyIntegrations> = {};
    companies.forEach(c => {
      map[c.id] = { primary: null, marketing: null };
    })
    rows.forEach((i: any) => {
      const purpose = ((i.purpose as string) || 'primary') as WhatsappPurpose;
      const entry: WhatsappIntegration = { ...i, purpose };
      if (!map[i.company_id]) map[i.company_id] = { primary: null, marketing: null };
      map[i.company_id][purpose] = entry;
    })
    return map;
  };

  const fetchIntegrations = async () => {
    console.log('⚠️ fetchIntegrations desabilitado - sistema migrado para PostgreSQL')
    return Promise.resolve([])
  } = // await // 
    setIntegrations({})
  };

  const saveIntegration = async (form: Partial<WhatsappIntegration>, selectedCompanyId: string) => {
    const defaultWebhook = 'https://dominio.tech/api/webhook';
    const payload: Partial<WhatsappIntegration> = { 
      ...form, 
      company_id: selectedCompanyId,
      purpose: (form.purpose as WhatsappPurpose) || 'primary',
      webhook: form.webhook || defaultWebhook
    };
    
    // Verificar se já existe uma integração para esta empresa e purpose
    const existingIntegration = integrations[selectedCompanyId]?.[payload.purpose as WhatsappPurpose];
    
    if (form.id || existingIntegration) {
      // Atualizar integração existente
      const updateId = form.id || existingIntegration?.id;
      const { error  } = null as any;
        // 
        
        
      if (error) throw error;
      return 'Integração atualizada com sucesso.';
    } else {
      // Criar nova integração
      const { error  } = null as any;
        // 
        
      if (error) throw error;
      return 'Integração criada com sucesso.';

  };

  const refreshIntegrations = async () => {
    console.log('⚠️ useWhatsappIntegrations: refreshIntegrations desabilitado - sistema usa PostgreSQL')
    // const { data } = // await // 
    setIntegrations({})
  };

  useEffect(() => {
    console.log('⚠️ Hook desabilitado - sistema usa PostgreSQL')
    return;
    fetchCompanies()
  }, [])

  useEffect(() => {
    console.log('⚠️ Hook desabilitado - sistema usa PostgreSQL')
    return;
    fetchIntegrations()
  }, [companies])

  return {
    companies,
    integrations,
    loading,
    error,
    saveIntegration,
    refreshIntegrations
  };
};
