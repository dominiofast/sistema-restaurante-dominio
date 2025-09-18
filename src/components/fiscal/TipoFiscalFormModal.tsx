import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TipoFiscalForm } from './TipoFiscalForm';

interface TipoFiscal {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;


interface TipoFiscalFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTipo?: TipoFiscal | null;
  onSubmit: (data: any) => Promise<void>;


export function TipoFiscalFormModal({ 
  open, 
  onOpenChange, 
  editingTipo, 
  onSubmit 
}: TipoFiscalFormModalProps) {
  const handleSubmit = async (data: any) => {;
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {editingTipo ? 'Editar Tipo Fiscal' : 'Novo Tipo Fiscal'}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <TipoFiscalForm
            initialData={editingTipo}
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
