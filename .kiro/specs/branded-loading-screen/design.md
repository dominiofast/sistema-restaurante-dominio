# Design Document

## Overview

O sistema de loading com marca personalizada substituirá o componente `SplashLoader` atual por uma solução mais elegante e profissional que exibe a logo da empresa com animação circular de progresso. O design será inspirado na referência fornecida, com um círculo de progresso animado ao redor da logo centralizada.

## Architecture

### Component Structure
```
BrandedLoadingScreen/
├── BrandedLoadingScreen.tsx (componente principal)
├── LoadingAnimation.tsx (animação do círculo)
├── CompanyLogo.tsx (logo da empresa)
└── types.ts (tipos TypeScript)
```

### Data Flow
1. **Carregamento inicial**: O componente recebe o identificador da empresa
2. **Busca de branding**: Utiliza o hook `usePublicBrandingNew` para obter dados da empresa
3. **Renderização condicional**: Exibe logo personalizada ou ícone padrão
4. **Animação**: Círculo de progresso animado ao redor da logo
5. **Transição**: Fade out suave quando o carregamento termina

## Components and Interfaces

### BrandedLoadingScreen Component
```typescript
interface BrandedLoadingScreenProps {
  companyIdentifier?: string;
  isVisible: boolean;
  onLoadingComplete?: () => void;
  message?: string;
}
```

**Responsabilidades:**
- Gerenciar estado de visibilidade
- Coordenar animações de entrada/saída
- Integrar com sistema de branding da empresa
- Fornecer fallback para casos sem logo

### LoadingAnimation Component
```typescript
interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  strokeWidth?: number;
  duration?: number;
}
```

**Responsabilidades:**
- Renderizar círculo de progresso animado
- Suportar diferentes tamanhos e cores
- Animação suave e performática

### CompanyLogo Component
```typescript
interface CompanyLogoProps {
  logoUrl?: string;
  companyName?: string;
  size?: number;
  fallbackIcon?: React.ReactNode;
}
```

**Responsabilidades:**
- Exibir logo da empresa ou fallback
- Manter proporções adequadas
- Tratamento de erro de carregamento de imagem

## Data Models

### BrandingData (existing)
```typescript
interface PublicBrandingData {
  logo_url?: string;
  company_name?: string;
  primary_color?: string;
  secondary_color?: string;
  // ... outros campos existentes
}
```

### LoadingState
```typescript
interface LoadingState {
  isVisible: boolean;
  isAnimating: boolean;
  hasError: boolean;
  progress?: number;
}
```

## Error Handling

### Logo Loading Errors
- **Fallback gracioso**: Se a logo não carregar, exibir ícone padrão elegante
- **Timeout handling**: Limite de tempo para carregamento da logo
- **Retry mechanism**: Tentativa de recarregamento em caso de falha

### Branding Data Errors
- **Default styling**: Cores padrão quando branding não está disponível
- **Progressive enhancement**: Funcionalidade básica mesmo sem dados de branding
- **Error logging**: Log de erros para debugging

### Network Issues
- **Offline handling**: Comportamento adequado quando offline
- **Slow connections**: Indicadores visuais para conexões lentas

## Testing Strategy

### Unit Tests
- **Component rendering**: Testes de renderização com diferentes props
- **Animation behavior**: Verificar animações funcionam corretamente
- **Error scenarios**: Testes com falhas de carregamento
- **Responsive behavior**: Testes em diferentes tamanhos de tela

### Integration Tests
- **Branding integration**: Teste com dados reais de branding
- **Loading states**: Verificar transições entre estados
- **Performance**: Testes de performance da animação

### Visual Regression Tests
- **Cross-browser**: Consistência visual entre navegadores
- **Mobile responsiveness**: Aparência em dispositivos móveis
- **Animation smoothness**: Verificar suavidade das animações

## Implementation Details

### Animation Specifications
- **Circle animation**: SVG circle com `stroke-dasharray` e `stroke-dashoffset`
- **Duration**: 2 segundos por rotação completa
- **Easing**: `ease-in-out` para movimento natural
- **Colors**: Usar `primary_color` do branding ou fallback

### Responsive Design
- **Mobile (< 768px)**: Logo 64px, círculo 80px
- **Tablet (768px - 1024px)**: Logo 80px, círculo 96px  
- **Desktop (> 1024px)**: Logo 96px, círculo 112px

### Performance Optimizations
- **Lazy loading**: Carregar logo apenas quando necessário
- **Image optimization**: Usar formatos otimizados (WebP, AVIF)
- **Animation optimization**: `will-change` e `transform3d` para GPU
- **Memory management**: Cleanup de recursos ao desmontar

### Accessibility
- **Screen readers**: `aria-label` descritivo
- **Reduced motion**: Respeitar `prefers-reduced-motion`
- **Focus management**: Não interferir com navegação por teclado
- **Color contrast**: Garantir contraste adequado

### Integration Points

#### Favicon Update
```typescript
const updateFavicon = (logoUrl: string) => {
  const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
  if (link) {
    link.href = logoUrl;
  }
};
```

#### Document Title
```typescript
const updateDocumentTitle = (companyName: string) => {
  document.title = `${companyName} - Cardápio Digital`;
};
```

#### Meta Tags
```typescript
const updateMetaTags = (branding: PublicBrandingData) => {
  // Atualizar og:image, theme-color, etc.
};
```

### Migration Strategy

#### Phase 1: Component Creation
- Criar novos componentes sem afetar código existente
- Implementar testes unitários
- Validar design e animações

#### Phase 2: Integration
- Substituir `SplashLoader` por `BrandedLoadingScreen`
- Atualizar `ProtectedRoute` para usar novo componente
- Implementar favicon dinâmico

#### Phase 3: Enhancement
- Adicionar logo no header do cardápio
- Implementar meta tags dinâmicas
- Otimizações de performance

#### Phase 4: Cleanup
- Remover `SplashLoader` antigo
- Limpar imports não utilizados
- Documentação final