# Documento de Design

## Visão Geral

Este documento define o design para refatoração conservadora do fluxo de checkout no CardapioPublico.tsx. O objetivo é melhorar a organização do código extraindo lógica para hooks customizados, mantendo 100% da funcionalidade existente.

## Arquitetura

### Estrutura Atual
```
CardapioPublico.tsx (587 linhas)
├── Estados do checkout (step, cliente, endereco, deliveryInfo)
├── Funções de manipulação (handleCheckout, handleCheckoutComplete, etc.)
├── Lógica de renderização
└── JSX complexo com múltiplos modals
```

### Estrutura Proposta
```
CardapioPublico.tsx (reduzido)
├── useCheckoutFlow() - Estados
├── useCheckoutHandlers() - Funções
├── Lógica de renderização (inalterada)
└── JSX (idêntico)

hooks/
├── useCheckoutFlow.ts - Gerencia estados do checkout
└── useCheckoutHandlers.ts - Gerencia funções do checkout
```

## Componentes e Interfaces

### 1. Hook useCheckoutFlow

**Responsabilidade:** Gerenciar todos os estados relacionados ao checkout

```typescript
interface CheckoutFlowState {
  step: 'cart' | 'identificacao' | 'checkout' | 'payment';
  cliente: ClientePublico | null;
  endereco: string;
  deliveryInfo: { tipo: 'delivery' | 'pickup'; endereco?: any; taxaEntrega?: number } | null;
}

interface CheckoutFlowActions {
  setStep: (step: CheckoutFlowState['step']) => void;
  setCliente: (cliente: ClientePublico | null) => void;
  setEndereco: (endereco: string) => void;
  setDeliveryInfo: (info: CheckoutFlowState['deliveryInfo']) => void;
}

export const useCheckoutFlow = (): CheckoutFlowState & CheckoutFlowActions
```

### 2. Hook useCheckoutHandlers

**Responsabilidade:** Gerenciar todas as funções de manipulação do checkout

```typescript
interface CheckoutHandlers {
  handleCheckout: () => void;
  handleCheckoutComplete: (deliveryData: any) => void;
  handlePaymentComplete: (paymentMethod: string) => Promise<void>;
  handleIdentificacaoComplete: (nome: string, telefone: string) => void;
  handleTrocarConta: () => void;
}

export const useCheckoutHandlers = (dependencies: {
  // Todas as dependências necessárias das funções atuais
}): CheckoutHandlers
```

### 3. CardapioPublico Refatorado

**Mudanças:**
- Substituir declarações de estado por hooks
- Substituir funções por hooks
- Manter todo o resto idêntico

```typescript
const CardapioPublico: React.FC = () => {
  // ANTES:
  // const [step, setStep] = useState<...>('cart');
  // const [cliente, setCliente] = useState<...>(null);
  
  // DEPOIS:
  const checkoutFlow = useCheckoutFlow();
  const checkoutHandlers = useCheckoutHandlers({
    // dependências necessárias
  });
  
  // Todo o resto permanece IDÊNTICO
  // Mesmos useEffects, mesma lógica, mesmo JSX
};
```

## Modelos de Dados

### Estados Preservados
Todos os tipos e interfaces existentes serão mantidos:
- `ClientePublico`
- `CartItem`
- `Produto`
- Estados de modal (cartOpen, selectedProduct, etc.)

### Novas Interfaces
Apenas interfaces para os hooks, sem alterar dados existentes:
- `CheckoutFlowState`
- `CheckoutFlowActions`
- `CheckoutHandlers`

## Tratamento de Erros

### Estratégia Conservadora
1. **Preservar todos os tratamentos existentes**
2. **Não alterar nenhuma lógica de erro**
3. **Manter mesmas mensagens e comportamentos**
4. **Garantir que hooks não introduzam novos pontos de falha**

### Validação de Integridade
1. **Testes antes/depois** para cada função
2. **Comparação de comportamento** em cenários de erro
3. **Verificação de dependências** mantidas corretamente

## Estratégia de Testes

### Testes de Regressão
1. **Executar todos os testes existentes** após cada etapa
2. **Comparar snapshots** do comportamento antes/depois
3. **Testar fluxos completos** para garantir integridade

### Novos Testes para Hooks
1. **Testes unitários** para useCheckoutFlow
2. **Testes unitários** para useCheckoutHandlers
3. **Testes de integração** entre hooks e componente

### Testes de Comportamento
1. **Verificar que estados mudam identicamente**
2. **Verificar que funções produzem mesmos resultados**
3. **Verificar que efeitos colaterais são preservados**

## Implementação Incremental

### Fase 1: Criar useCheckoutFlow
1. Extrair apenas os estados
2. Testar isoladamente
3. Integrar no componente
4. Validar comportamento idêntico

### Fase 2: Criar useCheckoutHandlers
1. Extrair apenas as funções
2. Manter todas as dependências
3. Testar cada função isoladamente
4. Integrar no componente

### Fase 3: Limpeza e Otimização
1. Remover código duplicado
2. Melhorar organização de imports
3. Adicionar documentação
4. Validação final completa

## Vantagens da Abordagem

### Segurança
- **Zero risco** de quebrar funcionalidades
- **Reversível** a qualquer momento
- **Testável** em cada etapa
- **Incremental** sem big bang

### Qualidade
- **Código mais organizado** sem alterar comportamento
- **Mais testável** com lógica isolada
- **Mais manutenível** com responsabilidades claras
- **Mais reutilizável** com hooks extraídos

### Desenvolvimento
- **Mais fácil de debugar** com lógica separada
- **Mais fácil de entender** com responsabilidades claras
- **Mais fácil de modificar** no futuro
- **Melhor experiência** para desenvolvedores

## Considerações de Performance

### Impacto Zero
- **Mesma quantidade de re-renders**
- **Mesmas dependências de useEffect**
- **Mesmo ciclo de vida de componentes**
- **Nenhuma otimização prematura**

### Benefícios Futuros
- **Facilita memoização** se necessário
- **Permite otimizações localizadas**
- **Melhora profiling** de performance
- **Prepara para React DevTools** melhorados

## Compatibilidade

### Garantias
- **100% compatível** com código existente
- **Mesma API** para componentes pais
- **Mesmos props** e comportamentos
- **Mesma experiência** do usuário

### Preparação Futura
- **Base sólida** para melhorias futuras
- **Estrutura flexível** para novos recursos
- **Código limpo** para manutenção
- **Padrões consistentes** para equipe