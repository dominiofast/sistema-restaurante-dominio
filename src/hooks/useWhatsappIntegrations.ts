
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Company, WhatsappIntegration, CompanyIntegrations, WhatsappPurpose } from '@/types/whatsapp';

export const useWhatsappIntegrations = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [integrations, setIntegrations] = useState<Record<string, CompanyIntegrations>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('companies').select('id, name, domain, logo').order('name');
    if (error) setError('Erro ao buscar empresas.');
    else setCompanies(data || []);
    setLoading(false);
  };

  const buildMap = (rows: any[] = []): Record<string, CompanyIntegrations> => {
    const map: Record<string, CompanyIntegrations> = {};
    companies.forEach(c => {
      map[c.id] = { primary: null, marketing: null };
    });
    rows.forEach((i: any) => {
      const purpose = ((i.purpose as string) || 'primary') as WhatsappPurpose;
      const entry: WhatsappIntegration = { ...i, purpose };
      if (!map[i.company_id]) map[i.company_id] = { primary: null, marketing: null };
      map[i.company_id][purpose] = entry;
    });
    return map;
  };

  const fetchIntegrations = async () => {
    if (companies.length === 0) return;
    const { data } = await supabase.from('whatsapp_integrations').select('*');
    setIntegrations(buildMap(data || []));
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
      const { error } = await supabase
        .from('whatsapp_integrations')
        .update(payload as any)
        .eq('id', updateId);
      if (error) throw error;
      return 'Integração atualizada com sucesso.';
    } else {
      // Criar nova integração
      const { error } = await supabase
        .from('whatsapp_integrations')
        .insert([payload as any]);
      if (error) throw error;
      return 'Integração criada com sucesso.';
    }
  };

  const refreshIntegrations = async () => {
    const { data } = await supabase.from('whatsapp_integrations').select('*');
    setIntegrations(buildMap(data || []));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [companies]);

  return {
    companies,
    integrations,
    loading,
    error,
    saveIntegration,
    refreshIntegrations
  };
};
