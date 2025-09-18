
import React, { useState } from 'react';
import { useWhatsappIntegrations } from '@/hooks/useWhatsappIntegrations';
import { CompanyList } from '@/components/whatsapp/CompanyList';
import { IntegrationForm } from '@/components/whatsapp/IntegrationForm';
import { Company, WhatsappIntegration } from '@/types/whatsapp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

export const WhatsappIntegrationsAdmin: React.FC = () => {
  const { companies, integrations, saveIntegration, refreshIntegrations } = useWhatsappIntegrations()
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [form, setForm] = useState<Partial<WhatsappIntegration>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const getDraftStorageKey = (companyId: string) => `whatsapp_integration_draft_${companyId}`;

  const handleSelectCompany = (company: Company) => {
    setSelectedCompanyId(company.id)
    const ints = integrations[company.id];
    const defaultWebhook = 'https://dominio.tech/api/webhook';
    const defaultPurpose: 'primary' | 'marketing' = ints?.primary ? 'primary' : (ints?.marketing ? 'marketing' : 'primary')

    try {
      const draftKey = getDraftStorageKey(company.id)
      const draftString = typeof window !== 'undefined' ? window.localStorage.getItem(draftKey) : null;
      if (draftString) {
        const draft = JSON.parse(draftString) as Partial<WhatsappIntegration>;
        setForm({ ...draft, company_id: company.id, purpose: (draft.purpose as any) || defaultPurpose } catch (error) { console.error('Error:', error) })
      } else if (ints?.[defaultPurpose]) {
        setForm({ ...(ints[defaultPurpose] as WhatsappIntegration) })
      } else {
        setForm({ company_id: company.id, webhook: defaultWebhook, purpose: defaultPurpose } as Partial<WhatsappIntegration>)
      }
    } catch {
      if (ints?.[defaultPurpose]) {
        setForm({ ...(ints[defaultPurpose] as WhatsappIntegration) })
      } else {
        setForm({ company_id: company.id, webhook: defaultWebhook, purpose: defaultPurpose } as Partial<WhatsappIntegration>)
      }
    }
    setError(null)
    setSuccess(null)
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'purpose') {
      if (selectedCompanyId) {
        const ints = integrations[selectedCompanyId];
        const existing = ints && (ints as any)[value as 'primary' | 'marketing'];
        if (existing) {
          setForm({ ...(existing as WhatsappIntegration) })
        } else {
          setForm({ company_id: selectedCompanyId, webhook: 'https://dominio.tech/api/webhook', purpose: value as any })
        }
      } else {
        setForm(prev => ({ ...prev, purpose: value as any }))
      }
    } else {
      const nextForm: Partial<WhatsappIntegration> = {
        ...form,
        [name]: value,
        company_id: selectedCompanyId || form.company_id,
      };
      setForm(nextForm)
      if (selectedCompanyId && typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(getDraftStorageKey(selectedCompanyId), JSON.stringify(nextForm))
        } catch {
          // ignore
        }
      }

  };

  const handleSave = async () => {
    // Garante que o webhook esteja preenchido com o domínio correto
    if (!form.webhook) {
      form.webhook = 'https://dominio.tech/api/webhook';

    if (!selectedCompanyId) return;
    
    setSaving(true)
    setError(null)
    setSuccess(null)
    
    try {
      const message = await saveIntegration(form, selectedCompanyId)
      setSuccess(message)
      await refreshIntegrations()
      // Limpa rascunho salvo ao confirmar persistência no backend
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(getDraftStorageKey(selectedCompanyId))
        }
       } catch {
        // ignore
      }
    } catch (err: any) {
      setError('Erro ao salvar integração: ' + err.message)

    setSaving(false)
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Integrações WhatsApp</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Empresas */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-gray-800 text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-700" /> 
              Empresas
              <span className="ml-2 bg-gray-100 text-gray-800 rounded-full px-2 py-1 text-xs font-medium">
                {companies.length}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <CompanyList
              companies={companies}
              integrations={integrations}
              selectedCompanyId={selectedCompanyId}
              onSelectCompany={handleSelectCompany}
            />
          </CardContent>
        </Card>

        {/* Formulário de Integração */}
        <Card className="bg-white shadow-sm border border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-4">
            <CardTitle className="text-gray-800 text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-700" /> 
              Configuração WhatsApp
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {selectedCompanyId ? (
              <IntegrationForm
                form={form}
                onFormChange={handleChange}
                onSave={handleSave}
                saving={saving}
                error={error}
                success={success}
              />
            ) : (
              <div className="text-center py-8 text-gray-600">
                Selecione uma empresa para configurar integração.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
};

export default WhatsappIntegrationsAdmin;
