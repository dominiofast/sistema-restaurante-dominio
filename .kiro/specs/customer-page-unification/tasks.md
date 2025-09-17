# Implementation Plan

- [x] 1. Remove ClienteTabs component and update imports


  - Remove the ClienteTabs component file completely
  - Remove ClienteTabs import from Clientes.tsx
  - Remove ClienteTabs JSX usage from the main page
  - _Requirements: 1.1, 1.2_



- [ ] 2. Simplify state management in Clientes.tsx
  - Remove `aba` state variable and AbaType type definition
  - Remove `setAba` function calls and related logic
  - Simplify `counts` state to only track total count


  - Remove tab-specific useEffect dependencies
  - _Requirements: 1.1, 1.3_

- [x] 3. Update page title and header


  - Change title from "Meus Clientes" to "Cadastro do Cliente"
  - Update the header section to reflect the new title
  - Maintain the total count display in the title
  - _Requirements: 2.1, 2.2, 2.3_



- [ ] 4. Modify database query logic
  - Update `buildBaseQuery()` function to remove status-based filtering
  - Remove the conditional logic for 'ativos', 'inativos', and 'potencial'


  - Ensure search functionality is preserved across all clients
  - _Requirements: 1.1, 3.1, 3.2_

- [x] 5. Simplify count fetching logic


  - Update `fetchCounts()` function to only fetch total client count
  - Remove separate counting for ativos, inativos, and potenciais
  - Update `fetchCurrentTabCount()` to work with unified client list
  - _Requirements: 1.1, 2.3_



- [ ] 6. Clean up useEffect dependencies
  - Remove `aba` from useEffect dependency arrays
  - Simplify effect logic that was dependent on tab changes
  - Ensure search and pagination effects still work correctly


  - _Requirements: 1.3, 3.1_

- [ ] 7. Update search functionality
  - Ensure search works across all clients regardless of previous status
  - Test search performance with larger unified dataset



  - Maintain search term highlighting and filtering logic
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 8. Preserve all existing client actions
  - Verify edit functionality works with unified client list
  - Verify delete functionality works with unified client list
  - Verify cashback functionality works with unified client list
  - Test all action buttons and modals
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9. Test pagination with unified client list
  - Verify pagination controls work correctly with all clients
  - Test page size options work properly
  - Ensure pagination state is maintained during search
  - Test edge cases with large client datasets
  - _Requirements: 1.3, 3.1_

- [ ] 10. Update component cleanup and optimization
  - Remove unused imports and type definitions
  - Clean up any remaining references to tab-specific logic
  - Optimize component re-renders for the unified view
  - Add proper TypeScript types for simplified state
  - _Requirements: 1.1, 1.2_