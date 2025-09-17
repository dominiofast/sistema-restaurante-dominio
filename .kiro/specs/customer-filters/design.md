# Design Document

## Overview

Esta funcionalidade adiciona um sistema de filtros avançados à página de clientes, permitindo filtrar por período de cadastro, status de atividade, período de nascimento, saldos negativos e quantidade de pedidos. O design segue o padrão da imagem de referência com campos organizados em uma seção de filtros acima da tabela.

## Architecture

### Current Architecture
- **Página Principal**: `src/pages/Clientes.tsx` - Gerencia estado e lógica principal
- **Busca Simples**: Componente `ClienteSearch` para busca por texto
- **Query Logic**: Função `buildBaseQuery()` aplica apenas filtros de busca

### New Architecture
- **Componente de Filtros**: Novo componente `ClienteFilters.tsx` para interface de filtros
- **Estado de Filtros**: Novo estado para gerenciar todos os filtros aplicados
- **Query Logic Expandida**: `buildBaseQuery()` modificada para aplicar múltiplos filtros
- **Integração**: Filtros integrados com busca existente e paginação

## Components and Interfaces

### New Components

#### 1. ClienteFilters.tsx
**Purpose:** Interface de filtros com layout similar à referência

**Props Interface:**
```typescript
interface ClienteFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

interface FilterState {
  // Período de cadastro
  cadastroDateFrom: string;
  cadastroDateTo: string;
  
  // Status de atividade (múltipla seleção)
  statusAtivos: boolean;
  statusInativos: boolean;
  statusPotenciais: boolean;
  
  // Período de nascimento
  nascimentoDateFrom: string;
  nascimentoDateTo: string;
  
  // Saldos negativos
  apenasNegativos: boolean;
  
  // Quantidade de pedidos
  pedidosRange: 'todos' | 'nenhum' | '1-5' | '5+';
}
```

**Layout Structure:**
```jsx
<div className="bg-gray-50 p-4 rounded-lg mb-6">
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    {/* Primeira linha */}
    <div>
      <label>Período de Cadastro</label>
      <div className="flex gap-2">
        <DatePicker placeholder="De" />
        <DatePicker placeholder="Até" />
      </div>
    </div>
    
    <div>
      <label>Status de Atividade</label>
      <div className="flex gap-2">
        <Badge variant="ativos">Ativos</Badge>
        <Badge variant="inativos">Inativos</Badge>
        <Badge variant="potenciais">Potenciais</Badge>
      </div>
    </div>
    
    <div>
      <label>Nascimento</label>
      <div className="flex gap-2">
        <DatePicker placeholder="De" />
        <DatePicker placeholder="Até" />
      </div>
    </div>
    
    <div>
      <label>Quantidade de Pedidos</label>
      <Select>
        <option value="todos">Todos</option>
        <option value="nenhum">Nenhum pedido</option>
        <option value="1-5">1-5 pedidos</option>
        <option value="5+">5+ pedidos</option>
      </Select>
    </div>
  </div>
  
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <Checkbox>Apenas saldos negativos</Checkbox>
    </div>
    <Button variant="outline" onClick={onClearFilters}>
      Limpar Filtros
    </Button>
  </div>
</div>
```

### Modified Components

#### 1. Clientes.tsx (Main Page)
**Changes Required:**
- Add filter state management
- Import and use ClienteFilters component
- Modify `buildBaseQuery()` to apply filters
- Update useEffect dependencies to include filters

**New State Variables:**
```typescript
const [filters, setFilters] = useState<FilterState>({
  cadastroDateFrom: '',
  cadastroDateTo: '',
  statusAtivos: false,
  statusInativos: false,
  statusPotenciais: false,
  nascimentoDateFrom: '',
  nascimentoDateTo: '',
  apenasNegativos: false,
  pedidosRange: 'todos'
});
```

