# Design Document

## Overview

O gestor de cardápio apresenta dois problemas críticos relacionados ao gerenciamento de estado e sincronização de dados:

1. **Instabilidade de posicionamento de categorias**: Durante operações de edição/adição de adicionais, as categorias de adicionais mudam de posição inesperadamente
2. **Falta de atualização em tempo real**: Adicionais recém-criados não aparecem imediatamente na interface, exigindo refresh manual

A solução envolve otimizar o gerenciamento de estado, implementar atualizações otimistas e melhorar a sincronização de dados entre componentes.

## Architecture

### Componentes Principais Afetados

1. **GestorCardapio.tsx** - Componente principal que gerencia o estado global
2. **AdicionaisModal.tsx** - Modal que gerencia adicionais de produtos
3. **GruposAssociadosTab.tsx** - Tab que exibe e permite reordenar categorias de adicionais
4. **NovoGrupoTab.tsx** - Tab para criar novos grupos de adicionais
5. **NovaOpcaoTab.tsx** - Tab para criar novas opções de adicionais
6. **useCardapio.ts** - Hook principal que gerencia estado e operações CRUD

### Fluxo de Dados Atual (Problemático)

```
AdicionaisModal
├── fetchProdutoCategoriasAdicionais() (local)
├── GruposAssociadosTab
│   ├── Estado local: categoriasAssociadasLocal
│   └── Reordenação via drag-and-drop
├── NovoGrupoTab
│   ├── Cria categoria + associa ao produto
│   └── Chama onRefresh() → fetchProdutoCategoriasAdicionais()
└── NovaOpcaoTab
    ├── Cria adicional
    ├── Chama fetchAdicionais() (global)
    └── Chama onRefresh() → fetchProdutoCategoriasAdicionais()
```

### Problemas Identificados

1. **Estado Fragmentado**: Múltiplos estados locais não sincronizados
2. **Refetch Desnecessário**: Cada operação dispara múltiplos refetches
3. **Falta de Otimismo**: Interface não atualiza até confirmação do servidor
4. **Race Conditions**: Operações simultâneas podem causar inconsistências

## Components and Interfaces

### 1. Estado Centralizado Melhorado

```typescript
interface AdicionaisState {
  // Estado das categorias associadas ao produto
  produtoCategoriasAdicionais: ProdutoCategoriaAdicional[];
  
  // Estados de loading específicos
  loadingStates: {
    fetchingAssociations: boolean;
    creatingGroup: boolean;
    creatingOption: boolean;
    reordering: boolean;
  };
  
  // Cache de operações otimistas
  optimisticUpdates: {
    newGroups: CategoriaAdicional[];
    newOptions: Adicional[];
    reorderedCategories: string[];
  };
}
```

### 2. Hook de Gerenciamento de Adicionais

```typescript
interface UseAdicionaisManager {
  // Estado
  state: AdicionaisState;
  
  // Operações otimistas
  createGroupOptimistic: (group: Omit<CategoriaAdicional, 'id'>) => Promise<void>;
  createOptionOptimistic: (option: Omit<Adicional, 'id'>) => Promise<void>;
  reorderCategoriesOptimistic: (oldIndex: number, newIndex: number) => Promise<void>;
  
  // Sincronização
  syncWithServer: () => Promise<void>;
  rollbackOptimisticUpdate: (updateId: string) => void;
}
```

### 3. Componente de Estado Otimista

```typescript
interface OptimisticStateManager<T> {
  // Estado atual (servidor + otimista)
  currentState: T[];
  
  // Operações pendentes
  pendingOperations: OptimisticOperation<T>[];
  
  // Métodos
  addOptimistic: (item: T, operation: 'create' | 'update' | 'delete') => string;
  confirmOptimistic: (operationId: string, serverData?: T) => void;
  rollbackOptimistic: (operationId: string) => void;
  syncWithServer: (serverData: T[]) => void;
}
```

## Data Models

### Estado Otimista

```typescript
interface OptimisticOperation<T> {
  id: string;
  type: 'create' | 'update' | 'delete' | 'reorder';
  data: T;
  originalData?: T; // Para rollback
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}
```

### Contexto de Adicionais

```typescript
interface AdicionaisContext {
  // Estado atual
  produtoCategoriasAdicionais: ProdutoCategoriaAdicional[];
  categoriasAdicionais: CategoriaAdicional[];
  adicionais: Adicional[];
  
  // Estados de loading
  isLoading: boolean;
  loadingOperations: Set<string>;
  
  // Operações
  createGroup: (group: CreateCategoriaAdicionalData) => Promise<CategoriaAdicional>;
  createOption: (option: CreateAdicionalData) => Promise<Adicional>;
  reorderCategories: (productId: string, oldIndex: number, newIndex: number) => Promise<void>;
  
  // Sincronização
  refreshData: () => Promise<void>;
  subscribeToChanges: (productId: string) => () => void;
}
```

