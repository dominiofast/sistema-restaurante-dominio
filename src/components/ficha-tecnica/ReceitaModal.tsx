import React, { useState, useEffect } from 'react';
import { X, Save, ChefHat, Clock, Users, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
// SUPABASE REMOVIDO
import { useAuth } from '@/contexts/AuthContext';

interface Receita {
  id?: string;
  nome: string;
  descricao?: string;
  categoria?: string;
  tempo_preparo?: number;
  rendimento?: number;
  unidade_rendimento?: string;
  modo_preparo?: string;
  observacoes?: string;
  custo_total?: number;
  preco_venda_sugerido?: number;
  margem_lucro?: number;
  is_active: boolean;


interface Ingrediente {
  id: string;
  tipo: 'ingrediente' | 'titulo';
  nome: string;
  custo_item?: number;
  medida?: string;
  quantidade?: number;
  custo_total?: number;


interface ReceitaModalProps {
  isOpen: boolean;
  onClose: () => void;
  receita?: Receita;
  onSave: () => void;


const CATEGORIAS_RECEITA = [
  'Pizzas Doces', 'Pizzas Salgadas', 'Massas', 'Molhos e Bases',
  'Saladas', 'Sobremesas', 'Bebidas', 'Antepastos', 'Pratos Principais',
  'Acompanhamentos', 'Temperos e Misturas', 'Outros';
];

const UNIDADES_RENDIMENTO = [
  'porções', 'unidades', 'kg', 'L', 'fatias', 'copos';
];

const ReceitaModal: React.FC<ReceitaModalProps> = ({
  isOpen,
  onClose,
  receita,
  onSave
}) => {
  const [formData, setFormData] = useState<Receita>({
    nome: '',
    descricao: '',
    categoria: '',
    tempo_preparo: 30,
    rendimento: 4,
    unidade_rendimento: 'porções',
    modo_preparo: '',
    observacoes: '',
    custo_total: 0,
    preco_venda_sugerido: 0,
    margem_lucro: 0,
    is_active: true
  })

  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [mercadorias, setMercadorias] = useState<any[]>([])
  const [loading, setSaving] = useState(false)
  const { toast } = useToast()
  const { user, currentCompany } = useAuth()

  useEffect(() => {
    if (receita) {
      setFormData(receita)
    } else {
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        tempo_preparo: 30,
        rendimento: 4,
        unidade_rendimento: 'porções',
        modo_preparo: '',
        observacoes: '',
        custo_total: 0,
        preco_venda_sugerido: 0,
        margem_lucro: 0,
        is_active: true
      })

    
    // Carregar mercadorias disponíveis
    if (isOpen) {
      fetchMercadorias()

  }, [receita, isOpen])

  const fetchMercadorias = async () => {
    try {
      const { data }  catch (error) { console.error('Error:', error) }= await (supabase as any)
        
        
        
        
        
      
      setMercadorias(data || [])
    } catch (error) {
      console.error('Erro ao carregar mercadorias:', error)

  };

  const adicionarIngrediente = () => {
    const novoIngrediente: Ingrediente = {
      id: Date.now().toString(),
      tipo: 'ingrediente',
      nome: '',
      custo_item: 0,
      medida: '',
      quantidade: 0,
      custo_total: 0;
    };
    setIngredientes([...ingredientes, novoIngrediente])
  };

  const adicionarTitulo = () => {
    const novoTitulo: Ingrediente = {
      id: Date.now().toString(),
      tipo: 'titulo',
      nome: '';
    };
    setIngredientes([...ingredientes, novoTitulo])
  };

  const removerIngrediente = (id: string) => {
    setIngredientes(ingredientes.filter(ing => ing.id !== id))
    recalcularCustoTotal()
  };

  const atualizarIngrediente = (id: string, campo: string, valor: any) => {
    setIngredientes(prev => prev.map(ing => {
      if (ing.id === id) {
        const atualizado = { ...ing, [campo]: valor };
        
        // Recalcular custo total do ingrediente
        if (campo === 'quantidade' || campo === 'custo_item') {
          atualizado.custo_total = (atualizado.quantidade || 0) * (atualizado.custo_item || 0)
        }
        
        return atualizado;
      }
      return ing;
    }))
    
    // Recalcular custo total da receita
    setTimeout(recalcularCustoTotal, 100)
  };

  const recalcularCustoTotal = () => {
    const custoTotal = ingredientes
      .filter(ing => ing.tipo === 'ingrediente')
      .reduce((sum, ing) => sum + (ing.custo_total || 0), 0)
    
    setFormData(prev => ({ ...prev, custo_total: custoTotal }))
  };

  const calcularMargem = () => {
    if (formData.custo_total && formData.preco_venda_sugerido && formData.custo_total > 0) {
      const margem = ((formData.preco_venda_sugerido - formData.custo_total) / formData.custo_total * 100)
      setFormData({ ...formData, margem_lucro: margem })

  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome da receita é obrigatório',
        variant: 'destructive';
      })
      return;


    if (!user) {
      toast({
        title: 'Erro',
        description: 'Usuário não autenticado',
        variant: 'destructive'
      })
      return;


    const companyId = currentCompany?.id;
    if (!companyId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma empresa primeiro',
        variant: 'destructive'
      })
      return;


    setSaving(true)

    try {
      let margem = 0;
      if (formData.custo_total && formData.preco_venda_sugerido && formData.custo_total > 0) {
        margem = ((formData.preco_venda_sugerido - formData.custo_total) / formData.custo_total * 100)
      }

       catch (error) { console.error('Error:', error) }const dataToSave = {
        ...formData,
        company_id: companyId,
        margem_lucro: margem,
        updated_by: user.id,
        ...(receita ? {} : { created_by: user.id })
      };

      if (receita?.id) {
        const { error } = await (supabase as any)
          
          
          

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Receita atualizada com sucesso!'
        })
      } else {
        const { error } = await (supabase as any)
          
          

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Receita criada com sucesso!'
        })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar receita:', error)
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar receita',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)

  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL';
    }).format(value)
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ChefHat className="h-6 w-6" />
            {receita ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="nome">Nome da Receita *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Ex: Pizza Margherita"
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
                  {CATEGORIAS_RECEITA.map(categoria => (
                    <SelectItem key={categoria} value={categoria}>
                      {categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="tempo_preparo" className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Tempo (min)
                </Label>
                <Input
                  id="tempo_preparo"
                  type="number"
                  min="1"
                  value={formData.tempo_preparo || ''}
                  onChange={(e) => setFormData({ ...formData, tempo_preparo: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                  className="h-10"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="rendimento" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Rendimento
                </Label>
                <Input
                  id="rendimento"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.rendimento || ''}
                  onChange={(e) => setFormData({ ...formData, rendimento: parseFloat(e.target.value) || 0 })}
                  placeholder="4"
                  className="h-10"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="unidade_rendimento">Unidade</Label>
                <Select
                  value={formData.unidade_rendimento}
                  onValueChange={(value) => setFormData({ ...formData, unidade_rendimento: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UNIDADES_RENDIMENTO.map(unidade => (
                      <SelectItem key={unidade} value={unidade}>
                        {unidade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Descrição da receita..."
              rows={2}
            />
          </div>

          {/* COMPOSIÇÃO - Como na imagem */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Composição</h3>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={adicionarIngrediente}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar ingrediente
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={adicionarTitulo}
                  className="text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar título
                </Button>
              </div>
            </div>

            {/* Tabela de Ingredientes */}
            {ingredientes.length > 0 && (
              <div className="bg-white rounded-lg overflow-hidden border">
                {/* Header */}
                <div className="bg-gray-100 px-4 py-3 border-b">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                    <div className="col-span-1">Tipo</div>
                    <div className="col-span-3">Nome</div>
                    <div className="col-span-2">Custo do item</div>
                    <div className="col-span-2">Medida</div>
                    <div className="col-span-2">Quant. líquida</div>
                    <div className="col-span-1">Custo total</div>
                    <div className="col-span-1">Ações</div>
                  </div>
                </div>

                {/* Linhas */}
                <div className="divide-y">
                  {ingredientes.map((ingrediente, index) => (
                    <div key={ingrediente.id} className="px-4 py-3">
                      {ingrediente.tipo === 'titulo' ? (
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-1">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              Título
                            </Badge>
                          </div>
                          <div className="col-span-10">
                            <Input
                              value={ingrediente.nome}
                              onChange={(e) => atualizarIngrediente(ingrediente.id, 'nome', e.target.value)}
                              placeholder="Digite o título da seção..."
                              className="font-medium bg-blue-50 border-blue-200"
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerIngrediente(ingrediente.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-4 items-center text-sm">
                          <div className="col-span-1">
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                              Ingrediente
                            </Badge>
                          </div>
                          <div className="col-span-3">
                            <Select
                              value={ingrediente.nome}
                              onValueChange={(value) => {
                                const mercadoria = mercadorias.find(m => m.nome === value)
                                atualizarIngrediente(ingrediente.id, 'nome', value)
                                if (mercadoria) {
                                  atualizarIngrediente(ingrediente.id, 'custo_item', mercadoria.preco_unitario)
                                  atualizarIngrediente(ingrediente.id, 'medida', mercadoria.unidade_medida)
                                }
                              }}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Selecionar mercadoria" />
                              </SelectTrigger>
                              <SelectContent>
                                {mercadorias.map(mercadoria => (
                                  <SelectItem key={mercadoria.id} value={mercadoria.nome}>
                                    {mercadoria.nome} - {formatCurrency(mercadoria.preco_unitario || 0)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={ingrediente.custo_item || ''}
                              onChange={(e) => atualizarIngrediente(ingrediente.id, 'custo_item', parseFloat(e.target.value) || 0)}
                              placeholder="0,00"
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              value={ingrediente.medida || ''}
                              onChange={(e) => atualizarIngrediente(ingrediente.id, 'medida', e.target.value)}
                              placeholder="Un"
                              className="h-8"
                              readOnly
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={ingrediente.quantidade || ''}
                              onChange={(e) => atualizarIngrediente(ingrediente.id, 'quantidade', parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-1">
                            <div className="font-medium text-green-600">
                              {formatCurrency(ingrediente.custo_total || 0)}
                            </div>
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removerIngrediente(ingrediente.id)}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Rendimento Final */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold flex items-center gap-2">
                  <span>📊</span>
                  Rendimento final
                </h4>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-gray-600">Custo total: </span>
                  <span className="font-bold text-green-600 text-lg">{formatCurrency(formData.custo_total || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Custo por Unidade: </span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency((formData.custo_total || 0) / (formData.rendimento || 1))}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Quant. líquida total: </span>
                  <span className="font-bold text-blue-600">
                    {ingredientes
                      .filter(ing => ing.tipo === 'ingrediente')
                      .reduce((sum, ing) => sum + (ing.quantidade || 0), 0)
                      .toFixed(3)}kg
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" 
                    step="0.1"
                    value={formData.rendimento || ''}
                    onChange={(e) => setFormData({ ...formData, rendimento: parseFloat(e.target.value) || 0 })}
                    className="w-20 h-8"
                  />
                  <Select
                    value={formData.unidade_rendimento}
                    onValueChange={(value) => setFormData({ ...formData, unidade_rendimento: value })}
                  >
                    <SelectTrigger className="w-24 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_RENDIMENTO.map(unidade => (
                        <SelectItem key={unidade} value={unidade}>
                          {unidade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" size="sm" variant="outline">
                    Atualizar
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Custos e Preços */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="custo_total">Custo Total (R$)</Label>
              <Input
                id="custo_total"
                type="number"
                step="0.01"
                min="0"
                value={formData.custo_total || ''}
                onChange={(e) => {
                  const newCusto = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, custo_total: newCusto })
                }}
                onBlur={calcularMargem}
                placeholder="0,00"
                className="h-10"
                readOnly
              />
            </div>

            <div>
              <Label htmlFor="preco_venda_sugerido">Preço de Venda (R$)</Label>
              <Input
                id="preco_venda_sugerido"
                type="number"
                step="0.01"
                min="0"
                value={formData.preco_venda_sugerido || ''}
                onChange={(e) => {
                  const newPreco = parseFloat(e.target.value) || 0;
                  setFormData({ ...formData, preco_venda_sugerido: newPreco })
                }}
                onBlur={calcularMargem}
                placeholder="0,00"
                className="h-10"
              />
            </div>

            <div>
              <Label htmlFor="margem_lucro">Margem de Lucro (%)</Label>
              <Input
                id="margem_lucro"
                type="number"
                step="0.1"
                value={formData.margem_lucro?.toFixed(1) || '0.0'}
                readOnly
                className="bg-gray-50 h-10"
              />
            </div>
          </div>

          {/* Modo de Preparo */}
          <div>
            <Label htmlFor="modo_preparo">Modo de Preparo</Label>
            <Textarea
              id="modo_preparo"
              value={formData.modo_preparo}
              onChange={(e) => setFormData({ ...formData, modo_preparo: e.target.value })}
              placeholder="Descreva o passo a passo do preparo..."
              rows={4}
            />
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais, dicas, variações..."
              rows={2}
            />
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
  )
};

export default ReceitaModal; 
