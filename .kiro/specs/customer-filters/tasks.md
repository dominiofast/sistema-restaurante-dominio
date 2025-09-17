# Implementation Plan

- [x] 1. Create filter state interface and types


  - Define FilterState interface with all filter properties
  - Create type definitions for filter options (pedidosRange, etc.)
  - Add filter state to main Clientes component
  - _Requirements: 7.1, 7.2_



- [ ] 2. Create ClienteFilters component structure
  - Create new component file src/components/clientes/ClienteFilters.tsx
  - Implement basic component structure with props interface
  - Add responsive grid layout for filter sections


  - Import necessary UI components and icons
  - _Requirements: 1.1, 7.1_

- [ ] 3. Implement date range filters (cadastro)
  - Add date input fields for "de" and "até" cadastro


  - Implement date validation (from <= to)
  - Connect date inputs to filter state
  - Add proper labels and styling
  - _Requirements: 1.1, 1.2, 1.3, 1.4_




- [ ] 4. Implement status activity filters with badges
  - Create clickable status badges (Ativos, Inativos, Potenciais)
  - Implement toggle functionality for multiple selection

  - Add visual feedback for active/inactive states

  - Style badges with appropriate colors
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [ ] 5. Implement birth date range filters
  - Add date input fields for nascimento period
  - Connect to filter state with validation
  - Reuse date validation logic from cadastro filters
  - _Requirements: 3.1, 3.2, 3.3_


- [ ] 6. Implement negative balance checkbox filter
  - Add checkbox for "Apenas saldos negativos"
  - Connect checkbox to filter state
  - Style checkbox with proper label


  - _Requirements: 4.1, 4.2_

- [ ] 7. Implement order quantity filter dropdown
  - Create select dropdown with order quantity options


  - Add options: Todos, Nenhum pedido, 1-5 pedidos, 5+ pedidos
  - Connect dropdown to filter state
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 8. Add clear filters functionality
  - Implement clear filters button

  - Create function to reset all filters to default state
  - Add proper button styling and positioning
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 9. Integrate ClienteFilters component into main page


  - Import ClienteFilters component in Clientes.tsx
  - Add component to page layout between header and search
  - Pass filter state and handlers as props
  - _Requirements: 7.1_



- [ ] 10. Modify buildBaseQuery to apply filters
  - Update buildBaseQuery function to handle date range filters
  - Add logic for status activity filters using OR conditions
  - Implement birth date filtering

  - Add negative balance filtering logic
  - Add order quantity range filtering
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 11. Update useEffect dependencies for filter changes
  - Add filters to useEffect dependency array


  - Ensure pagination resets when filters change
  - Update count fetching to include filters
  - _Requirements: 7.3, 6.3_

- [ ] 12. Implement automatic filter application
  - Ensure filters apply automatically on change
  - Add debouncing for date inputs to avoid excessive queries
  - Update loading states during filter application
  - _Requirements: 7.1, 7.2_

- [ ] 13. Add filter validation and error handling
  - Validate date ranges (from <= to)
  - Handle invalid filter combinations gracefully
  - Add error messages for validation failures
  - Test edge cases and error scenarios
  - _Requirements: 1.1, 3.1_

- [ ] 14. Style and optimize filter component
  - Apply consistent styling matching the reference design
  - Ensure responsive layout works on all screen sizes
  - Optimize component re-renders
  - Add proper TypeScript types for all props
  - _Requirements: 7.1_

- [ ] 15. Test filter integration with existing functionality
  - Verify filters work with existing search functionality
  - Test pagination works correctly with filters applied
  - Ensure all client actions (edit, delete, cashback) still work
  - Test performance with various filter combinations
  - _Requirements: 7.1, 7.2, 7.3_