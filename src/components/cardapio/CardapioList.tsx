import React, { useState } from 'react';
import { Edit, Trash2, Settings, Copy, Plus, Search, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusToggle } from './StatusToggle';
import { Categoria, Produto } from '@/types/cardapio';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CardapioListProps {
  categorias: Categoria[];
  produtos: Produto[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateCategoria: () => void;
  onCreateProduto: () => void;
  onEditCategoria: (categoria: Categoria) => void;
  onEditProduto: (produto: Produto) => void;
  onDeleteCategoria: (id: string) => void;
  onDeleteProduto: (id: string) => void;
  onCloneProduto: (produto: Produto) => void;
  onManageAdicionais: (produto: Produto) => void;
  onToggleCategoriaStatus: (id: string, isActive: boolean) => void;
  onToggleProdutoStatus: (id: string, isAvailable: boolean) => void;
  onReorderCategorias: (startIndex: number, endIndex: number) => void;
  onReorderProdutos: (startIndex: number, endIndex: number, categoriaId: string) => void;
  loading?: boolean;


interface SortableItemProps {
  id: string;
  children: React.ReactNode;


const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50 z-50' : ''}
    >
      <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        {children}
      </div>
    </div>
  )
};

export const CardapioList: React.FC<CardapioListProps> = ({
  categorias,
  produtos,
  searchTerm,
  onSearchChange,
  onCreateCategoria,
  onCreateProduto,
  onEditCategoria,
  onEditProduto,
  onDeleteCategoria,
  onDeleteProduto,
  onCloneProduto,
  onManageAdicionais,
  onToggleCategoriaStatus,
  onToggleProdutoStatus,
  onReorderCategorias,
  onReorderProdutos,
  loading = false
}) => {
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null)

    if (!over) return;

    if (active.id !== over.id) {
      const activeItem = findItemById(active.id as string)
      const overItem = findItemById(over.id as string)

      if (activeItem?.type === 'categoria' && overItem?.type === 'categoria') {
        const oldIndex = categorias.findIndex(c => c.id === active.id)
        const newIndex = categorias.findIndex(c => c.id === over.id)
        onReorderCategorias(oldIndex, newIndex)
      } else if (activeItem?.type === 'produto' && overItem?.type === 'produto') {
        if (activeItem.categoriaId === overItem.categoriaId) {
          const produtosDaCategoria = produtos.filter(p => p.categoria_id === activeItem.categoriaId)
          const oldIndex = produtosDaCategoria.findIndex(p => p.id === active.id)
          const newIndex = produtosDaCategoria.findIndex(p => p.id === over.id)
          onReorderProdutos(oldIndex, newIndex, activeItem.categoriaId!)
        }
      }

  };

  const findItemById = (id: string) => {
    const categoria = categorias.find(c => c.id === id)
    if (categoria) return { type: 'categoria' as const, data: categoria };

    const produto = produtos.find(p => p.id === id)
    if (produto) return { type: 'produto' as const, data: produto, categoriaId: produto.categoria_id };

    return null;
  };

  const filteredCategorias = categorias.filter(categoria =>
    categoria.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredProdutos = produtos.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoriaProdutos = (categoriaId: string) => {
    return filteredProdutos.filter(produto => produto.categoria_id === categoriaId)
  };

  // Selecionar primeira categoria se nenhuma estiver selecionada
  React.useEffect(() => {
    if (!selectedCategoria && categorias.length > 0) {
      setSelectedCategoria(categorias[0].id)

  }, [categorias, selectedCategoria])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Painel de Categorias */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categorias</h2>
          <Button
            onClick={onCreateCategoria}
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Input
              placeholder="Pesquisar categoria..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            <SortableContext
              items={filteredCategorias.map(c => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredCategorias.map((categoria) => (
                <div key={categoria.id} className="p-3 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab hover:cursor-grabbing" />
                    
                    <div
                      className={`flex-1 cursor-pointer flex items-center justify-between ${
                        selectedCategoria === categoria.id ? 'text-primary font-medium' : ''
                      }`}
                      onClick={() => setSelectedCategoria(categoria.id)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{categoria.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {getCategoriaProdutos(categoria.id).length} produto{getCategoriaProdutos(categoria.id).length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <StatusToggle
                          isActive={categoria.is_active}
                          onToggle={(isActive) => onToggleCategoriaStatus(categoria.id, isActive)}
                          size="sm"
                          showLabel={true}
                        />
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onEditCategoria(categoria)
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteCategoria(categoria.id)
                            }}
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </SortableContext>
          </div>

          <DragOverlay>
            {activeDragId ? (
              <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <div className="font-medium">
                  {findItemById(activeDragId)?.data?.name || 'Item'}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Painel de Produtos */}
      <div className="lg:col-span-2 bg-card border border-border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">
              {categorias.find(c => c.id === selectedCategoria)?.name || 'Produtos'}
            </h2>
            <div className="text-sm text-muted-foreground">
              {selectedCategoria ? getCategoriaProdutos(selectedCategoria).length : filteredProdutos.length} produto{(selectedCategoria ? getCategoriaProdutos(selectedCategoria).length : filteredProdutos.length) !== 1 ? 's' : ''}
            </div>
          </div>
          <Button onClick={onCreateProduto} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="space-y-3 max-h-[65vh] overflow-y-auto">
          {selectedCategoria ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={getCategoriaProdutos(selectedCategoria).map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {getCategoriaProdutos(selectedCategoria).map((produto) => (
                  <SortableItem key={produto.id} id={produto.id}>
                    <div className="w-12 h-12 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                      {produto.image ? (
                        <img
                          src={produto.image}
                          alt={produto.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <span className="text-sm">🍽️</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm truncate">{produto.name}</h3>
                          {produto.description && (
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {produto.description}
                            </p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            {produto.is_promotional && produto.promotional_price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground line-through">
                                  R$ {produto.price.toFixed(2)}
                                </span>
                                <span className="font-semibold text-red-600 text-sm">
                                  R$ {produto.promotional_price.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="font-semibold text-sm">
                                R$ {produto.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-4">
                          <div className="text-xs text-muted-foreground">Status:</div>
                          <StatusToggle
                            isActive={produto.is_available}
                            onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                            size="sm"
                            showLabel={true}
                          />
                          
                          <div className="text-xs text-muted-foreground">Delivery:</div>
                          <StatusToggle
                            isActive={produto.is_available}
                            onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                            size="sm"
                            showLabel={false}
                          />
                          
                          <div className="text-xs text-muted-foreground">Salão:</div>
                          <StatusToggle
                            isActive={produto.is_available}
                            onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                            size="sm"
                            showLabel={false}
                          />

                          <div className="flex gap-1 opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditProduto(produto)}
                              className="h-7 w-7 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onCloneProduto(produto)}
                              className="h-7 w-7 p-0 text-primary hover:text-primary"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onManageAdicionais(produto)}
                              className="h-7 w-7 p-0"
                            >
                              <Settings className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteProduto(produto.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SortableItem>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6" />
              </div>
              <p className="text-sm">Selecione uma categoria para ver os produtos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
};
