import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight,
  Plus, 
  X, 
  GripVertical,
  Pencil,
  Check
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CategoriaAdicional, Adicional, ProdutoCategoriaAdicional } from '@/types/cardapio';
import { AdicionalCard } from './AdicionalCard';

// Componente sortable importado do arquivo original
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableAdicionalProps {
  adicional: Adicional;
  children: React.ReactNode;
}

const SortableAdicional: React.FC<SortableAdicionalProps> = ({ adicional, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: adicional.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'z-10' : ''}`}
    >
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: { ...attributes, ...listeners },
        isDragging
      })}
    </div>
  )
};

interface CategoriaAdicionalCardProps {
  categoria: CategoriaAdicional | undefined;
  associacao: ProdutoCategoriaAdicional | undefined;
  adicionaisCategoria: Adicional[];
  estaEditando: boolean;
  dragHandleProps?: any;
  isDragging?: boolean;
  onEditarCategoria: (categoria: CategoriaAdicional) => void;
  onDesassociar: (associacaoId: string) => void;
  onIniciarCriacaoAdicional: (categoriaId: string) => void;
  criandoAdicional: string | null;
  novoAdicional: {
    name: string;
    description: string;
    price: number;
    is_available: boolean;
  };
  setNovoAdicional: any;
  handleCriarAdicional: (categoriaId: string) => void;
  handleCancelarEdicao: () => void;
  loading: boolean;
  categoriaEditada: Partial<CategoriaAdicional & { associacao_id?: string }>;
  setCategoriaEditada: any;
  handleSalvarEdicaoCategoria: () => void;
  gruposExpandidos: { [categoriaId: string]: boolean };
  setGruposExpandidos: any;
  editandoAdicional: string | null;
  adicionalEditado: any;
  setAdicionalEditado: any;
  handleSaveAdicional: () => void;
  setEditandoAdicional: any;
  handleEditAdicional: (adicional: Adicional) => void;
  handleDeleteAdicional: (adicionalId: string) => void;
  handleImageUpload: (file: File, adicionalId: string) => void;
  onToggleAdicionalStatus: (adicionalId: string, isActive: boolean) => void;
  sensors: any;
  handleDragEndAdicionais: (event: DragEndEvent, categoriaId: string) => void;
}

export const CategoriaAdicionalCard: React.FC<CategoriaAdicionalCardProps> = ({
  categoria,
  associacao,
  adicionaisCategoria,
  estaEditando,
  dragHandleProps,
  isDragging,
  onEditarCategoria,
  onDesassociar,
  onIniciarCriacaoAdicional,
  criandoAdicional,
  novoAdicional,
  setNovoAdicional,
  handleCriarAdicional,
  handleCancelarEdicao,
  loading,
  categoriaEditada,
  setCategoriaEditada,
  handleSalvarEdicaoCategoria,
  gruposExpandidos,
  setGruposExpandidos,
  editandoAdicional,
  adicionalEditado,
  setAdicionalEditado,
  handleSaveAdicional,
  setEditandoAdicional,
  handleEditAdicional,
  handleDeleteAdicional,
  handleImageUpload,
  onToggleAdicionalStatus,
  sensors,
  handleDragEndAdicionais
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white shadow-sm transition-all">
      <Collapsible
        open={gruposExpandidos[categoria?.id || ''] !== false}
        onOpenChange={(open) => setGruposExpandidos((prev: any) => ({
          ...prev,
          [categoria?.id || '']: open
        }))}
      >
        {/* Header do grupo */}
        <CollapsibleTrigger asChild>
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 rounded-t-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3 flex-1">
                <div 
                  className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab hover:cursor-grabbing"
                  onClick={(e) => e.stopPropagation()}
                  {...dragHandleProps}
                >
                  <GripVertical className="h-4 w-4" />
                </div>
                <div className="mt-1 text-gray-600">
                  {gruposExpandidos[categoria?.id || ''] !== false ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  {estaEditando ? (
                    <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Nome do Grupo</Label>
                        <Input
                          value={categoriaEditada.name || ''}
                          onChange={(e) => setCategoriaEditada((prev: any) => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                          placeholder="Nome do grupo"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                        <Input
                          value={categoriaEditada.description || ''}
                          onChange={(e) => setCategoriaEditada((prev: any) => ({ ...prev, description: e.target.value }))}
                          className="mt-1"
                          placeholder="Descrição do grupo (opcional)"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={categoriaEditada.is_required || false}
                            onCheckedChange={(checked) => setCategoriaEditada((prev: any) => ({ ...prev, is_required: checked }))}
                          />
                          <Label className="text-sm font-medium text-gray-700">Obrigatório</Label>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Mín. Seleções</Label>
                          <Input
                            type="number"
                            min="0"
                            value={categoriaEditada.min_selection || 0}
                            onChange={(e) => setCategoriaEditada((prev: any) => ({ ...prev, min_selection: parseInt(e.target.value) || 0 }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Máx. Seleções</Label>
                          <Input
                            type="number"
                            min="1"
                            value={categoriaEditada.max_selection || 1}
                            onChange={(e) => setCategoriaEditada((prev: any) => ({ ...prev, max_selection: parseInt(e.target.value) || 1 }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={handleSalvarEdicaoCategoria}
                          disabled={loading || !categoriaEditada.name}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelarEdicao}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-gray-900 text-lg">{categoria?.name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          associacao?.is_required 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {associacao?.is_required ? 'Obrigatório' : 'Opcional'}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {associacao?.max_selection === 1 ? 'Única escolha' : 
                           associacao && associacao.max_selection > 1 ? 'Múltipla escolha' : 'Por quantidade'}
                        </span>
                      </div>
                      {categoria?.description && (
                        <p className="text-gray-600 text-sm mt-1">{categoria.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                        <span>Mín: {associacao?.min_selection || 0}</span>
                        <span>Máx: {associacao?.max_selection || 1}</span>
                        <span>{adicionaisCategoria.length} opção(ões)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onIniciarCriacaoAdicional(categoria?.id || '')}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  disabled={estaEditando || criandoAdicional === categoria?.id}
                  title="Adicionar novo item"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditarCategoria(categoria!)}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  disabled={estaEditando || criandoAdicional === categoria?.id}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDesassociar(associacao?.id || '')}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  disabled={estaEditando || criandoAdicional === categoria?.id}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        {/* Conteúdo do grupo (adicionais) */}
        <CollapsibleContent>
          <div className="p-6">
            {/* Formulário para criar novo adicional */}
            {criandoAdicional === categoria?.id && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-3">Criar Nova Opção</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Nome</Label>
                    <Input
                      value={novoAdicional.name}
                      onChange={(e) => setNovoAdicional((prev: any) => ({ ...prev, name: e.target.value }))}
                      placeholder="Nome da opção"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Preço (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={novoAdicional.price}
                      onChange={(e) => setNovoAdicional((prev: any) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                      placeholder="0,00"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">Descrição</Label>
                    <Input
                      value={novoAdicional.description}
                      onChange={(e) => setNovoAdicional((prev: any) => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição da opção (opcional)"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => handleCriarAdicional(categoria?.id || '')}
                    disabled={loading || !novoAdicional.name.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Criar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelarEdicao}
                    disabled={loading}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {adicionaisCategoria.length === 0 && criandoAdicional !== categoria?.id ? (
              <div className="text-center py-8 text-gray-500">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>Nenhuma opção neste grupo</p>
                <p className="text-sm">Clique no botão "+" acima para adicionar</p>
              </div>
            ) : adicionaisCategoria.length > 0 ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(event) => handleDragEndAdicionais(event, categoria?.id || '')}
              >
                <SortableContext 
                  items={adicionaisCategoria.map(a => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {adicionaisCategoria.map((adicional) => (
                      <SortableAdicional key={adicional.id} adicional={adicional}>
                        <AdicionalCard 
                          adicional={adicional}
                          editandoAdicional={editandoAdicional}
                          adicionalEditado={adicionalEditado}
                          setAdicionalEditado={setAdicionalEditado}
                          handleSaveAdicional={handleSaveAdicional}
                          setEditandoAdicional={setEditandoAdicional}
                          handleEditAdicional={handleEditAdicional}
                          handleDeleteAdicional={handleDeleteAdicional}
                          handleImageUpload={handleImageUpload}
                          onToggleStatus={onToggleAdicionalStatus}
                          loading={loading}
                        />
                      </SortableAdicional>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
};
