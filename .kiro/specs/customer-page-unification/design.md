# Design Document

## Overview

Esta funcionalidade visa simplificar a interface da página de clientes removendo a separação por abas e unificando todos os clientes em uma única visualização. A mudança principal envolve a remoção do componente `ClienteTabs` e a modificação da lógica de filtragem para mostrar todos os clientes independente do status.

## Architecture

### Current Architecture
- **Página Principal**: `src/pages/Clientes.tsx` - Gerencia estado e lógica principal
- **Componente de Abas**: `src/components/clientes/ClienteTabs.tsx` - Controla filtros por status
- **Lógica de Filtragem**: Baseada no estado `aba` que pode ser 'ativos', 'inativos' ou 'potencial'
- **Consultas ao Banco**: Função `buildBaseQuery()` aplica filtros baseados na aba selecionada

### New Architecture
- **Página Principal**: Modificada para remover dependência de abas
- **Componente de Abas**: Removido completamente
- **Lógica de Filtragem**: Simplificada para mostrar todos os clientes
- **Consultas ao Banco**: Função `buildBaseQuery()` modificada para não aplicar filtros de status

## Components and Interfaces

### Modified Components

#### 1. Clientes.tsx (Main Page)
**Changes Required:**
- Remove `aba` state and related logic
- Remove `AbaType` type definition
- Modify `buildBaseQuery()` to not filter by status
- Update title from "Meus Clientes" to "Cadastro do Cliente"
- Remove `ClienteTabs` component usage
- Simplify `fetchCounts()` to only get total count
- Remove tab-specific counting logic

**Key Modifications:**
```typescript
// Remove these state variables
const [aba, setAba] = useState<AbaType>('ativos');

// Modify title
<h1 className="text-3xl font-bold text-gray-900">Cadastro do Cliente ({counts.total})</h1>

// Remove ClienteTabs component
// <ClienteTabs ... />

// Simplify buildBaseQuery
const buildBaseQuery = (forCount = false) => {
  if (!currentCompany?.id) return null as any;
  let query = supabase
    .from('clientes')
    .select(forCount ? 'id' : '*', forCount ? { count: 'exact', head: true } : undefined)
    .eq('company_id', currentCompany.id);

  // Remove status filtering logic
  // Only keep search filtering
  if (searchQuery && searchQuery.trim()) {
    const term = searchQuery.trim();
    query = query.or(`nome.ilike.%${term}%,email.ilike.%${term}%,telefone.ilike.%${term}%,documento.ilike.%${term}%`);
  }
  return query;
};
```

#### 2. ClienteTabs.tsx
**Action:** Remove this component entirely as it's no longer needed.

### Interfaces

#### Updated Cliente Interface
No changes required to the Cliente interface - it remains the same.

#### Updated Counts Interface
Simplify to only track total count:
```typescript
const [counts, setCounts] = useState({ total: 0 });
```

## Data Models

### Database Queries
The main change is in the query logic:

**Current Query Logic:**
- Filters clients based on status (ativos, inativos, potencial)
- Uses complex logic with `dias_sem_comprar` and `total_pedidos`

**New Query Logic:**
- Removes all status-based filtering
- Shows all clients regardless of their activity status
- Maintains search functionality across all clients

### Data Flow
1. **Page Load**: Fetch all clients without status filtering
2. **Search**: Apply search terms across all clients
3. **Pagination**: Maintain current pagination logic
4. **Actions**: All existing actions (edit, delete, cashback) remain unchanged

## Error Handling

### Existing Error Handling
All existing error handling mechanisms remain in place:
- Database connection errors
- Authentication errors
- Query execution errors

### Additional Considerations
- Ensure search functionality works across larger dataset (all clients)
- Monitor performance impact of showing all clients
- Maintain proper loading states

## Testing Strategy

### Unit Tests
1. **Component Rendering**
   - Test that title shows "Cadastro do Cliente"
   - Test that ClienteTabs component is not rendered
   - Test that all clients are displayed regardless of status

2. **Query Logic**
   - Test `buildBaseQuery()` returns all clients
   - Test search functionality works across all clients
   - Test pagination works with unified client list

3. **User Interactions**
   - Test search functionality
   - Test pagination controls
   - Test client actions (edit, delete, cashback)

### Integration Tests
1. **Database Integration**
   - Test fetching all clients from database
   - Test search queries return correct results
   - Test pagination with large datasets

2. **Component Integration**
   - Test page renders correctly without tabs
   - Test search and pagination work together
   - Test client actions integrate properly

### Performance Tests
1. **Load Testing**
   - Test page performance with large number of clients
   - Test search performance across all clients
   - Test pagination performance

### User Acceptance Tests
1. **UI/UX Testing**
   - Verify title change is visible
   - Verify all clients are shown in single list
   - Verify search works across all clients
   - Verify all existing functionality is preserved

## Implementation Notes

### Migration Strategy
1. **Phase 1**: Remove ClienteTabs component and update imports
2. **Phase 2**: Modify query logic to remove status filtering
3. **Phase 3**: Update UI elements (title, layout)
4. **Phase 4**: Test and validate all functionality

### Rollback Plan
If issues arise, the changes can be easily reverted by:
1. Restoring the ClienteTabs component
2. Reverting the query logic changes
3. Restoring the original title

### Performance Considerations
- Monitor database query performance with larger result sets
- Consider implementing client-side caching if needed
- Ensure pagination limits are appropriate for the unified view