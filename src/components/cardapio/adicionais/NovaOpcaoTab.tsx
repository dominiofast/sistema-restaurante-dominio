
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Check, Upload, ImageIcon, X } from 'lucide-react';
import { CategoriaAdicional } from '@/types/cardapio';
// Função para fazer requests à API PostgreSQL
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },;
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()

import { useToast } from '@/hooks/use-toast';
import { useCardapio } from '@/hooks/useCardapio';

interface Adicional {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoria_adicional_id: string;
  is_available: boolean;
  image?: string;


interface NovaOpcaoTabProps {
  categoriasAdicionais: CategoriaAdicional[];
  onRefresh?: () => void;


export const NovaOpcaoTab: React.FC<NovaOpcaoTabProps> = ({
  categoriasAdicionais,
  onRefresh
}) => {
  const { toast } = useToast()
  const { fetchAdicionais } = useCardapio()
  const [loading, setLoading] = useState(false)
  const [adicionaisCriados, setAdicionaisCriados] = useState<Adicional[]>([])
  const [novoAdicional, setNovoAdicional] = useState({
    name: '',
    description: '',
    price: 0,
    categoria_adicional_id: '',
    is_available: true
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageUpload = (file: File) => {
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    };
    reader.readAsDataURL(file)
  };

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
  };

  const handleCreateAdicional = async () => {
    if (!novoAdicional.name || !novoAdicional.categoria_adicional_id) return;

    try {
      setLoading(true)
      
      let imageUrl = null;
      
      // Upload da imagem se existir (implementação simplificada por enquanto)
      if (imageFile) {
        // TODO: Implementar upload de imagens para PostgreSQL
        // Por enquanto, não fazemos upload da imagem
        imageUrl = null;
      }

       catch (error) { console.error('Error:', error) }const data = await apiRequest('/api/adicionais', {
        method: 'POST',
        body: JSON.stringify({ ...novoAdicional, image: imageUrl })
      })

      // Adicionar o novo adicional à lista local
      if (data && data.length > 0) {
        setAdicionaisCriados(prev => [...prev, data[0]])
      }

      // Atualizar o estado global dos adicionais
      await fetchAdicionais()
      
      // Atualizar também o componente pai (AdicionaisModal) 
      onRefresh?.()

      toast({
        title: "Sucesso",
        description: "Adicional criado com sucesso!",
      })

      // Manter o grupo selecionado e limpar apenas os outros campos
      setNovoAdicional(prev => ({
        name: '',
        description: '',
        price: 0,
        categoria_adicional_id: prev.categoria_adicional_id,
        is_available: true
      }))
      clearImage()
    } catch (error) {
      console.error('Erro ao criar adicional:', error)
      toast({
        title: "Erro",
        description: "Erro ao criar adicional",
        variant: "destructive",
      })
    } finally {
      setLoading(false)

  };

  const getCategoriaNome = (categoriaId: string) => {
    return categoriasAdicionais.find(cat => cat.id === categoriaId)?.name || 'Categoria';
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Criar Nova Opção</h3>
      
      {/* Lista de adicionais criados */}
      {adicionaisCriados.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Opções Criadas</h4>
          {adicionaisCriados.map((adicional, index) => (
            <div key={adicional.id} className="bg-green-50 border border-green-200 rounded-md p-2">
              <div className="flex items-center gap-2">
                <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                {adicional.image && (
                  <div className="w-8 h-8 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={adicional.image} 
                      alt={adicional.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-green-800 text-sm truncate">{adicional.name}</p>
                  <p className="text-xs text-green-600">
                    {getCategoriaNome(adicional.categoria_adicional_id)} • R$ {adicional.price.toFixed(2)}
                    {adicional.description && ` • ${adicional.description}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Formulário para nova opção */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 space-y-3">
        <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
          {adicionaisCriados.length > 0 ? 'Adicionar Outra Opção' : 'Nova Opção'}
        </h4>
        
        <div>
          <Label className="text-xs font-medium text-gray-600">Grupo de Opções *</Label>
          <Select
            value={novoAdicional.categoria_adicional_id}
            onValueChange={(value) => setNovoAdicional(prev => ({ ...prev, categoria_adicional_id: value }))}
          >
            <SelectTrigger className="mt-1 h-8">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {categoriasAdicionais.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs font-medium text-gray-600">Nome da Opção *</Label>
            <Input
              value={novoAdicional.name}
              onChange={(e) => setNovoAdicional(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ex: Ketchup, Coca-Cola, Bacon Extra"
              className="mt-1 h-8 text-sm"
            />
          </div>
          
          <div>
            <Label className="text-xs font-medium text-gray-600">Preço</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={novoAdicional.price}
              onChange={(e) => setNovoAdicional(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
              className="mt-1 h-8 text-sm"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-medium text-gray-600">Descrição</Label>
          <Input
            value={novoAdicional.description}
            onChange={(e) => setNovoAdicional(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição opcional da opção"
            className="mt-1 h-8 text-sm"
          />
        </div>

        {/* Upload de Imagem */}
        <div>
          <Label className="text-xs font-medium text-gray-600">Imagem da Opção</Label>
          <div className="mt-1 flex items-center gap-3">
            {/* Preview da imagem */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            
            {/* Controles de upload */}
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Label htmlFor="image-upload" className="cursor-pointer">
                  <Button type="button" size="sm" variant="outline" className="h-7 text-xs">
                    <Upload className="h-3 w-3 mr-1" />
                    Escolher Imagem
                  </Button>
                </Label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleImageUpload(file)
                    }
                  }}
                />
                {imagePreview && (
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    onClick={clearImage}
                    className="h-7 text-xs text-red-600 hover:text-red-700"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Remover
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Recomendado: imagem quadrada, máximo 2MB
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              checked={novoAdicional.is_available}
              onCheckedChange={(checked) => setNovoAdicional(prev => ({ ...prev, is_available: checked }))}
            />
            <Label className="text-xs text-gray-600">Disponível</Label>
          </div>

          <Button 
            onClick={handleCreateAdicional} 
            disabled={loading || !novoAdicional.name || !novoAdicional.categoria_adicional_id}
            className="h-7 px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {adicionaisCriados.length > 0 ? 'Adicionar Outra Opção' : 'Criar Opção'}
          </Button>
        </div>
      </div>
    </div>
  )
};
