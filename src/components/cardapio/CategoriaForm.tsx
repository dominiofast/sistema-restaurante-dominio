
import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from './ImageUploader';
import { Categoria } from '@/types/cardapio';
import { useTiposFiscais } from '@/hooks/useTiposFiscais';

interface CategoriaFormProps {
  categoria?: Categoria | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  image?: string;
  is_active: boolean;
  tipo_fiscal_id: string;
}

export const CategoriaForm: React.FC<CategoriaFormProps> = ({
  categoria,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { tiposFiscais, loading: loadingTipos, error: errorTipos } = useTiposFiscais();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: categoria?.name || '',
      description: categoria?.description || '',
      image: categoria?.image || '',
      is_active: categoria?.is_active ?? true,
      tipo_fiscal_id: categoria?.tipo_fiscal_id || '',
    },
    mode: 'onChange',
  });

  React.useEffect(() => {
    if (categoria) {
      reset({
        name: categoria.name,
        description: categoria.description || '',
        image: categoria.image || '',
        is_active: categoria.is_active,
        tipo_fiscal_id: categoria.tipo_fiscal_id || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        image: '',
        is_active: true,
        tipo_fiscal_id: '',
      });

  }, [categoria, reset]);

  const handleFormSubmit = async (data: FormData) => {;
    console.log('🔍 CategoriaForm: Dados do formulário:', data);
    console.log('🔍 CategoriaForm: Erros do formulário:', errors);
    
    // Validar se há erros
    if (Object.keys(errors).length > 0) {
      console.error('❌ CategoriaForm: Formulário tem erros:', errors);
      return;

    
    // Converter string vazia para null para campos UUID
    const cleanedData = {
      ...data,
      tipo_fiscal_id: data.tipo_fiscal_id === '' ? null : data.tipo_fiscal_id,;
    };
    
    console.log('🔍 CategoriaForm: Dados limpos:', cleanedData);
    
    try {
      await onSubmit(cleanedData);
      onClose();
    } catch (error) {
      console.error('❌ CategoriaForm: Erro ao salvar:', error);
      throw error;

  };

  const isActive = watch('is_active');
  const imageValue = watch('image');

  // Debug: Log quando o formulário é renderizado
  React.useEffect(() => {
    console.log('🔍 CategoriaForm: Formulário renderizado', {
      isOpen,
      categoria,
      loading,
      errors: Object.keys(errors),
      tiposFiscais: tiposFiscais?.length || 0
    });
  }, [isOpen, categoria, loading, errors, tiposFiscais]);

  // Formulário sempre renderiza, sem loading bloqueante

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle className="text-black">
            {categoria ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-black">Nome da Categoria *</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Nome é obrigatório',
                  minLength: {
                    value: 2,
                    message: 'Nome deve ter pelo menos 2 caracteres'
                  },
                  maxLength: {
                    value: 100,
                    message: 'Nome deve ter no máximo 100 caracteres'
                  }
                })}
                placeholder="Ex: Hambúrguers, Bebidas..."
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-black">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrição da categoria..."
                rows={3}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="tipo_fiscal_id" className="text-black">Tipo Fiscal</Label>
              <Select
                value={watch('tipo_fiscal_id') === '' ? 'nenhum' : watch('tipo_fiscal_id') || 'nenhum'}
                onValueChange={(value) => setValue('tipo_fiscal_id', value === 'nenhum' ? '' : value)}
              >
                <SelectTrigger className="bg-white border-gray-300 text-black focus:border-black focus:ring-black">
                  <SelectValue placeholder="Selecione um tipo fiscal (opcional)" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="nenhum" className="text-black hover:bg-gray-100 focus:bg-gray-100">
                    Nenhum tipo fiscal
                  </SelectItem>
                  {loadingTipos ? (
                    <SelectItem value="loading" disabled className="text-gray-500">
                      Carregando tipos fiscais...
                    </SelectItem>
                  ) : errorTipos ? (
                    <SelectItem value="error" disabled className="text-red-500">
                      Erro ao carregar tipos fiscais
                    </SelectItem>
                  ) : (
                    tiposFiscais
                      ?.filter(tipo => tipo.ativo)
                      ?.map((tipo) => (
                        <SelectItem 
                          key={tipo.id} 
                          value={tipo.id}
                          className="text-black hover:bg-gray-100 focus:bg-gray-100"
                        >
                          {tipo.nome}
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Tipo fiscal padrão que será aplicado aos produtos desta categoria
              </p>
            </div>

            <ImageUploader
              label="Imagem da Categoria"
              currentImageUrl={imageValue}
              onImageChange={(url) => setValue('image', url)}
              folder="cardapio/categorias"
              maxSize={5}
            />

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={isActive}
                onCheckedChange={(checked) => setValue('is_active', checked)}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
              <Label htmlFor="is_active" className="text-black">Categoria ativa</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-300 text-black hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || Object.keys(errors).length > 0}
              className="bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
