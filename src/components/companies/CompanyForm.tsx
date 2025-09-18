import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Send } from 'lucide-react';
import { useInvitation } from '@/hooks/useInvitation';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: string;
  status: string;
  user_count: number;
}

interface CompanyFormData {
  name: string;
  domain: string;
  logo?: string;
  plan: 'basic' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended';
  user_count: number;
}

interface CompanyFormProps {
  company?: Company | null;
  onSubmit: (data: CompanyFormData, invitationEmail?: string) => void;
  loading?: boolean;
}

export const CompanyForm: React.FC<CompanyFormProps> = ({
  company,
  onSubmit,
  loading = false
}) => {
  const { sendInvitation, fetchExistingEmail, isSending } = useInvitation()
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo: '',
    plan: 'basic' as 'basic' | 'pro' | 'enterprise',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    user_count: 0,
  })
  
  const [invitationEmail, setInvitationEmail] = useState('')

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        domain: company.domain,
        logo: company.logo || '',
        plan: (company.plan as 'basic' | 'pro' | 'enterprise') || 'basic',
        status: (company.status as 'active' | 'inactive' | 'suspended') || 'active',
        user_count: company.user_count,
      })
      
      // Buscar email existente para edição
      fetchExistingEmail(company.id).then(email => {
        if (email) setInvitationEmail(email)
      })
    } else {
      setFormData({
        name: '',
        domain: '',
        logo: '',
        plan: 'basic',
        status: 'active',
        user_count: 0,
      })
      setInvitationEmail('')

  }, [company])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, invitationEmail)
  };

  const handleSendInvite = () => {
    if (company && invitationEmail) {
      sendInvitation(invitationEmail, company.id)

  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome da Empresa</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Digite o nome da empresa"
          required
          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="domain">Domínio</Label>
        <Input
          id="domain"
          value={formData.domain}
          onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          placeholder="exemplo"
          required
          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (Emoji)</Label>
        <Input
          id="logo"
          value={formData.logo}
          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
          placeholder="🏢"
          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-white"
        />
      </div>

      {/* Seção de Convite */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {company ? 'Gerenciar Acesso' : 'Convidar Administrador'}
        </h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="invitation_email">Email do Administrador</Label>
            <div className="flex gap-2">
              <Input
                id="invitation_email"
                type="email"
                value={invitationEmail}
                onChange={(e) => setInvitationEmail(e.target.value)}
                placeholder="admin@empresa.com"
                className="flex-1 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-white"
              />
              {company && invitationEmail && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleSendInvite}
                  disabled={isSending}
                  className="bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {company && (
            <p className="text-xs text-gray-500">
              {invitationEmail 
                ? "Use o botão de envio para reenviar convite para este email" 
                : "Digite um email e use o botão de envio para convidar um novo administrador"
              }
            </p>
          )}

          {!company && (
            <p className="text-xs text-gray-500">
              Um convite será enviado automaticamente para este email após criar a empresa
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Select 
          value={formData.plan} 
          onValueChange={(value: 'basic' | 'pro' | 'enterprise') => 
            setFormData({ ...formData, plan: value })

        >
          <SelectTrigger className="bg-white border border-gray-300 text-gray-900 focus:bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900">
            <SelectItem value="basic">Básico</SelectItem>
            <SelectItem value="pro">Profissional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
            setFormData({ ...formData, status: value })

        >
          <SelectTrigger className="bg-white border border-gray-300 text-gray-900 focus:bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white text-gray-900">
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
            <SelectItem value="suspended">Suspenso</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user_count">Número de Usuários</Label>
        <Input
          id="user_count"
          type="number"
          value={formData.user_count}
          onChange={(e) => setFormData({ ...formData, user_count: parseInt(e.target.value) || 0 })}
          min="0"
          className="bg-white border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:bg-white"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={loading || isSending} 
          className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? 'Salvando...' : (company ? 'Atualizar' : 'Criar')}
        </Button>
      </div>
    </form>
  )
};
