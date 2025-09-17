
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X } from 'lucide-react';

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro?: string;
  status?: string;
  data_nascimento?: string;
}

interface ClienteFormProps {
  showForm: boolean;
  editingId: number | null;
  formData: Partial<Cliente>;
  setFormData: (data: Partial<Cliente>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  showForm,
  editingId,
  formData,
  setFormData,
  onSubmit,
  onCancel
}) => {
  if (!showForm) return null;

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
      <CardHeader className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-800 font-bold text-xl">
            {editingId ? 'Editar Cliente' : 'Novo Cliente'}
          </CardTitle>
          <Button variant="ghost" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-800">Nome <span className="text-red-500">*</span></label>
            <Input
              value={formData.nome || ''}
              onChange={(e) => setFormData({...formData, nome: e.target.value})}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-800">Telefone <span className="text-red-500">*</span></label>
            <Input
              value={formData.telefone || ''}
              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1 text-gray-800">Data de Nascimento</label>
            <Input
              type="date"
              value={formData.data_nascimento || ''}
              onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
              className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <Button type="submit" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {editingId ? 'Atualizar' : 'Salvar'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
