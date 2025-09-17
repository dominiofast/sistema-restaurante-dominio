# Requirements Document

## Introduction

Este documento define os requisitos para implementar notificações automáticas via WhatsApp quando pedidos são criados no sistema. O problema atual é que os triggers do PostgreSQL não estão executando, impedindo o envio automático das notificações, mesmo com a API WhatsApp funcionando corretamente em testes manuais.

## Requirements

### Requirement 1

**User Story:** Como administrador do sistema, eu quero que notificações WhatsApp sejam enviadas automaticamente quando um pedido for criado, para que os clientes sejam informados imediatamente sobre o status do pedido.

#### Acceptance Criteria

1. WHEN um novo registro é inserido na tabela `pedido_itens` THEN o sistema SHALL enviar uma notificação WhatsApp automaticamente
2. WHEN a notificação é enviada THEN o sistema SHALL registrar o log da operação para auditoria
3. WHEN há erro no envio THEN o sistema SHALL registrar o erro e continuar funcionando
4. WHEN múltiplos itens são inseridos para o mesmo pedido THEN o sistema SHALL enviar apenas uma notificação por pedido

### Requirement 2

**User Story:** Como cliente, eu quero receber uma notificação WhatsApp imediatamente após fazer um pedido, para que eu saiba que meu pedido foi recebido e está sendo processado.

#### Acceptance Criteria

1. WHEN meu pedido é criado THEN eu SHALL receber uma mensagem WhatsApp com os detalhes do pedido
2. WHEN a mensagem é enviada THEN ela SHALL conter informações relevantes como número do pedido, itens e total
3. IF meu número de telefone estiver inválido THEN o sistema SHALL registrar o erro sem falhar
4. WHEN recebo a notificação THEN ela SHALL ser enviada através da integração WhatsApp configurada para a empresa

### Requirement 3

**User Story:** Como desenvolvedor, eu quero que o sistema de notificações seja robusto e confiável, para que funcione consistentemente mesmo com alto volume de pedidos.

#### Acceptance Criteria

1. WHEN triggers do PostgreSQL não funcionam THEN o sistema SHALL usar uma alternativa como webhooks ou processamento assíncrono
2. WHEN há falha na API WhatsApp THEN o sistema SHALL implementar retry automático com backoff exponencial
3. WHEN há múltiplas integrações WhatsApp ativas THEN o sistema SHALL usar a integração correta para cada empresa
4. WHEN o sistema está sob alta carga THEN as notificações SHALL ser processadas de forma assíncrona sem impactar a performance

### Requirement 4

**User Story:** Como administrador de empresa, eu quero poder monitorar e controlar as notificações WhatsApp da minha empresa, para garantir que estão funcionando corretamente.

#### Acceptance Criteria

1. WHEN acesso o painel administrativo THEN eu SHALL ver logs das notificações enviadas
2. WHEN há erro nas notificações THEN eu SHALL ser notificado sobre o problema
3. WHEN quero desabilitar notificações THEN eu SHALL poder fazer isso através do painel admin
4. WHEN há problemas com a integração WhatsApp THEN o sistema SHALL fornecer informações de debug detalhadas