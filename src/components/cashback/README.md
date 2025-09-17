# Componentes de Cashback

Este diretório contém componentes para exibir informações de cashback no cardápio digital.

## Componentes Disponíveis

### 1. CashbackCard
Card compacto com design moderno e gradiente verde, ideal para exibição discreta.

**Props:**
- `companyId`: ID da empresa
- `className`: Classes CSS adicionais

**Uso:**
```tsx
import { CashbackCard } from '@/components/cashback/CashbackCard';

<CashbackCard companyId="company-123" />
```

### 2. CashbackBanner
Banner promocional com três variantes de design para diferentes contextos.

**Props:**
- `companyId`: ID da empresa
- `className`: Classes CSS adicionais
- `variant`: Tipo de banner ('default' | 'prominent' | 'minimal')

**Variantes:**

#### Minimal
Banner discreto com fundo azul claro, ideal para notificações sutis.

#### Default
Banner verde com design equilibrado, perfeito para destaque moderado.

#### Prominent
Banner roxo com design chamativo, ideal para promoções especiais.

**Uso:**
```tsx
import { CashbackBanner } from '@/components/cashback/CashbackBanner';

// Banner discreto
<CashbackBanner companyId="company-123" variant="minimal" />

// Banner padrão
<CashbackBanner companyId="company-123" variant="default" />

// Banner promocional
<CashbackBanner companyId="company-123" variant="prominent" />
```

## Integração com Dados Reais

Todos os componentes se conectam automaticamente com:

- **Configuração de Cashback**: Percentual configurado para cada empresa
- **Status de Ativação**: Só exibe quando o cashback está ativo
- **Dados em Tempo Real**: Atualiza automaticamente quando as configurações mudam

## Dependências

- `@/hooks/useCashbackConfig`: Hook para buscar configurações de cashback
- `lucide-react`: Ícones utilizados nos componentes
- CSS Modules: Para estilos isolados e responsivos

## Personalização

Os componentes podem ser personalizados através de:

1. **CSS Modules**: Edite os arquivos `.module.css` para alterar cores, tamanhos e layouts
2. **Props de Classe**: Use a prop `className` para aplicar estilos adicionais
3. **Variantes**: Escolha entre diferentes estilos usando a prop `variant` no CashbackBanner

## Exemplo de Implementação Completa

```tsx
import { CashbackCard } from '@/components/cashback/CashbackCard';
import { CashbackBanner } from '@/components/cashback/CashbackBanner';

const CardapioDigital = () => {
  return (
    <div>
      {/* Banner promocional no topo */}
      <CashbackBanner companyId="company-123" variant="prominent" />
      
      {/* Card discreto no header */}
      <CashbackCard companyId="company-123" />
      
      {/* Banner minimal entre seções */}
      <CashbackBanner companyId="company-123" variant="minimal" />
    </div>
  );
};
```

## Responsividade

Todos os componentes são totalmente responsivos e se adaptam automaticamente a diferentes tamanhos de tela:

- **Desktop**: Layout horizontal com espaçamento otimizado
- **Tablet**: Layout adaptativo com elementos reorganizados
- **Mobile**: Layout vertical com tamanhos ajustados
