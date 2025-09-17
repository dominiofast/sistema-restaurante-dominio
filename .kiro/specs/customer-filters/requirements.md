# Requirements Document

## Introduction

Esta funcionalidade visa adicionar filtros avançados à página de clientes, permitindo aos usuários filtrar e encontrar clientes específicos com base em diferentes critérios como período de cadastro, localização, status de atividade, e outras características relevantes.

## Requirements

### Requirement 1

**User Story:** Como um usuário do sistema, eu quero filtrar clientes por período de cadastro, para que eu possa encontrar clientes cadastrados em datas específicas.

#### Acceptance Criteria

1. WHEN o usuário seleciona uma data "de" THEN o sistema SHALL mostrar apenas clientes cadastrados a partir dessa data
2. WHEN o usuário seleciona uma data "até" THEN o sistema SHALL mostrar apenas clientes cadastrados até essa data
3. WHEN o usuário seleciona ambas as datas THEN o sistema SHALL mostrar clientes cadastrados no período especificado
4. WHEN o usuário limpa os filtros de data THEN o sistema SHALL mostrar todos os clientes

### Requirement 2

**User Story:** Como um usuário do sistema, eu quero filtrar clientes por status de atividade (ativos, inativos, potenciais), para que eu possa focar em segmentos específicos da minha base.

#### Acceptance Criteria

1. WHEN o usuário seleciona "Ativos" THEN o sistema SHALL mostrar apenas clientes com pedidos nos últimos 30 dias
2. WHEN o usuário seleciona "Inativos" THEN o sistema SHALL mostrar apenas clientes sem pedidos há mais de 30 dias
3. WHEN o usuário seleciona "Potenciais" THEN o sistema SHALL mostrar apenas clientes que nunca fizeram pedidos
4. WHEN o usuário seleciona múltiplos status THEN o sistema SHALL mostrar clientes que atendem qualquer um dos critérios

### Requirement 3

**User Story:** Como um usuário do sistema, eu quero filtrar clientes por período de nascimento, para que eu possa criar campanhas direcionadas por faixa etária.

#### Acceptance Criteria

1. WHEN o usuário seleciona uma data "de" para nascimento THEN o sistema SHALL mostrar clientes nascidos a partir dessa data
2. WHEN o usuário seleciona uma data "até" para nascimento THEN o sistema SHALL mostrar clientes nascidos até essa data
3. WHEN o usuário combina ambas as datas THEN o sistema SHALL mostrar clientes nascidos no período especificado

### Requirement 4

**User Story:** Como um usuário do sistema, eu quero filtrar clientes com saldos negativos de cashback, para que eu possa identificar clientes que devem dinheiro.

#### Acceptance Criteria

1. WHEN o usuário marca "Apenas saldos negativos" THEN o sistema SHALL mostrar apenas clientes com cashback negativo
2. WHEN o usuário desmarca a opção THEN o sistema SHALL mostrar todos os clientes independente do saldo

### Requirement 5

**User Story:** Como um usuário do sistema, eu quero filtrar clientes por quantidade de pedidos, para que eu possa segmentar por frequência de compra.

#### Acceptance Criteria

1. WHEN o usuário seleciona "Nenhum pedido" THEN o sistema SHALL mostrar clientes com 0 pedidos
2. WHEN o usuário seleciona "1-5 pedidos" THEN o sistema SHALL mostrar clientes com 1 a 5 pedidos
3. WHEN o usuário seleciona "5+ pedidos" THEN o sistema SHALL mostrar clientes com mais de 5 pedidos

### Requirement 6

**User Story:** Como um usuário do sistema, eu quero limpar todos os filtros de uma vez, para que eu possa rapidamente voltar à visualização completa.

#### Acceptance Criteria

1. WHEN o usuário clica em "Limpar Filtros" THEN o sistema SHALL remover todos os filtros aplicados
2. WHEN os filtros são limpos THEN o sistema SHALL mostrar todos os clientes
3. WHEN os filtros são limpos THEN o sistema SHALL resetar a paginação para a primeira página

### Requirement 7

**User Story:** Como um usuário do sistema, eu quero que os filtros sejam aplicados automaticamente conforme eu os seleciono, para que eu tenha feedback imediato dos resultados.

#### Acceptance Criteria

1. WHEN o usuário modifica qualquer filtro THEN o sistema SHALL aplicar o filtro automaticamente
2. WHEN os filtros são aplicados THEN o sistema SHALL atualizar a contagem de resultados
3. WHEN os filtros são aplicados THEN o sistema SHALL resetar para a primeira página