import React, { useState } from 'react';
import { Edit, Trash2, Copy, Settings, Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusToggle } from './StatusToggle';
import { Categoria, Produto } from '@/types/cardapio';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface CardapioTableProps {
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


interface SortableRowProps {
  id: string;
  type: 'categoria' | 'produto';
  categoriaId?: string;
  children: React.ReactNode;


const SortableRow: React.FC<SortableRowProps> = ({ id, children }) => {
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
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-50' : ''}
    >
      <TableCell className="p-2 w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </TableCell>
      {children}
    </TableRow>
  )
};

export const CardapioTable: React.FC<CardapioTableProps> = ({
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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [activeDragId, setActiveDragId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const toggleCategory = (categoriaId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoriaId)) {
      newExpanded
    } else {
      newExpanded.add(categoriaId)
    }
    setExpandedCategories(newExpanded)
  };

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

  const getCategoriaName = (categoriaId?: string) => {
    if (!categoriaId) return 'Sem categoria';
    const categoria = categorias.find(c => c.id === categoriaId)
    return categoria?.name || 'Categoria não encontrada';
  };

  return (
    <div className="space-y-4">
      {/* Header com busca e botões */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar categorias e produtos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={onCreateCategoria} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </Button>
          <Button onClick={onCreateProduto} size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      {/* Tabela */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-8"></TableHead>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="w-32">Status</TableHead>
              <TableHead className="w-24">Delivery</TableHead>
              <TableHead className="w-24">Salão</TableHead>
              <TableHead className="w-32">Preço</TableHead>
              <TableHead className="w-40">Ações</TableHead>
            </TableRow>
          </TableHeader>
        </Table>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableBody>
                <SortableContext
                  items={[...filteredCategorias.map(c => c.id), ...filteredProdutos.map(p => p.id)]}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredCategorias.map((categoria) => {
                    const categoriaProducts = getCategoriaProdutos(categoria.id)
                    const isExpanded = expandedCategories.has(categoria.id)

                    return (
                      <React.Fragment key={categoria.id}>
                        {/* Linha da Categoria */}
                        <SortableRow id={categoria.id} type="categoria">
                          <TableCell className="p-2 w-8">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCategory(categoria.id)}
                              className="h-6 w-6 p-0"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {categoria.image ? (
                                <img
                                  src={categoria.image}
                                  alt={categoria.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-xs">📁</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <div>
                              <div className="font-medium">{categoria.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {categoriaProducts.length} produto{categoriaProducts.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="p-2">
                            <StatusToggle
                              isActive={categoria.is_active}
                              onToggle={(isActive) => onToggleCategoriaStatus(categoria.id, isActive)}
                              size="sm"
                              showLabel={true}
                            />
                          </TableCell>
                          <TableCell className="p-2">
                            <span className="text-xs text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell className="p-2">
                            <span className="text-xs text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell className="p-2">
                            <span className="text-xs text-muted-foreground">-</span>
                          </TableCell>
                          <TableCell className="p-2">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditCategoria(categoria)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteCategoria(categoria.id)}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </SortableRow>

                        {/* Produtos da Categoria (quando expandida) */}
                        {isExpanded && categoriaProducts.map((produto) => (
                          <SortableRow key={produto.id} id={produto.id} type="produto" categoriaId={categoria.id}>
                            <TableCell className="p-2"></TableCell>
                            <TableCell className="p-2 pl-8">
                              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                                {produto.image ? (
                                  <img
                                    src={produto.image}
                                    alt={produto.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs">🍽️</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div>
                                <div className="font-medium text-sm">{produto.name}</div>
                                {produto.description && (
                                  <div className="text-xs text-muted-foreground truncate max-w-xs">
                                    {produto.description}
                                  </div>
                                )}
                                <div className="flex gap-1 mt-1">
                                  {produto.is_promotional && (
                                    <Badge variant="destructive" className="text-[10px] px-1 py-0">
                                      Promoção
                                    </Badge>
                                  )}
                                  {produto.destaque && (
                                    <Badge variant="secondary" className="text-[10px] px-1 py-0">
                                      Destaque
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <StatusToggle
                                isActive={produto.is_available}
                                onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                                size="sm"
                                showLabel={true}
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <StatusToggle
                                isActive={produto.is_available}
                                onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                                size="sm"
                                showLabel={false}
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <StatusToggle
                                isActive={produto.is_available}
                                onToggle={(isAvailable) => onToggleProdutoStatus(produto.id, isAvailable)}
                                size="sm"
                                showLabel={false}
                              />
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="text-sm">
                                {produto.is_promotional && produto.promotional_price ? (
                                  <div>
                                    <div className="text-red-600 font-medium">
                                      R$ {produto.promotional_price.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground line-through">
                                      R$ {produto.price.toFixed(2)}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="font-medium">
                                    R$ {produto.price.toFixed(2)}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="flex gap-1">
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
                            </TableCell>
                          </SortableRow>
                        ))}
                      </React.Fragment>
                    )
                  })}
                </SortableContext>
              </TableBody>
            </Table>
          </div>

          <DragOverlay>
            {activeDragId ? (
              <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                <div className="font-medium">
                  {findItemById(activeDragId)?.data?.name || 'Item'}
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
};
