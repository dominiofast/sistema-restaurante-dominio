
import React, { useState } from 'react';
import { Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { VagasDisponiveisHeader } from '@/components/vagas/VagasDisponiveisHeader';
import { VagaFormDialog } from '@/components/vagas/VagaFormDialog';
import { VagasList } from '@/components/vagas/VagasList';
import { useVagas } from '@/hooks/useVagas';

interface FormData {
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range: string;
  requirements: string;
  benefits: string;
  is_active: boolean;
}

interface Vaga {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary_range?: string;
  requirements?: string;
  benefits?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  config_id: string;
  company_id: string;
  apply_url?: string;
}

const VagasDisponiveis: React.FC = () => {
  const { companyId, currentCompany } = useAuth();
  const { vagas, loading, saveVaga, deleteVaga } = useVagas(companyId);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVaga, setEditingVaga] = useState<Vaga | null>(null);

  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    type: 'full-time',
    salary_range: '',
    requirements: '',
    benefits: '',
    is_active: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saveVaga(formData, editingVaga);
    if (success) {
      setDialogOpen(false);
      resetForm();
    }
  };

  const handleEdit = (vaga: Vaga) => {
    setEditingVaga(vaga);
    setFormData({
      title: vaga.title,
      description: vaga.description,
      location: vaga.location,
      type: vaga.type,
      salary_range: vaga.salary_range || '',
      requirements: vaga.requirements || '',
      benefits: vaga.benefits || '',
      is_active: vaga.is_active
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      type: 'full-time',
      salary_range: '',
      requirements: '',
      benefits: '',
      is_active: true
    });
    setEditingVaga(null);
  };

  const handleNewVaga = () => {
    resetForm();
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Briefcase className="h-12 w-12 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Carregando vagas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="w-full">
        <VagasDisponiveisHeader
          currentCompanyName={currentCompany?.name}
          vagasCount={vagas.length}
          activeVagasCount={vagas.filter(v => v.is_active).length}
          onNewVaga={handleNewVaga}
        />
      </section>

      <section className="w-full max-w-5xl mx-auto mt-20">
        <div className="bg-white rounded-lg shadow-lg relative z-0">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Lista de Vagas</h2>
            <p className="text-sm text-gray-600 mt-1">Visualize e gerencie todas as vagas cadastradas</p>
          </div>
          
          <div className="p-6">
            <VagasList
              vagas={vagas}
              currentCompanySlug={currentCompany?.slug}
              onNewVaga={handleNewVaga}
              onEdit={handleEdit}
              onDelete={deleteVaga}
            />
          </div>
        </div>
      </section>

      <VagaFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingVaga={editingVaga}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default VagasDisponiveis;
