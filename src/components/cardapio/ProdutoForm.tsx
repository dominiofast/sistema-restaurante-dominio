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
import { Produto, Categoria } from '@/types/cardapio';
import { GerarDescricaoButton } from './GerarDescricaoButton';
import { useTiposFiscais } from '@/hooks/useTiposFiscais';

interface ProdutoFormProps {
  produto?: Produto | null;
  categorias: Categoria[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  name: string;
  description: string;
  price: number;
  promotional_price: number;
  is_promotional: boolean;
  image: string;
  categoria_id: string;
  is_available: boolean;
  destaque: boolean;
  preparation_time: number;
  ingredients: string;
  tipo_fiscal_id: string;
}

export const ProdutoForm: React.FC<ProdutoFormProps> = ({
  produto,
  categorias,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const { tiposFiscais, loading: loadingTipos, error: errorTipos } = useTiposFiscais();
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: produto?.name || '',
      description: produto?.description || '',
      price: produto?.price || 0,
      promotional_price: produto?.promotional_price || 0,
      is_promotional: produto?.is_promotional || false,
      image: produto?.image || '',
      categoria_id: produto?.categoria_id || '',
      is_available: produto?.is_available ?? true,
      destaque: produto?.destaque ?? false,
      preparation_time: produto?.preparation_time || 0,
      ingredients: produto?.ingredients || '',
      tipo_fiscal_id: produto?.tipo_fiscal_id || '',
    },
  });

  React.useEffect(() => {
    if (produto) {
      reset({
        name: produto.name,
        description: produto.description || '',
        price: produto.price,
        promotional_price: produto.promotional_price || 0,
        is_promotional: produto.is_promotional || false,
        image: produto.image || '',
        categoria_id: produto.categoria_id || '',
        is_available: produto.is_available,
        destaque: produto.destaque || false,
        preparation_time: produto.preparation_time || 0,
        ingredients: produto.ingredients || '',
        tipo_fiscal_id: produto.tipo_fiscal_id || '',
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        promotional_price: 0,
        is_promotional: false,
        image: '',
        categoria_id: '',
        is_available: true,
        destaque: false,
        preparation_time: 0,
        ingredients: '',
        tipo_fiscal_id: '',
      });

  }, [produto, reset]);

  const handleFormSubmit = async (data: FormData) => {
    try {;
      console.log('🔍 ProdutoForm: handleFormSubmit iniciado');
      console.log('🔍 ProdutoForm: Dados recebidos do formulário:', data);
      
      // Validação básica
      if (!data.name || data.name.trim() === '') {
        console.error('❌ ProdutoForm: Nome é obrigatório');
        alert('Nome do produto é obrigatório');
        return;
      }
      
       catch (error) { console.error('Error:', error); }if (!data.categoria_id || data.categoria_id === '') {
        console.error('❌ ProdutoForm: Categoria é obrigatória');
        alert('Categoria é obrigatória');
        return;
      }
      
      if (!data.price && data.price !== 0) {
        console.error('❌ ProdutoForm: Preço é obrigatório');
        alert('Preço é obrigatório');
        return;
      }
      
      // Converter strings vazias para null para campos UUID
      const cleanedData = {
        ...data,
        categoria_id: data.categoria_id === '' ? null : data.categoria_id,
        tipo_fiscal_id: data.tipo_fiscal_id === '' ? null : data.tipo_fiscal_id,;
      };
      
      console.log('🔍 ProdutoForm: Dados limpos:', cleanedData);
      console.log('🔍 ProdutoForm: Chaves dos dados:', Object.keys(cleanedData));
      
      console.log('🔍 ProdutoForm: Chamando onSubmit...');
      await onSubmit(cleanedData);
      
      console.log('✅ ProdutoForm: onSubmit concluído com sucesso');
      onClose();
    } catch (error) {
      console.error('❌ ProdutoForm: Erro em handleFormSubmit:', error);
      alert(`Erro ao salvar produto: ${error?.message || error}`);

  };

  const isAvailable = watch('is_available');
  const destaque = watch('destaque');
  const isPromotional = watch('is_promotional');
  const imageValue = watch('image');

  // Formulário sempre renderiza, sem loading bloqueante

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle className="text-black">
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="name" className="text-black">Nome do Produto *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Nome é obrigatório' })}
                placeholder="Ex: Hambúrguer Bacon"
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description" className="text-black flex items-center gap-2">
                Descrição
                <GerarDescricaoButton
                  nomeProduto={watch('name')}
                  onResult={(desc) => setValue('description', desc)}
                />
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrição detalhada do produto..."
                rows={3}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
            </div>

            <div>
              <Label htmlFor="price" className="text-black">Preço Normal *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                {...register('price', { 
                  required: 'Preço é obrigatório',
                  min: { value: 0, message: 'Preço deve ser maior ou igual a zero' }
                })}
                placeholder="0.00"
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
              {errors.price && (
                <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="preparation_time" className="text-black">Tempo de Preparo (min)</Label>
              <Input
                id="preparation_time"
                type="number"
                min="0"
                {...register('preparation_time')}
                placeholder="15"
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_promotional"
                checked={isPromotional}
                onCheckedChange={(checked) => setValue('is_promotional', checked)}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
              <Label htmlFor="is_promotional" className="text-black">Produto em promoção</Label>
            </div>

            {isPromotional && (
              <div>
                <Label htmlFor="promotional_price" className="text-black">Preço Promocional *</Label>
                <Input
                  id="promotional_price"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('promotional_price', { 
                    required: isPromotional ? 'Preço promocional é obrigatório quando produto está em promoção' : false,
                    min: { value: 0, message: 'Preço promocional deve ser maior ou igual a zero' }
                  })}
                  placeholder="0.00"
                  className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
                />
                {errors.promotional_price && (
                  <p className="text-sm text-red-600 mt-1">{errors.promotional_price.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="categoria_id" className="text-black">Categoria *</Label>
              <Select
                value={watch('categoria_id')}
                onValueChange={(value) => setValue('categoria_id', value)}
              >
                <SelectTrigger className="bg-white border-gray-300 text-black focus:border-black focus:ring-black">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {categorias
                    .filter(cat => cat.is_active)
                    .map((categoria) => (
                    <SelectItem 
                      key={categoria.id} 
                      value={categoria.id}
                      className="text-black hover:bg-gray-100 focus:bg-gray-100"
                    >
                      {categoria.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!watch('categoria_id') && (
                <p className="text-sm text-red-600 mt-1">Categoria é obrigatória</p>
              )}
            </div>

            <div>
              <Label htmlFor="tipo_fiscal_id" className="text-black">Tipo Fiscal</Label>
              <Select
                value={watch('tipo_fiscal_id') === '' ? 'nenhum' : watch('tipo_fiscal_id') || 'nenhum'}
                onValueChange={(value) => setValue('tipo_fiscal_id', value === 'nenhum' ? '' : value)}
              >
                <SelectTrigger className="bg-white border-gray-300 text-black focus:border-black focus:ring-black">
                  <SelectValue placeholder="Usar tipo fiscal da categoria ou selecionar específico" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="nenhum" className="text-black hover:bg-gray-100 focus:bg-gray-100">
                    Usar tipo fiscal da categoria
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
                Se não selecionado, usará o tipo fiscal configurado na categoria
              </p>
            </div>

            <div className="md:col-span-2">
              <ImageUploader
                label="Imagem do Produto"
                currentImageUrl={imageValue}
                onImageChange={(url) => setValue('image', url)}
                folder="cardapio/produtos"
                maxSize={5}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="ingredients" className="text-black">Ingredientes/Observações</Label>
              <Textarea
                id="ingredients"
                {...register('ingredients')}
                placeholder="Lista de ingredientes ou observações especiais..."
                rows={2}
                className="bg-white border-gray-300 text-black placeholder:text-gray-500 focus:border-black focus:ring-black"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={isAvailable}
                onCheckedChange={(checked) => setValue('is_available', checked)}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
              <Label htmlFor="is_available" className="text-black">Produto disponível</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="destaque"
                checked={destaque}
                onCheckedChange={(checked) => setValue('destaque', checked)}
                className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
              />
              <Label htmlFor="destaque" className="text-black">Produto em destaque</Label>
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
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
