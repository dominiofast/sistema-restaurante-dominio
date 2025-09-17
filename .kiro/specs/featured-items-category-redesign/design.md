# Design Document

## Overview

O design foca exclusivamente na modificação visual dos cards da categoria "Destaque" do cardápio digital, implementando um visual diferenciado com badge de desconto baseado em uma referência visual específica, sem alterar outras categorias ou funcionalidades existentes.

## Architecture

A solução utiliza renderização condicional baseada na categoria atual, aplicando estilos especiais apenas quando a categoria "Destaque" está ativa:

```mermaid
graph TD
    A[Categoria Selecionada] --> B{É "Destaque"?}
    B -->|Sim| C[Renderizar FeaturedProductCard]
    B -->|Não| D[Renderizar ProductCard Normal]
    C --> E[Aplicar Visual da Referência]
    C --> F[Mostrar Badge de Desconto]
    D --> G[Manter Visual Atual]
```

## Components and Interfaces

### 1. FeaturedProductCard Component

**Purpose:** Componente especializado para exibir produtos na categoria "Destaque" com visual diferenciado

**Interface:**
```typescript
interface FeaturedProductCardProps {
  produto: Produto;
  primaryColor?: string;
  textColor?: string;
  onProductClick: (produto: Produto) => void;
  companyId?: string;
}

interface DiscountBadgeProps {
  discountPercentage: number;
  primaryColor: string;
}
```

### 2. Category Detection Logic

**Purpose:** Lógica para detectar quando estamos na categoria "Destaque"

**Interface:**
```typescript
interface CategoryContext {
  currentCategory: string | null;
  isFeaturedCategory: boolean;
}

const useFeaturedCategory = () => {
  // Detecta se a categoria atual é "Destaque" ou similar
  return {
    isFeaturedCategory: boolean;
    featuredCategoryId: string | null;
  };
};
```

### 3. Enhanced Product Card Renderer

**Purpose:** Renderizador que escolhe o componente correto baseado na categoria

**Interface:**
```typescript
interface ProductCardRendererProps {
  produto: Produto;
  currentCategory: string | null;
  primaryColor?: string;
  textColor?: string;
  onProductClick: (produto: Produto) => void;
  companyId?: string;
}
```

## Data Models

### Enhanced Product for Featured Display
```typescript
interface FeaturedProductDisplay extends Produto {
  discountPercentage?: number;
  hasValidDiscount: boolean;
  displayPrice: number;
  originalPrice?: number;
}
```

### Featured Category Configuration
```typescript
interface FeaturedCategoryConfig {
  categoryNames: string[]; // ["Destaque", "Destaques", "Promoções"]
  badgeStyle: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    fontSize: string;
  };
  cardStyle: {
    backgroundColor: string;
    borderColor: string;
    shadowStyle: string;
  };
}
```

## Visual Design Specifications

### Featured Card Layout
```
┌─────────────────────────────────────────┐
│  ┌─────────────────────┐  ┌───────────┐ │
│  │                     │  │           │ │
│  │   Product Info      │  │   Image   │ │
│  │   - Name            │  │           │ │
│  │   - Description     │  │           │ │
│  │   - Price + Badge   │  │           │ │
│  │                     │  │           │ │
│  └─────────────────────┘  └───────────┘ │
└─────────────────────────────────────────┘
```

### Discount Badge Design
- **Position:** Próximo ao preço, lado esquerdo
- **Format:** "-XX%" onde XX é a porcentagem de desconto
- **Style:** Fundo com cor primária, texto branco, bordas arredondadas
- **Size:** Pequeno, não intrusivo mas visível

### Card Enhancements for Featured Category
- **Background:** Manter branco mas com sutil destaque visual
- **Border:** Opcional - borda sutil na cor primária
- **Shadow:** Ligeiramente mais pronunciada que cards normais
- **Badge:** Destaque visual para desconto quando aplicável

## Implementation Strategy

### 1. Component Creation
- Criar `FeaturedProductCard` baseado no `ProductCard` existente
- Implementar lógica de detecção de categoria "Destaque"
- Adicionar renderização condicional no componente pai

### 2. Style Enhancements
- Implementar badge de desconto com design da referência
- Aplicar estilos visuais diferenciados para categoria "Destaque"
- Manter responsividade e acessibilidade

### 3. Integration Points
- Modificar o renderizador de produtos para usar componente correto
- Integrar com sistema de categorias existente
- Manter compatibilidade com funcionalidades existentes

## Error Handling

### 1. Category Detection Failures
- Fallback para componente padrão se detecção falhar
- Log de erros para debugging
- Graceful degradation sem quebrar funcionalidade

### 2. Price Calculation Issues
- Validação de preços antes de calcular desconto
- Fallback para não mostrar badge se cálculo falhar
- Prevenção de divisão por zero

### 3. Image Loading
- Placeholder padrão se imagem não carregar
- Manter layout consistente independente de imagem

## Testing Strategy

### 1. Visual Testing
- Comparar visual com referência fornecida
- Testar em diferentes tamanhos de tela
- Verificar consistência de cores e espaçamento

### 2. Functional Testing
- Testar mudança entre categorias
- Verificar cálculo correto de desconto
- Testar clique e funcionalidades do card

### 3. Integration Testing
- Testar com diferentes produtos (com/sem desconto)
- Verificar comportamento com diferentes categorias
- Testar com diferentes configurações de empresa

## Performance Considerations

### 1. Conditional Rendering
- Renderização eficiente baseada em categoria
- Evitar re-renders desnecessários
- Memoização de componentes quando apropriado

### 2. Style Application
- CSS-in-JS otimizado para estilos condicionais
- Reutilização de estilos base do componente original
- Minimizar impacto no bundle size

### 3. Image Optimization
- Manter otimizações existentes de imagem
- Lazy loading preservado
- Placeholder eficiente

## Accessibility

### 1. Screen Readers
- Manter labels apropriados para badges
- Descrições claras de desconto
- Navegação por teclado preservada

### 2. Color Contrast
- Garantir contraste adequado no badge
- Manter legibilidade em diferentes temas
- Suporte a modo escuro se existente

### 3. Focus Management
- Manter ordem de foco lógica
- Indicadores visuais de foco
- Compatibilidade com tecnologias assistivas