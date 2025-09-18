import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
// Função para fazer requests à API PostgreSQL
async function apiRequest(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  return response.json();
}
import { Produto, CategoriaAdicional, Adicional, ProdutoCategoriaAdicional } from '@/types/cardapio';
import { useCardapio } from '@/hooks/useCardapio';
import { useAdicionaisCRUD } from '@/hooks/useAdicionaisCRUD';
import { useCategoriaAdicionaisCRUD } from '@/hooks/useCategoriaAdicionaisCRUD';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  ChevronDown, 
  ChevronRight,
  Plus, 
  X, 
  GripVertical,
  Pencil,
  ImageIcon,
  Upload,
  Check,
  Edit2,
  Trash2
} from 'lucide-react';
import { CategoriaAdicionalCard } from './CategoriaAdicionalCard';
import { AdicionalCard } from './AdicionalCard';

// Componente sortable para categorias
interface SortableCategoriaProps {
  categoria: CategoriaAdicional | undefined;
  children: React.ReactNode;
  dragHandleProps?: any;
  isDragging?: boolean;
}

const SortableCategoria: React.FC<SortableCategoriaProps> = ({ categoria, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: categoria?.id || '' });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 rounded-lg bg-white shadow-sm transition-all ${
        isDragging ? 'shadow-lg border-blue-500 rotate-2' : ''
      }`}
    >
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: { ...attributes, ...listeners },
        isDragging
      })}
    </div>
  );
};

// Componente sortable para adicionais
interface SortableAdicionalProps {
  adicional: Adicional;
  children: React.ReactNode;
  dragHandleProps?: any;
  isDragging?: boolean;
}

const SortableAdicional: React.FC<SortableAdicionalProps> = ({ adicional, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: adicional.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-gray-200 rounded-lg p-3 transition-all ${
        isDragging ? 'shadow-lg border-blue-500 rotate-1' : 'hover:border-gray-300'
      }`}
    >
      {React.cloneElement(children as React.ReactElement, {
        dragHandleProps: { ...attributes, ...listeners },
        isDragging
      })}
    </div>
  );
};

interface GruposAssociadosTabProps {
  produto: Produto;
  categoriasAdicionais: CategoriaAdicional[];
  adicionais: Adicional[];
  produtoCategoriasAdicionais: ProdutoCategoriaAdicional[];
  onRefresh: () => void;
}


