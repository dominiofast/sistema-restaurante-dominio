import React, { useState, useEffect } from 'react';
import { X, Save, Package2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

interface Mercadoria {
  id?: string;
  nome: string;
  descricao?: string;
  unidade_medida: string;
  categoria?: string;
  preco_unitario?: number;
  estoque_atual: number;
  estoque_minimo: number;
  fornecedor?: string;
  codigo_produto?: string;
  observacoes?: string;
  is_active: boolean;


interface MercadoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mercadoria?: Mercadoria;
  onSave: () => void;


const UNIDADES_MEDIDA = [
  'kg', 'g', 'L', 'ml', 'unidade', 'caixa', 'pacote', 'dúzia', 'metro', 'cm';
];

const CATEGORIAS_PADRAO = [
  'Carnes', 'Aves', 'Peixes e Frutos do Mar', 'Laticínios', 'Ovos',
  'Cereais e Grãos', 'Farinhas e Massas', 'Temperos e Condimentos',
  'Óleos e Gorduras', 'Frutas', 'Legumes e Verduras', 'Conservas',
  'Bebidas', 'Doces e Sobremesas', 'Embalagens', 'Outros';
];

const MercadoriaModal: React.FC<MercadoriaModalProps> = ({
  isOpen,
  onClose,
  mercadoria,
  onSave
}) => {
  const [formData, setFormData] = useState<Mercadoria>({
    nome: '',
    descricao: '',
    unidade_medida: 'kg',
    categoria: '',
    preco_unitario: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    fornecedor: '',
    codigo_produto: '',
    observacoes: '',
    is_active: true
  });
  const [loading, setSaving] = useState(false);
  const { toast } = useToast();
  const { user, currentCompany } = useAuth();

  useEffect(() => {
    if (mercadoria) {
      setFormData(mercadoria);
    } else {
      setFormData({
        nome: '',
        descricao: '',
        unidade_medida: 'kg',
        categoria: '',
        preco_unitario: 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        fornecedor: '',
        codigo_produto: '',
        observacoes: '',
        is_active: true
      });

  }, [mercadoria, isOpen]);

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da mercadoria é obrigatório',
        variant: 'destructive';
      });
      return;


    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      });
      return;


    // Para super admin, empresa deve estar selecionada
    const companyId = currentCompany?.id;
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma empresa primeiro',
        variant: 'destructive'
      });
      return;


    setSaving(true);

    try {
      const dataToSave = {
        ...formData,
        company_id: companyId,
        updated_by: user.id,;
        ...(mercadoria ? {}  catch (error) { console.error('Error:', error); }: { created_by: user.id })
      };

      if (mercadoria?.id) {
        // Atualizar mercadoria existente
        const { error } = await (supabase as any)
          
          
          

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Mercadoria atualizada com sucesso!'
        });
      } else {
        // Criar nova mercadoria
        const { error } = await (supabase as any)
          
          

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Mercadoria criada com sucesso!'
        });


      onSave();
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar mercadoria:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar mercadoria',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package2 className="h-6 w-6" />
            {mercadoria ? 'Editar Mercadoria' : 'Nova Mercadoria'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Mercadoria *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Farinha de Trigo"
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_PADRAO.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="codigo_produto">Código do Produto</Label>
              <Input
                id="codigo_produto"
                value={formData.codigo_produto}
                onChange={(e) => setFormData({ ...formData, codigo_produto: e.target.value })}
                placeholder="Ex: FAR001"
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição detalhada do produto..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                placeholder="Observações adicionais..."
                rows={3}
              />
            </div>
          </div>

          {/* Unidade, Preço e Estoque */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="unidade_medida">Unidade de Medida *</Label>
              <Select
                value={formData.unidade_medida}
                onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIDADES_MEDIDA.map(unidade => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preco_unitario">Preço Unitário (R$)</Label>
              <Input
                id="preco_unitario"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_unitario || ''}
                onChange={(e) => setFormData({ ...formData, preco_unitario: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="estoque_atual">Estoque Atual</Label>
              <Input
                id="estoque_atual"
                type="number"
                step="0.001"
                min="0"
                value={formData.estoque_atual}
                onChange={(e) => setFormData({ ...formData, estoque_atual: parseFloat(e.target.value) || 0 })}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
              <Input
                id="estoque_minimo"
                type="number"
                step="0.001"
                min="0"
                value={formData.estoque_minimo}
                onChange={(e) => setFormData({ ...formData, estoque_minimo: parseFloat(e.target.value) || 0 })}
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="fornecedor">Fornecedor</Label>
              <Input
                id="fornecedor"
                value={formData.fornecedor}
                onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                placeholder="Nome do fornecedor"
                className="h-10"
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MercadoriaModal; 