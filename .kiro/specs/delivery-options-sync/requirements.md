# Requirements Document

## Introduction

Este documento define os requisitos para corrigir o problema de sincronização entre as configurações de formas de entrega de uma loja e as opções exibidas no cardápio digital. Atualmente, mesmo quando a opção "Retirada no estabelecimento" não está marcada como disponível nas configurações administrativas da loja, ela ainda aparece como opção disponível para os clientes no cardápio digital, causando inconsistência e possível confusão.

## Requirements

### Requirement 1

**User Story:** Como administrador de loja, eu quero que as opções de entrega configuradas nas configurações administrativas sejam refletidas exatamente no cardápio digital, para que os clientes vejam apenas as opções realmente disponíveis.

#### Acceptance Criteria

1. WHEN um administrador desabilita "Retirada no estabelecimento" nas configurações de formas de entrega THEN o sistema SHALL remover essa opção do cardápio digital imediatamente
2. WHEN um administrador habilita "Retirada no estabelecimento" nas configurações THEN o sistema SHALL exibir essa opção no cardápio digital
3. WHEN as configurações de entrega são alteradas THEN o cardápio digital SHALL ser atualizado em tempo real sem necessidade de recarregar a página

### Requirement 2

**User Story:** Como cliente, eu quero ver apenas as opções de entrega que estão realmente disponíveis para a loja, para que eu não tente selecionar uma opção indisponível.

#### Acceptance Criteria

1. WHEN eu acesso o cardápio digital THEN o sistema SHALL exibir apenas as formas de entrega habilitadas para aquela loja específica
2. WHEN uma forma de entrega não está disponível THEN o sistema SHALL NOT exibir essa opção na tela de finalização do pedido
3. IF apenas delivery estiver habilitado THEN o sistema SHALL exibir apenas a opção de delivery
4. IF apenas retirada no estabelecimento estiver habilitada THEN o sistema SHALL exibir apenas essa opção

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que o sistema valide as configurações de entrega antes de exibir as opções no frontend, para garantir consistência entre backend e frontend.

#### Acceptance Criteria

1. WHEN o cardápio digital é carregado THEN o sistema SHALL consultar as configurações atuais de entrega da loja
2. WHEN as configurações são alteradas no painel administrativo THEN o sistema SHALL invalidar o cache das opções de entrega
3. IF não houver nenhuma forma de entrega habilitada THEN o sistema SHALL exibir uma mensagem informativa ao cliente
4. WHEN há erro na consulta das configurações THEN o sistema SHALL exibir uma mensagem de erro apropriada

### Requirement 4

**User Story:** Como administrador de sistema, eu quero logs detalhados das alterações nas configurações de entrega, para poder rastrear problemas de sincronização.

#### Acceptance Criteria

1. WHEN configurações de entrega são alteradas THEN o sistema SHALL registrar um log com timestamp, usuário e alterações realizadas
2. WHEN há falha na sincronização entre configurações e cardápio THEN o sistema SHALL registrar um log de erro detalhado
3. WHEN o cardápio consulta as configurações de entrega THEN o sistema SHALL registrar essa consulta para auditoria