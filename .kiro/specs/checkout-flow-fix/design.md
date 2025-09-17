# Documento de Design

## Visão Geral

Este documento define o design para corrigir o fluxo de checkout no cardápio digital. O problema atual é que quando o usuário clica em "Finalizar pedido" na página `ProdutoAdicionado`, ele é redirecionado de volta para o cardápio com o carrinho aberto, ao invés de ir diretamente para o checkout.

## Arquitetura

### Fluxo Atual (Problemático)
1. Usuário adiciona produto ao carrinho
2. Navega para `/produto-adicionado`
3. Clica em "Finalizar pedido"
4. `handleIrParaCarrinho()` navega para `/${company_slug}` com `state: { openCart: true }`
5. Usuário volta para o cardápio com modal do carrinho aberto

### Problema Adicional: Navegação Endereço → Pagamento
1. Usuário está na etapa de escolha de endereço no checkout
2. Clica em "Avançar" 
3. Sistema volta incorretamente para o cardápio
4. Na segunda tentativa, finalmente vai para formas de pagamento
5. Comportamento inconsistente causa confusão no usuário

### Fluxo Correto (Desejado)
1. Usuário adiciona produto ao carrinho
2. Navega para `/produto-adicionado`
3. Clica em "Finalizar pedido"
4. Navega diretamente para o checkout (modal ou página)
5. Usuário pode finalizar o pedido sem voltar ao cardápio

### Fluxo Correto: Endereço → Pagamento
1. Usuário está na etapa de escolha de endereço
2. Seleciona endereço e clica em "Avançar"
3. Sistema navega diretamente para formas de pagamento
4. Dados do endereço são preservados
5. Fluxo continua sem interrupções

## Componentes e Interfaces

### Componentes Afetados

#### 1. `ProdutoAdicionado.tsx`
- **Localização**: `src/pages/ProdutoAdicionado.tsx`
- **Função Problemática**: `handleIrParaCarrinho()`
- **Mudança Necessária**: Alterar navegação para ir direto ao checkout

#### 2. `CardapioPublico.tsx`
- **Localização**: `src/pages/CardapioPublico.tsx`
- **Mudança Necessária**: Implementar lógica para abrir checkout diretamente quando receber parâmetro específico

#### 3. Componentes de Checkout Existentes
- `CartModal.tsx` - Modal do carrinho
- `CheckoutModal.tsx` - Modal de checkout
- `AutoatendimentoCarrinho.tsx` - Carrinho do autoatendimento

### Estados de Navegação

#### Opção 1: Usar State na Navegação
```typescript
navigate(`/${company_slug}`, { 
  state: { openCheckout: true },
  replace: true 
});
```

#### Opção 2: Usar Query Parameters
```typescript
navigate(`/${company_slug}?action=checkout`, { replace: true });
```

#### Opção 3: Rota Dedicada (Recomendada)
```typescript
navigate(`/${company_slug}/checkout`, { replace: true });
```

## Modelos de Dados

### Interface de Estado do Checkout
```typescript
interface CheckoutState {
  isOpen: boolean;
  step: 'cart' | 'delivery' | 'payment';
  deliveryInfo?: {
    tipo: 'delivery' | 'pickup';
    endereco?: CustomerAddress;
    taxaEntrega?: number;
  };
}
```

### Props dos Componentes
```typescript
interface CardapioPublicoProps {
  initialCheckoutState?: CheckoutState;
}
```

## Tratamento de Erros

### Cenários de Erro
1. **Carrinho Vazio**: Se usuário tentar ir para checkout com carrinho vazio
2. **Dados Inválidos**: Se informações do cliente estão incompletas
3. **Erro de Navegação**: Se navegação falhar

### Estratégias de Recuperação
1. **Carrinho Vazio**: Redirecionar para cardápio com mensagem
2. **Dados Inválidos**: Mostrar modal de identificação
3. **Erro de Navegação**: Fallback para modal do carrinho

## Estratégia de Testes

### Testes Unitários
1. **Componente ProdutoAdicionado**
   - Testar função `handleIrParaCarrinho()`
   - Verificar navegação correta
   - Testar com diferentes estados do carrinho

2. **Componente CardapioPublico**
   - Testar abertura automática do checkout
   - Verificar handling de parâmetros de estado
   - Testar fallbacks para estados inválidos

### Testes de Integração
1. **Fluxo Completo**
   - Adicionar produto → Finalizar pedido → Checkout
   - Verificar que não volta para cardápio
   - Testar com diferentes tipos de produtos

2. **Cenários de Erro**
   - Carrinho vazio
   - Dados de cliente inválidos
   - Problemas de conectividade

### Testes E2E
1. **Jornada do Usuário**
   - Simular fluxo completo de compra
   - Verificar que checkout abre diretamente
   - Testar em diferentes dispositivos

## Implementação Recomendada

### Abordagem Escolhida: Rota Dedicada + State Management

1. **Criar rota `/checkout`** para cada empresa
2. **Modificar `ProdutoAdicionado`** para navegar para a nova rota
3. **Implementar componente `CheckoutPage`** que gerencia o fluxo completo
4. **Manter compatibilidade** com modal existente para outros fluxos

### Vantagens desta Abordagem
- **URL Limpa**: Usuário pode bookmarkar ou compartilhar
- **Navegação Clara**: Botão voltar funciona corretamente
- **Separação de Responsabilidades**: Checkout independente do cardápio
- **Melhor UX**: Fluxo linear sem confusão

### Estrutura de Arquivos
```
src/
├── pages/
│   ├── CardapioPublico.tsx (modificado)
│   ├── ProdutoAdicionado.tsx (modificado)
│   └── CheckoutPage.tsx (novo)
├── components/
│   └── cardapio/public/
│       ├── CheckoutModal.tsx (reutilizado)
│       └── CartModal.tsx (reutilizado)
└── router/
    └── PublicRoutes.tsx (modificado)
```

## Considerações de Performance

### Otimizações
1. **Lazy Loading**: Carregar componentes de checkout sob demanda
2. **State Persistence**: Manter estado do carrinho durante navegação
3. **Preload**: Pré-carregar dados necessários para checkout

### Métricas
1. **Time to Interactive**: Tempo para checkout estar pronto
2. **Bundle Size**: Impacto no tamanho do bundle
3. **Memory Usage**: Uso de memória durante navegação

## Compatibilidade

### Navegadores Suportados
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Dispositivos
- Desktop: Funcionalidade completa
- Tablet: Interface otimizada
- Mobile: Interface responsiva

### Fallbacks
- JavaScript desabilitado: Formulário básico
- Conexão lenta: Loading states
- Erro de API: Mensagens de erro claras