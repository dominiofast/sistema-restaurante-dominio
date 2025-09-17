# Requirements Document

## Introduction

O sistema de cardápio digital apresenta inconsistências no funcionamento do fluxo de endereços entre diferentes lojas. Enquanto a Domínio Pizzas funciona corretamente, mostrando opções de entrega e retirada, outras lojas não conseguem carregar essas opções, resultando em uma experiência de checkout quebrada para os clientes.

O problema está relacionado à falta de registros na tabela `delivery_methods` ou configurações incorretas para algumas empresas, impedindo que os clientes finalizem seus pedidos.

## Requirements

### Requirement 1

**User Story:** Como cliente de qualquer loja no sistema, eu quero que as opções de entrega (delivery/retirada) sejam carregadas corretamente, para que eu possa finalizar meu pedido sem problemas.

#### Acceptance Criteria

1. WHEN um cliente acessa o checkout de qualquer loja THEN o sistema SHALL carregar as opções de entrega disponíveis
2. WHEN não existir registro na tabela delivery_methods para uma empresa THEN o sistema SHALL criar automaticamente um registro com configurações padrão
3. WHEN o sistema falhar ao criar configurações automáticas THEN o sistema SHALL usar valores padrão em memória para não quebrar o fluxo
4. WHEN uma loja tem apenas delivery habilitado THEN o sistema SHALL mostrar apenas opções de endereços de entrega
5. WHEN uma loja tem apenas pickup habilitado THEN o sistema SHALL mostrar apenas a opção de retirada no estabelecimento

### Requirement 2

**User Story:** Como administrador do sistema, eu quero que todas as lojas tenham configurações consistentes de métodos de entrega, para que não haja falhas no processo de checkout.

#### Acceptance Criteria

1. WHEN uma nova empresa é criada no sistema THEN o sistema SHALL automaticamente criar um registro na tabela delivery_methods
2. WHEN o sistema detectar uma empresa sem configurações de entrega THEN o sistema SHALL aplicar configurações padrão baseadas no tipo de negócio
3. WHEN houver erro ao acessar configurações de entrega THEN o sistema SHALL registrar o erro e usar fallbacks apropriados
4. WHEN configurações são atualizadas THEN o sistema SHALL invalidar caches e recarregar dados frescos

### Requirement 3

**User Story:** Como desenvolvedor, eu quero um sistema robusto de fallbacks para configurações de entrega, para que o checkout nunca falhe completamente por falta de configurações.

#### Acceptance Criteria

1. WHEN não for possível carregar configurações do banco THEN o sistema SHALL usar configurações padrão em memória
2. WHEN houver timeout na consulta de configurações THEN o sistema SHALL aplicar retry com backoff exponencial
3. WHEN todas as tentativas falharem THEN o sistema SHALL mostrar uma mensagem de erro clara e opções de contato
4. WHEN configurações estiverem inconsistentes THEN o sistema SHALL corrigir automaticamente e registrar o evento

### Requirement 4

**User Story:** Como cliente, eu quero que o sistema me informe claramente quando não há opções de entrega disponíveis, para que eu saiba como proceder.

#### Acceptance Criteria

1. WHEN nenhuma opção de entrega estiver disponível THEN o sistema SHALL mostrar uma mensagem explicativa clara
2. WHEN apenas uma opção estiver disponível THEN o sistema SHALL selecioná-la automaticamente
3. WHEN houver problemas temporários THEN o sistema SHALL oferecer opção de tentar novamente
4. WHEN o problema persistir THEN o sistema SHALL mostrar informações de contato da loja