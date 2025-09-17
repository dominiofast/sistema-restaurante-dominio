# Design Document

## Overview

A transformação do modal de endereço em uma experiência fullscreen envolve a criação de um novo componente que ocupe toda a tela, proporcionando melhor usabilidade especialmente em dispositivos móveis. A solução manterá toda a funcionalidade existente do fluxo de busca de endereços, mas com uma interface otimizada para tela cheia.

## Architecture

### Componentes Atuais (A serem modificados)

1. **AddressSearchFlow.tsx** - Componente principal que gerencia o fluxo
2. **AddressSearchStep.tsx** - Step de busca de endereço
3. **AddressSuggestionsStep.tsx** - Step de sugestões
4. **AddressDetailsStep.tsx** - Step de detalhes do endereço
5. **DeliveryAddressModal.tsx** - Wrapper do modal

### Nova Arquitetura Proposta

```
FullscreenAddressModal (Novo)
├── FullscreenHeader (Novo)
├── AddressSearchFlow (Modificado)
│   ├── AddressSearchStep (Modificado)
│   ├── AddressSuggestionsStep (Modificado)
│   └── AddressDetailsStep (Modificado)
└── FullscreenFooter (Novo - se necessário)
```

### Estratégia de Implementação

1. **Criar novo componente FullscreenAddressModal** que substitua o modal atual
2. **Modificar componentes existentes** para se adaptarem ao layout fullscreen
3. **Manter compatibilidade** com props e callbacks existentes
4. **Adicionar animações** de transição suaves

## Components and Interfaces

### 1. FullscreenAddressModal

```typescript
interface FullscreenAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (address: CustomerAddress) => void;
  customerName?: string;
  customerPhone?: string;
  primaryColor?: string;
}

const FullscreenAddressModal: React.FC<FullscreenAddressModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  customerPhone,
  primaryColor
}) => {
  // Implementação fullscreen
};
```

### 2. FullscreenHeader

```typescript
interface FullscreenHeaderProps {
  title: string;
  onClose: () => void;
  onBack?: () => void;
  primaryColor?: string;
  showBackButton?: boolean;
}

const FullscreenHeader: React.FC<FullscreenHeaderProps> = ({
  title,
  onClose,
  onBack,
  primaryColor,
  showBackButton = false
}) => {
  // Header fixo com título e botões de navegação
};
```

### 3. Modificações nos Steps Existentes

```typescript
// Adicionar props para controle fullscreen
interface StepProps {
  // Props existentes...
  isFullscreen?: boolean;
  onHeaderChange?: (config: HeaderConfig) => void;
}

interface HeaderConfig {
  title: string;
  showBackButton: boolean;
  onBack?: () => void;
}
```

## Data Models

### Estado do Modal Fullscreen

```typescript
interface FullscreenModalState {
  isOpen: boolean;
  currentStep: 'search' | 'suggestions' | 'details';
  headerConfig: HeaderConfig;
  animationState: 'entering' | 'entered' | 'exiting' | 'exited';
}
```

### Configuração de Animações

```typescript
interface AnimationConfig {
  duration: number;
  easing: string;
  slideDirection: 'up' | 'down' | 'left' | 'right';
}
```

## Error Handling

### 1. Tratamento de Estados de Transição

```typescript
const handleTransitionError = (error: Error) => {
  console.error('Erro na transição do modal:', error);
  // Fallback para estado seguro
  setAnimationState('exited');
  onClose();
};
```

### 2. Compatibilidade com Dispositivos

```typescript
const checkDeviceSupport = () => {
  const isMobile = window.innerWidth < 768;
  const supportsFullscreen = document.fullscreenEnabled;
  
  return {
    isMobile,
    supportsFullscreen,
    shouldUseFullscreen: isMobile || supportsFullscreen
  };
};
```

## Testing Strategy

### 1. Testes de Responsividade

```typescript
describe('FullscreenAddressModal Responsiveness', () => {
  test('should occupy full screen on mobile devices', () => {
    // Testa se modal ocupa 100% da tela em mobile
  });
  
  test('should adapt layout for different screen sizes', () => {
    // Testa adaptação para diferentes tamanhos
  });
});
```

### 2. Testes de Animação

```typescript
describe('Modal Animations', () => {
  test('should animate smoothly when opening', () => {
    // Testa animação de abertura
  });
  
  test('should animate smoothly when closing', () => {
    // Testa animação de fechamento
  });
});
```