**Modified buildBaseQuery:**
```typescript
const buildBaseQuery = (forCount = false) => {
  if (!currentCompany?.id) return null as any;
  let query = supabase
    .from('clientes')
    .select(forCount ? 'id' : '*', forCount ? { count: 'exact', head: true } : undefined)
    .eq('company_id', currentCompany.id);

  // Aplicar filtros de data de cadastro
  if (filters.cadastroDateFrom) {
    query = query.gte('data_cadastro', filters.cadastroDateFrom);
  }
  if (filters.cadastroDateTo) {
    query = query.lte('data_cadastro', filters.cadastroDateTo);
  }

  // Aplicar filtros de status de atividade
  const statusFilters = [];
  if (filters.statusAtivos) {
    statusFilters.push('(total_pedidos.gt.0,dias_sem_comprar.lte.30)');
  }
  if (filters.statusInativos) {
    statusFilters.push('(total_pedidos.gt.0,dias_sem_comprar.gt.30)');
  }
  if (filters.statusPotenciais) {
    statusFilters.push('(total_pedidos.eq.0,total_pedidos.is.null)');
  }
  if (statusFilters.length > 0) {
    query = query.or(statusFilters.join(','));
  }

  // Aplicar filtros de nascimento
  if (filters.nascimentoDateFrom) {
    query = query.gte('data_nascimento', filters.nascimentoDateFrom);
  }
  if (filters.nascimentoDateTo) {
    query = query.lte('data_nascimento', filters.nascimentoDateTo);
  }

  // Aplicar filtro de saldos negativos
  if (filters.apenasNegativos) {
    // Assumindo que existe uma coluna cashback_saldo
    query = query.lt('cashback_saldo', 0);
  }

  // Aplicar filtro de quantidade de pedidos
  if (filters.pedidosRange === 'nenhum') {
    query = query.or('total_pedidos.eq.0,total_pedidos.is.null');
  } else if (filters.pedidosRange === '1-5') {
    query = query.gte('total_pedidos', 1).lte('total_pedidos', 5);
  } else if (filters.pedidosRange === '5+') {
    query = query.gt('total_pedidos', 5);
  }

  // Aplicar filtro de busca por texto
  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim();
    query = query.or(`nome.ilike.%${term}%,email.ilike.%${term}%,telefone.ilike.%${term}%,documento.ilike.%${term}%`);
  }

  return query;
};
```

## Data Models

### Filter State Interface
```typescript
interface FilterState {
  cadastroDateFrom: string;
  cadastroDateTo: string;
  statusAtivos: boolean;
  statusInativos: boolean;
  statusPotenciais: boolean;
  nascimentoDateFrom: string;
  nascimentoDateTo: string;
  apenasNegativos: boolean;
  pedidosRange: 'todos' | 'nenhum' | '1-5' | '5+';
}
```

### Database Queries
**Filter Applications:**
1. **Date Filters**: Use `gte()` and `lte()` for date ranges
2. **Status Filters**: Complex OR conditions based on `total_pedidos` and `dias_sem_comprar`
3. **Checkbox Filters**: Simple boolean conditions
4. **Range Filters**: Combination of `gte()`, `lte()`, `gt()`, `lt()` conditions

## UI/UX Design

### Visual Design
- **Layout**: Grid layout similar to reference image
- **Styling**: Light gray background (`bg-gray-50`) for filter section
- **Spacing**: Consistent padding and margins
- **Responsive**: Responsive grid that adapts to screen size

### Interactive Elements
- **Date Pickers**: Native HTML5 date inputs with placeholder text
- **Status Badges**: Clickable badges that toggle on/off with visual feedback
- **Checkboxes**: Standard checkboxes with labels
- **Select Dropdowns**: Standard select elements
- **Clear Button**: Prominent button to reset all filters

### Status Badge Design
```css
.status-badge {
  @apply px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors;
}

.status-badge.ativos {
  @apply bg-green-100 text-green-800 border border-green-200;
}

.status-badge.ativos.active {
  @apply bg-green-500 text-white;
}

.status-badge.inativos {
  @apply bg-red-100 text-red-800 border border-red-200;
}

.status-badge.inativos.active {
  @apply bg-red-500 text-white;
}

.status-badge.potenciais {
  @apply bg-blue-100 text-blue-800 border border-blue-200;
}

.status-badge.potenciais.active {
  @apply bg-blue-500 text-white;
}
```

## Error Handling

### Validation
- **Date Validation**: Ensure "from" date is not after "to" date
- **Range Validation**: Validate date ranges are reasonable
- **Query Validation**: Handle invalid filter combinations gracefully

### Error States
- **Invalid Dates**: Show validation messages for invalid date inputs
- **Query Errors**: Handle database query errors gracefully
- **Loading States**: Show loading indicators during filter application

## Performance Considerations

### Optimization Strategies
1. **Debounced Updates**: Debounce filter changes to avoid excessive queries
2. **Query Optimization**: Ensure database indexes exist for filtered columns
3. **Pagination Reset**: Reset to page 1 when filters change
4. **Count Optimization**: Optimize count queries with filters applied

### Database Indexes
Recommended indexes for optimal performance:
- `data_cadastro` - for date range filters
- `data_nascimento` - for birth date filters
- `total_pedidos` - for order count filters
- `dias_sem_comprar` - for activity status filters
- `cashback_saldo` - for negative balance filters

## Testing Strategy

### Unit Tests
1. **Filter Component**: Test all filter interactions
2. **Query Building**: Test buildBaseQuery with various filter combinations
3. **State Management**: Test filter state updates
4. **Validation**: Test date and range validations

### Integration Tests
1. **Filter Application**: Test filters work with database queries
2. **Pagination Integration**: Test filters work with pagination
3. **Search Integration**: Test filters work with text search
4. **Performance**: Test query performance with filters

### User Acceptance Tests
1. **Filter Functionality**: Test all filter types work correctly
2. **Clear Filters**: Test clear functionality resets everything
3. **Responsive Design**: Test layout works on different screen sizes
4. **User Experience**: Test intuitive filter interactions