
import React from 'react';
import { WhatsappIntegration } from '@/types/whatsapp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

interface IntegrationFormProps {
  form: Partial<WhatsappIntegration>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  success: string | null;
}

export const IntegrationForm: React.FC<IntegrationFormProps> = ({
  form,
  onFormChange,
  onSave,
  saving,
  error,
  success
}) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-sm font-medium text-gray-800">Uso da instância</Label>
          <select
            id="purpose"
            name="purpose"
            value={(form as any).purpose || 'primary'}
            onChange={onFormChange}
            className="bg-white border border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 rounded-md h-9 px-3"
          >
            <option value="primary">Agente IA (Atendimento/Chat)</option>
            <option value="marketing">Marketing (Campanhas)</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="control_id" className="text-sm font-medium text-gray-800">ID Único de Controle *</Label>
          <Input
            id="control_id"
            name="control_id" 
            value={form.control_id || ''} 
            onChange={onFormChange} 
            placeholder="e570acd2-2d6a-41b0-8fee-7253c9caa91c"
            required 
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="host" className="text-sm font-medium text-gray-800">Host *</Label>
          <Input
            id="host"
            name="host" 
            value={form.host || ''} 
            onChange={onFormChange} 
            placeholder="apinocode01.megaapi.com.br"
            required 
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instance_key" className="text-sm font-medium text-gray-800">Instance Key *</Label>
          <Input
            id="instance_key"
            name="instance_key" 
            value={form.instance_key || ''} 
            onChange={onFormChange} 
            placeholder="megacode-XXXXXX"
            required 
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="token" className="text-sm font-medium text-gray-800">Token *</Label>
          <Input
            id="token"
            name="token" 
            value={form.token || ''} 
            onChange={onFormChange} 
            placeholder="TOKEN"
            required 
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook" className="text-sm font-medium text-gray-800">Webhook</Label>
          <Input
            id="webhook"
            name="webhook" 
            value={form.webhook || 'https://dominio.tech/api/webhook'} 
            onChange={onFormChange} 
            placeholder="https://dominio.tech/api/webhook"
            className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800 placeholder:text-gray-500"
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Button 
        onClick={onSave} 
        className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        disabled={saving}
      >
        <Save className="h-4 w-4" />
        {saving ? 'Salvando...' : (form.id ? 'Atualizar' : 'Salvar')}
      </Button>
    </div>
  )
};
