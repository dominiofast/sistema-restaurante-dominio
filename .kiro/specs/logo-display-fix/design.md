# Documento de Design

## Visão Geral

Este documento apresenta o design para corrigir o problema de tamanho das logos dos estabelecimentos no cardápio digital e na tela de carregamento. A solução implementa um sistema de dimensionamento harmonioso e responsivo que garante visibilidade adequada da marca em diferentes contextos e dispositivos.

## Arquitetura

### Componentes Principais

1. **Sistema de Breakpoints Responsivos**
   - Hook `useLogoBreakpoints` para gerenciar tamanhos por dispositivo
   - Configurações específicas para mobile, tablet e desktop
   - Suporte a container queries para responsividade avançada

2. **Sistema de Dimensionamento Dinâmico**
   - Hook `useResponsiveLogo` para cálculos de tamanho em tempo real
   - Adaptação baseada no container pai
   - Preservação de aspect ratio

3. **Sistema de Carregamento Otimizado**
   - Hook `useLogoLoader` com retry automático
   - Cache de dimensões calculadas
   - Fallbacks para estados de erro

### Contextos de Uso

1. **Header do Cardápio (CompanyHeader)**
   - Tamanho atual: 48px (mobile) / 64px (desktop)
   - Novo tamanho: 56px (mobile) / 80px (desktop)
   - Container: 16x16 (mobile) / 20x20 (desktop)

2. **Tela de Carregamento (Loading Screen)**
   - Tamanho atual: 64px
   - Novo tamanho: 96px (mobile) / 128px (desktop)
   - Posição central com destaque visual

## Componentes e Interfaces

### Interface de Configuração de Tamanhos

```typescript
interface LogoSizeConfig {
  context: 'header' | 'loading' | 'branding';
  mobile: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
  tablet: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
  desktop: {
    size: number;
    container: { width: number; height: number };
    padding: number;
  };
}
```

### Sistema de Classes CSS

```css
/* Contexto Header */
.logo-header-mobile { width: 56px; height: 56px; }
.logo-header-tablet { width: 72px; height: 72px; }
.logo-header-desktop { width: 80px; height: 80px; }

/* Contexto Loading */
.logo-loading-mobile { width: 96px; height: 96px; }
.logo-loading-tablet { width: 112px; height: 112px; }
.logo-loading-desktop { width: 128px; height: 128px; }
```

### Componente CompanyLogo Aprimorado

```typescript
interface CompanyLogoProps {
  logoUrl?: string;
  companyName?: string;
  context: 'header' | 'loading' | 'branding';
  size?: number; // Override manual se necessário
  className?: string;
  preserveAspectRatio?: boolean;
  enableResponsive?: boolean;
}
```

## Modelos de Dados

### Configuração de Breakpoints

```typescript
interface LogoBreakpointConfig {
  name: 'mobile' | 'tablet' | 'desktop';
  minWidth: number;
  maxWidth?: number;
  logoSizes: {
    header: number;
    loading: number;
    branding: number;
  };
  containerPadding: number;
  borderRadius: string;
}
```

### Estado de Carregamento

```typescript
interface LogoLoadingState {
  isLoading: boolean;
  hasError: boolean;
  isLoaded: boolean;
  retryCount: number;
  error?: LoadingError;
  dimensions?: { width: number; height: number };
}
```

## Estratégia de Implementação

### Fase 1: Atualização de Tamanhos Base

1. **Atualizar configurações de breakpoints**
   - Aumentar tamanhos base para cada contexto
   - Definir containers apropriados
   - Ajustar padding e border-radius

2. **Modificar classes CSS existentes**
   - Atualizar `.header-logo` com novos tamanhos
   - Criar `.loading-logo-enhanced` para tela de carregamento
   - Adicionar variantes responsivas

### Fase 2: Implementação de Sistema Responsivo

1. **Integrar hooks de responsividade**
   - Aplicar `useLogoBreakpoints` no CompanyLogo
   - Implementar cálculos dinâmicos de tamanho
   - Adicionar suporte a container queries

2. **Otimizar carregamento**
   - Implementar preload de logos
   - Adicionar cache de dimensões
   - Melhorar tratamento de erros

### Fase 3: Ajustes de Layout

1. **CompanyHeader**
   - Aumentar container de 16x16 para 20x20 (mobile)
   - Aumentar container de 20x20 para 24x24 (desktop)
   - Ajustar espaçamento e alinhamento

2. **Loading Screen**
   - Centralizar logo com novo tamanho
   - Ajustar animações de carregamento
   - Melhorar contraste e visibilidade

## Tratamento de Erros

### Estados de Erro

1. **Logo não encontrada**
   - Exibir ícone de fallback
   - Mostrar iniciais da empresa
   - Manter dimensões consistentes

2. **Falha no carregamento**
   - Retry automático com backoff exponencial
   - Indicador visual de erro
   - Opção de reload manual

3. **Dimensões inválidas**
   - Aplicar tamanhos padrão
   - Log de erro para debugging
   - Graceful degradation

## Estratégia de Testes

### Testes Unitários

1. **Hooks de responsividade**
   - Testar cálculos de breakpoints
   - Validar dimensões calculadas
   - Verificar comportamento em diferentes tamanhos de tela

2. **Sistema de carregamento**
   - Testar retry logic
   - Validar cache de dimensões
   - Verificar tratamento de erros

### Testes de Integração

1. **CompanyHeader**
   - Verificar renderização em diferentes dispositivos
   - Testar responsividade do container
   - Validar alinhamento e espaçamento

2. **Loading Screen**
   - Testar centralização da logo
   - Verificar animações
   - Validar estados de carregamento

### Testes Visuais

1. **Comparação antes/depois**
   - Screenshots em diferentes resoluções
   - Validação de proporções
   - Verificação de harmonia visual

2. **Testes de usabilidade**
   - Facilidade de identificação da marca
   - Impacto visual adequado
   - Consistência entre contextos

## Considerações de Performance

### Otimizações

1. **Lazy loading**
   - Carregar logos apenas quando necessário
   - Preload para logos críticas
   - Cache inteligente de imagens

2. **Responsive images**
   - Servir tamanhos apropriados por dispositivo
   - Suporte a formatos modernos (WebP, AVIF)
   - Compressão otimizada

3. **CSS optimizations**
   - Container queries para melhor performance
   - CSS custom properties para flexibilidade
   - Minimização de reflows

### Métricas de Monitoramento

1. **Tempo de carregamento**
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

2. **Taxa de erro**
   - Falhas de carregamento de logo
   - Timeouts de rede
   - Erros de dimensionamento

## Compatibilidade

### Navegadores Suportados

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

### Fallbacks

1. **Container queries não suportadas**
   - Usar media queries tradicionais
   - JavaScript para detecção de features
   - Graceful degradation

2. **Imagens não carregadas**
   - Ícones de fallback
   - Iniciais da empresa
   - Placeholder visual

## Acessibilidade

### Requisitos WCAG

1. **Contraste adequado**
   - Logos visíveis em diferentes backgrounds
   - Indicadores de estado acessíveis
   - Suporte a modo escuro

2. **Navegação por teclado**
   - Logos focáveis quando interativas
   - Skip links apropriados
   - Ordem de tabulação lógica

3. **Leitores de tela**
   - Alt text descritivo
   - ARIA labels quando necessário
   - Anúncio de estados de carregamento