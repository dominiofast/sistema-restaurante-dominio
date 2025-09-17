import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface TipoFiscalFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function TipoFiscalForm({ initialData, onSubmit, onCancel }: TipoFiscalFormProps) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      nome: initialData?.nome || '',
      descricao: initialData?.descricao || '',
      ativo: initialData?.ativo ?? true
    }
  });

  const ativo = watch('ativo');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome do Tipo *</Label>
          <Input
            id="nome"
            placeholder="Ex: Comida, Refrigerante, etc."
            {...register('nome', { required: 'Nome é obrigatório' })}
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{String(errors.nome.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ativo">Status</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={(checked) => setValue('ativo', checked)}
            />
            <Label htmlFor="ativo">{ativo ? 'Ativo' : 'Inativo'}</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          placeholder="Descrição opcional do tipo fiscal"
          {...register('descricao')}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar
        </Button>
      </div>
    </form>
  );
}