### 3. Testes de Funcionalidade

```typescript
describe('Address Flow Functionality', () => {
  test('should maintain all existing functionality', () => {
    // Testa se funcionalidades existentes continuam funcionando
  });
  
  test('should handle step navigation correctly', () => {
    // Testa navegação entre steps
  });
});
```

## Implementation Details

### 1. Estrutura CSS/Tailwind

```css
/* Classe base para modal fullscreen */
.fullscreen-modal {
  @apply fixed inset-0 z-50 bg-white;
  @apply flex flex-col;
  @apply animate-in slide-in-from-bottom duration-300;
}

/* Header fixo */
.fullscreen-header {
  @apply sticky top-0 z-10 bg-white border-b;
  @apply flex items-center justify-between p-4;
  @apply shadow-sm;
}

/* Conteúdo scrollável */
.fullscreen-content {
  @apply flex-1 overflow-y-auto;
  @apply p-4;
}

/* Animações de entrada/saída */
.modal-enter {
  @apply animate-in slide-in-from-bottom duration-300;
}

.modal-exit {
  @apply animate-out slide-out-to-bottom duration-300;
}
```

### 2. Hooks Personalizados

```typescript
// Hook para gerenciar estado do modal fullscreen
const useFullscreenModal = (isOpen: boolean) => {
  const [animationState, setAnimationState] = useState<AnimationState>('exited');
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>({
    title: 'Novo Endereço',
    showBackButton: false
  });

  useEffect(() => {
    if (isOpen) {
      setAnimationState('entering');
      setTimeout(() => setAnimationState('entered'), 300);
    } else {
      setAnimationState('exiting');
      setTimeout(() => setAnimationState('exited'), 300);
    }
  }, [isOpen]);

  return {
    animationState,
    headerConfig,
    setHeaderConfig
  };
};
```

### 3. Detecção de Dispositivo

```typescript
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDeviceInfo = () => {
      setIsMobile(window.innerWidth < 768);
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    
    return () => window.removeEventListener('resize', updateDeviceInfo);
  }, []);

  return { isMobile, screenSize };
};
```

## Performance Considerations

### 1. Lazy Loading

```typescript
// Carregar componente fullscreen apenas quando necessário
const FullscreenAddressModal = lazy(() => import('./FullscreenAddressModal'));

// Usar Suspense para loading state
<Suspense fallback={<AddressModalSkeleton />}>
  <FullscreenAddressModal {...props} />
</Suspense>
```

### 2. Otimização de Animações

```typescript
// Usar transform ao invés de mudanças de layout
const animationStyles = {
  entering: { transform: 'translateY(100%)', opacity: 0 },
  entered: { transform: 'translateY(0)', opacity: 1 },
  exiting: { transform: 'translateY(100%)', opacity: 0 }
};
```

### 3. Prevenção de Re-renders

```typescript
// Memoizar componentes pesados
const MemoizedAddressSearchStep = React.memo(AddressSearchStep);
const MemoizedAddressSuggestions = React.memo(AddressSuggestionsStep);
```

## Accessibility Considerations

### 1. Foco e Navegação

```typescript
// Gerenciar foco quando modal abre/fecha
useEffect(() => {
  if (isOpen) {
    // Focar no primeiro elemento interativo
    const firstInput = modalRef.current?.querySelector('input');
    firstInput?.focus();
  }
}, [isOpen]);
```

### 2. ARIA Labels

```typescript
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h1 id="modal-title">Novo Endereço</h1>
  <p id="modal-description">Insira seu endereço para entrega</p>
</div>
```

### 3. Escape Key Support

```typescript
useEffect(() => {
  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      onClose();
    }
  };

  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, onClose]);
```

## Migration Strategy

### Fase 1: Criar Componente Fullscreen
- Implementar FullscreenAddressModal
- Criar FullscreenHeader
- Adicionar animações básicas

### Fase 2: Adaptar Steps Existentes
- Modificar AddressSearchStep para fullscreen
- Adaptar AddressSuggestionsStep
- Ajustar AddressDetailsStep

### Fase 3: Integração e Testes
- Integrar com CheckoutModal
- Testes em diferentes dispositivos
- Ajustes de performance

### Fase 4: Rollout Gradual
- Feature flag para alternar entre versões
- Monitoramento de métricas de UX
- Rollback plan se necessário