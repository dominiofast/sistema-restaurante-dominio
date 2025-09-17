import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useInvitation } from '@/hooks/useInvitation';
import { CompanyForm } from './companies/CompanyForm';

interface Company {
  id: string;
  name: string;
  domain: string;
  logo?: string;
  plan: string;
  status: string;
  user_count: number;
}

interface CompanyDialogProps {
  open: boolean;
  onClose: () => void;
  company?: Company | null;
  onSave: (formData: any, invitationEmail?: string) => Promise<Company | void>;
  loading?: boolean;
}

export const CompanyDialog: React.FC<CompanyDialogProps> = ({
  open,
  onClose,
  company,
  onSave,
  loading = false
}) => {
  const { sendInvitation } = useInvitation();

  const handleSubmit = async (formData: any, invitationEmail?: string) => {
    try {
      await onSave(formData, invitationEmail);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-lg rounded-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </DialogTitle>
        </DialogHeader>
        
        <CompanyForm
          company={company}
          onSubmit={handleSubmit}
          loading={loading}
        />
        
        <div className="flex gap-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="flex-1 bg-white border border-gray-300 text-gray-900 hover:bg-gray-50"
          >
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};