## Error Handling

### 1. Estratégia de Rollback

```typescript
class OptimisticUpdateManager {
  private rollbackStrategies = {
    create: (operation: OptimisticOperation) => {
      // Remove item otimista da lista
      this.removeFromState(operation.data.id);
    },
    
    update: (operation: OptimisticOperation) => {
      // Restaura dados originais
      this.updateState(operation.data.id, operation.originalData);
    },
    
    reorder: (operation: OptimisticOperation) => {
      // Restaura ordem original
      this.restoreOriginalOrder(operation.originalData);
    }
  };
}
```

### 2. Tratamento de Conflitos

```typescript
interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'merge' | 'prompt-user';
  resolver?: (serverData: any, clientData: any) => any;
}
```

### 3. Estados de Erro

```typescript
interface ErrorState {
  type: 'network' | 'validation' | 'conflict' | 'permission';
  message: string;
  operation: OptimisticOperation;
  retryable: boolean;
  retryCount: number;
}
```

## Testing Strategy

### 1. Testes de Estado Otimista

```typescript
describe('OptimisticStateManager', () => {
  test('should add optimistic update immediately', () => {
    // Testa se a interface atualiza imediatamente
  });
  
  test('should rollback on server error', () => {
    // Testa rollback quando servidor rejeita
  });
  
  test('should handle concurrent operations', () => {
    // Testa operações simultâneas
  });
});
```

### 2. Testes de Sincronização

```typescript
describe('Data Synchronization', () => {
  test('should maintain category order during operations', () => {
    // Testa se ordem das categorias é preservada
  });
  
  test('should show new items immediately', () => {
    // Testa se novos itens aparecem na interface
  });
  
  test('should handle network failures gracefully', () => {
    // Testa comportamento offline/erro de rede
  });
});
```

### 3. Testes de Integração

```typescript
describe('AdicionaisModal Integration', () => {
  test('should maintain state consistency across tabs', () => {
    // Testa consistência entre abas do modal
  });
  
  test('should update global state after operations', () => {
    // Testa se estado global é atualizado
  });
});
```

### 4. Testes de Performance

```typescript
describe('Performance Tests', () => {
  test('should handle large lists efficiently', () => {
    // Testa performance com muitos itens
  });
  
  test('should debounce rapid operations', () => {
    // Testa debounce de operações rápidas
  });
});
```

## Implementation Approach

### Fase 1: Refatoração do Estado
- Centralizar estado de adicionais em contexto dedicado
- Implementar gerenciador de estado otimista
- Criar hooks especializados para operações

### Fase 2: Otimização de Interface
- Implementar atualizações otimistas na UI
- Adicionar loading states específicos
- Melhorar feedback visual para operações

### Fase 3: Sincronização Robusta
- Implementar estratégias de rollback
- Adicionar tratamento de conflitos
- Criar sistema de retry automático

### Fase 4: Testes e Validação
- Testes unitários para cada componente
- Testes de integração para fluxos completos
- Testes de performance e stress

## Technical Decisions

### 1. Estado Otimista vs Server-First
**Decisão**: Implementar estado otimista para melhor UX
**Razão**: Usuários precisam de feedback imediato, especialmente em operações frequentes

### 2. Contexto vs Props Drilling
**Decisão**: Usar contexto React para estado de adicionais
**Razão**: Evita props drilling e centraliza lógica complexa

### 3. Rollback Automático vs Manual
**Decisão**: Rollback automático com opção manual
**Razão**: Melhor UX com fallback para casos complexos

### 4. Debounce vs Throttle
**Decisão**: Debounce para operações de reordenação
**Razão**: Evita múltiplas chamadas durante drag-and-drop

## Performance Considerations

### 1. Memoização
- Memoizar listas de categorias e adicionais
- Usar React.memo para componentes de lista
- Implementar shouldComponentUpdate customizado

### 2. Virtualização
- Considerar virtualização para listas grandes
- Implementar lazy loading se necessário

### 3. Otimização de Queries
- Batch updates para operações múltiplas
- Usar transactions para operações relacionadas
- Implementar cache inteligente

### 4. Bundle Size
- Code splitting para modal de adicionais
- Lazy loading de componentes pesados
- Tree shaking de dependências não utilizadas