# Design Document

## Overview

Este documento detalha o design para melhorar a acessibilidade e contraste na interface de checkout do cardápio digital. O problema identificado está no componente `PaymentModal.tsx`, onde o texto "Escolha a forma de pagamento" possui baixo contraste devido ao uso de texto branco sobre um fundo colorido que pode não ter contraste suficiente dependendo da cor primária da empresa.

## Architecture

### Current Implementation Analysis

Atualmente, o texto problemático está implementado no `PaymentModal.tsx`:

```tsx
<h2 className="text-lg font-bold text-white text-center">
  Escolha a forma de pagamento
</h2>
```

Este texto está dentro de um container com:
```tsx
style={{ 
  backgroundColor: primaryColor,
  borderColor: primaryColor
}}
```

O problema é que `primaryColor` é dinâmico e pode resultar em combinações com baixo contraste quando a cor é clara.

### Design Solution

Implementaremos um sistema de contraste inteligente que:

1. **Calcula automaticamente o contraste** entre texto e fundo
2. **Ajusta a cor do texto dinamicamente** para garantir contraste mínimo WCAG 2.1 AA (4.5:1)
3. **Aplica consistentemente** em todos os componentes de checkout
4. **Mantém a identidade visual** da marca sempre que possível

## Components and Interfaces

### 1. Utility Functions

#### `contrastUtils.ts`
```typescript
interface ContrastResult {
  ratio: number;
  isAccessible: boolean;
  recommendedTextColor: string;
}

export const calculateContrast = (backgroundColor: string, textColor: string): number;
export const getAccessibleTextColor = (backgroundColor: string): string;
export const isColorLight = (color: string): boolean;
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null;
export const getLuminance = (r: number, g: number, b: number): number;
```

### 2. React Hook

#### `useAccessibleColors.ts`
```typescript
interface AccessibleColorsResult {
  textColor: string;
  backgroundColor: string;
  contrastRatio: number;
  isAccessible: boolean;
}

export const useAccessibleColors = (primaryColor: string): AccessibleColorsResult;
```

### 3. Component Updates

#### PaymentModal Component
- Substituir `text-white` por cor calculada dinamicamente
- Adicionar indicadores visuais de foco melhorados
- Implementar estados hover/focus com contraste adequado

#### CheckoutModal Component
- Aplicar sistema de contraste em botões e textos importantes
- Melhorar indicadores de seleção de opções de entrega
- Garantir contraste em estados disabled

### 4. CSS Classes

#### Tailwind CSS Extensions
```css
.text-accessible-primary {
  color: var(--accessible-text-color);
}

.bg-accessible-primary {
  background-color: var(--accessible-bg-color);
}

.border-accessible-primary {
  border-color: var(--accessible-border-color);
}
```

## Data Models

### Contrast Configuration
```typescript
interface ContrastConfig {
  minRatio: number; // 4.5 para WCAG AA
  preferredRatio: number; // 7.0 para WCAG AAA quando possível
  fallbackTextColor: string; // Cor de fallback se cálculo falhar
  fallbackBackgroundColor: string;
}

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accessibleText: string;
  accessibleBackground: string;
}
```

## Error Handling

### Fallback Strategy
1. **Cor inválida**: Usar cores padrão com contraste garantido
2. **Cálculo falha**: Aplicar combinação preta/branca segura
3. **Browser não suporta**: Degradar graciosamente para cores estáticas

### Error Boundaries
- Implementar error boundary específico para componentes de cor
- Log de erros para monitoramento de problemas de contraste
- Fallback visual que não quebra a experiência do usuário

## Testing Strategy

### Unit Tests
1. **Funções de contraste**: Testar cálculos com cores conhecidas
2. **Hook de cores acessíveis**: Verificar retorno correto para diferentes inputs
3. **Componentes**: Testar renderização com diferentes cores primárias

### Integration Tests
1. **Fluxo completo de checkout**: Verificar contraste em todas as telas
2. **Diferentes temas**: Testar com cores claras, escuras e médias
3. **Estados interativos**: Hover, focus, disabled, selected

### Accessibility Tests
1. **Contraste automático**: Usar ferramentas como axe-core
2. **Leitores de tela**: Testar navegação com NVDA/JAWS
3. **Navegação por teclado**: Verificar indicadores de foco visíveis

### Visual Regression Tests
1. **Screenshots comparativos**: Antes e depois das mudanças
2. **Diferentes resoluções**: Mobile, tablet, desktop
3. **Diferentes cores primárias**: Testar com palette de cores reais das empresas

## Implementation Phases

### Phase 1: Core Utilities
- Implementar funções de cálculo de contraste
- Criar hook useAccessibleColors
- Testes unitários das funções

### Phase 2: PaymentModal Fix
- Aplicar sistema de contraste no PaymentModal
- Substituir text-white por cor calculada
- Melhorar estados de foco e hover

### Phase 3: CheckoutModal Enhancement
- Aplicar melhorias de contraste no CheckoutModal
- Melhorar indicadores visuais de seleção
- Otimizar botões e elementos interativos

### Phase 4: System-wide Application
- Aplicar sistema em outros componentes do checkout
- Criar classes CSS utilitárias
- Documentação para desenvolvedores

## Performance Considerations

### Optimization Strategies
1. **Memoização**: Cache de cálculos de contraste para cores repetidas
2. **CSS Variables**: Usar variáveis CSS para evitar recálculos
3. **Lazy Loading**: Carregar utilitários apenas quando necessário

### Monitoring
- Métricas de performance dos cálculos de contraste
- Monitoramento de fallbacks utilizados
- Feedback de usuários sobre legibilidade

## Browser Compatibility

### Supported Features
- CSS custom properties (variáveis CSS)
- Modern color functions
- Flexbox e Grid para layouts acessíveis

### Fallbacks
- Cores estáticas para browsers antigos
- Polyfills para funções de cor não suportadas
- Degradação progressiva mantendo funcionalidade