export const GruposAssociadosTab: React.FC<GruposAssociadosTabProps> = ({
  produto,
  categoriasAdicionais,
  adicionais: adicionaisProp,
  produtoCategoriasAdicionais,
  onRefresh
}) => {
  const { toast } = useToast();
  const { reorderAdicionais, adicionais: adicionaisHook } = useCardapio();
  
  // Estado local para adicionais com updates otimistas
  const [adicionaisLocal, setAdicionaisLocal] = useState<Adicional[]>(adicionaisHook);
  
  // Sincronizar estado local com hook quando há mudanças externas
  useEffect(() => {
    setAdicionaisLocal(adicionaisHook);
  }, [adicionaisHook]);
  
  // Usar hooks CRUD extraídos
  const adicionaisCRUD = useAdicionaisCRUD();
  const categoriasCRUD = useCategoriaAdicionaisCRUD();
  
  // Estado para controlar grupos expandidos/recolhidos
  const [gruposExpandidos, setGruposExpandidos] = useState<{ [categoriaId: string]: boolean }>({});

  // Configuração dos sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handlers para drag and drop
  const handleDragEndCategorias = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const oldIndex = categoriasAssociadasLocal.findIndex(cat => cat?.id === active.id);
    const newIndex = categoriasAssociadasLocal.findIndex(cat => cat?.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      console.log('🔄 Reordenando categorias associadas:', { oldIndex, newIndex });
      
      // 1. Atualizar estado local IMEDIATAMENTE para feedback visual
      const newOrder = Array.from(categoriasAssociadasLocal);
      const [removed] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, removed);
      setCategoriasAssociadasLocal(newOrder);
      
      try {
        
        // 2. Persistir nova ordem no banco de dados
        const updates = newOrder.map((categoria, index) => {
          const associacao = produtoCategoriasAdicionais.find(
            pca => pca.categoria_adicional_id === categoria?.id
          );
          return {
            id: associacao?.id,
            order_position: index + 1
          };
        }).filter(update => update.id);

        // Atualizar as posições no banco usando atualizações individuais
        for (const update of updates) {
          await apiRequest(`/api/produto-categorias-adicionais/${update.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ order_position: update.order_position })
          });
        }

        toast({
          title: "Reordenação salva",
          description: `Categoria movida da posição ${oldIndex + 1} para ${newIndex + 1}`,
        });
        
        // 3. Atualizar dados do componente pai
        onRefresh();
        
      } catch (error) {
        console.error('Erro ao reordenar categorias associadas:', error);
        // 4. Em caso de erro, reverter o estado local
        setCategoriasAssociadasLocal(categoriasAssociadasLocal);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a reordenação das categorias",
          variant: "destructive",
        });
      } finally {
        // Usar loading dos hooks CRUD se necessário
      }
    }
  };

  const handleDragEndAdicionais = async (event: DragEndEvent, categoriaId: string) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) return;

    const adicionaisCategoria = adicionaisPorCategoria(categoriaId);
    const oldIndex = adicionaisCategoria.findIndex(adicional => adicional.id === active.id);
    const newIndex = adicionaisCategoria.findIndex(adicional => adicional.id === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      console.log('🎯 Reordenando adicionais:', { oldIndex, newIndex, categoriaId });
      
      try {
        await reorderAdicionais(oldIndex, newIndex, categoriaId);
        toast({
          title: "Reordenação",
          description: `Adicional reordenado com sucesso!`,
        });
      } catch (error) {
        console.error('Erro ao reordenar adicionais:', error);
        toast({
          title: "Erro",
          description: "Não foi possível reordenar o adicional",
          variant: "destructive",
        });
      }
    }
  };

  // Usar funções dos hooks CRUD  
  const handleEditarCategoria = (categoria: CategoriaAdicional) => {
    categoriasCRUD.handleEditarCategoria(categoria, produtoCategoriasAdicionais);
  };

  const handleSalvarEdicaoCategoria = async () => {
    const success = await categoriasCRUD.handleSalvarEdicaoCategoria();
    if (success) {
      onRefresh();
    }
  };

  const desassociarCategoriaAdicional = async (associacaoId: string) => {
    const success = await categoriasCRUD.desassociarCategoriaAdicional(associacaoId);
    if (success) {
      onRefresh();
    }
  };

  const handleCancelarEdicao = () => {
    categoriasCRUD.handleCancelarEdicao();
    adicionaisCRUD.handleCancelarEdicao();
  };

  const handleCriarAdicional = async (categoriaId: string) => {
    const success = await adicionaisCRUD.handleCriarAdicional(categoriaId);
    if (success) {
      onRefresh();
    }
  };

  const handleSaveAdicional = async () => {
    const success = await adicionaisCRUD.handleSaveAdicional();
    if (success) {
      onRefresh();
    }
  };

  const handleDeleteAdicional = async (adicionalId: string) => {
    const success = await adicionaisCRUD.handleDeleteAdicional(adicionalId);
    if (success) {
      onRefresh();
    }
  };

  const handleImageUpload = async (file: File, adicionalId: string) => {
    const success = await adicionaisCRUD.handleImageUpload(file, adicionalId);
    if (success) {
      onRefresh();
    }
  };

  const handleToggleAdicionalStatus = async (adicionalId: string, isActive: boolean) => {
    try {
      // Optimistic update - atualizar estado local imediatamente
      setAdicionaisLocal(prev => 
        prev.map(adicional => 
          adicional.id === adicionalId 
            ? { ...adicional, is_active: isActive }
            : adicional
        )
      );

      await apiRequest(`/api/adicionais/${adicionalId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive })
      });

      toast({
        title: "Status alterado",
        description: `Adicional ${isActive ? 'ativado' : 'desativado'} com sucesso!`,
      });

    } catch (error) {
      console.error('Erro ao alterar status do adicional:', error);
      
      // Reverter optimistic update em caso de erro
      setAdicionaisLocal(prev => 
        prev.map(adicional => 
          adicional.id === adicionalId 
            ? { ...adicional, is_active: !isActive }
            : adicional
        )
      );
      
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do adicional",
        variant: "destructive",
      });
    }
  };

  // Estado local para os grupos associados para permitir reordenação em tempo real
  const [categoriasAssociadasLocal, setCategoriasAssociadasLocal] = useState(() => {
    return produtoCategoriasAdicionais.map(pca => 
      categoriasAdicionais.find(ca => ca.id === pca.categoria_adicional_id)
    ).filter(Boolean);
  });

  // Atualizar estado local quando as props mudarem
  useEffect(() => {
    const novasCategorias = produtoCategoriasAdicionais.map(pca => 
      categoriasAdicionais.find(ca => ca.id === pca.categoria_adicional_id)
    ).filter(Boolean);
    setCategoriasAssociadasLocal(novasCategorias);
  }, [produtoCategoriasAdicionais, categoriasAdicionais]);

  const adicionaisPorCategoria = useMemo(() => {
    return (categoriaId: string) => {
      // Usar o estado local em vez do hook para ter as atualizações em tempo real
      const adicionaisExistentes = adicionaisLocal.filter(a => a.categoria_adicional_id === categoriaId);
      return adicionaisExistentes.sort((a, b) => {
        const aOrder = a.order_position ?? 999;
        const bOrder = b.order_position ?? 999;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.name.localeCompare(b.name);
      });
    };
  }, [adicionaisLocal]); // Usar o estado local como dependência

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Grupos de Opções Associados</h3>
        <div className="text-sm text-gray-500">
          {categoriasAssociadasLocal.length} grupo(s) associado(s)
        </div>
      </div>
      
      {categoriasAssociadasLocal.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-2">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 font-medium">Nenhum grupo de opções associado</p>
          <p className="text-gray-500 text-sm mt-1">Adicione grupos de opções para personalizar este produto</p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEndCategorias}
        >
          <SortableContext 
            items={categoriasAssociadasLocal.map(c => c?.id || '')}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {categoriasAssociadasLocal.map((categoria, index) => {
                const associacao = produtoCategoriasAdicionais.find(
                  pca => pca.categoria_adicional_id === categoria?.id
                );
                const adicionaisCategoria = adicionaisPorCategoria(categoria?.id || '');
                const estaEditando = categoriasCRUD.editandoCategoria === categoria?.id;

                return (
                  <SortableCategoria 
                    key={categoria?.id} 
                    categoria={categoria}
                  >
                     <CategoriaAdicionalCard
                      categoria={categoria}
                      associacao={associacao}
                      adicionaisCategoria={adicionaisCategoria}
                      estaEditando={estaEditando}
                      onEditarCategoria={handleEditarCategoria}
                      onDesassociar={desassociarCategoriaAdicional}
                      onIniciarCriacaoAdicional={adicionaisCRUD.handleIniciarCriacaoAdicional}
                      criandoAdicional={adicionaisCRUD.criandoAdicional}
                      novoAdicional={adicionaisCRUD.novoAdicional}
                      setNovoAdicional={adicionaisCRUD.setNovoAdicional}
                      handleCriarAdicional={handleCriarAdicional}
                      handleCancelarEdicao={handleCancelarEdicao}
                      loading={adicionaisCRUD.loading || categoriasCRUD.loading}
                      categoriaEditada={categoriasCRUD.categoriaEditada}
                      setCategoriaEditada={categoriasCRUD.setCategoriaEditada}
                      handleSalvarEdicaoCategoria={handleSalvarEdicaoCategoria}
                      gruposExpandidos={gruposExpandidos}
                      setGruposExpandidos={setGruposExpandidos}
                      editandoAdicional={adicionaisCRUD.editandoAdicional}
                      adicionalEditado={adicionaisCRUD.adicionalEditado}
                      setAdicionalEditado={adicionaisCRUD.setAdicionalEditado}
                      handleSaveAdicional={handleSaveAdicional}
                      setEditandoAdicional={adicionaisCRUD.setEditandoAdicional}
                      handleEditAdicional={adicionaisCRUD.handleEditAdicional}
                      handleDeleteAdicional={handleDeleteAdicional}
                      handleImageUpload={handleImageUpload}
                      onToggleAdicionalStatus={handleToggleAdicionalStatus}
                      sensors={sensors}
                      handleDragEndAdicionais={handleDragEndAdicionais}
                    />
                  </SortableCategoria>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};