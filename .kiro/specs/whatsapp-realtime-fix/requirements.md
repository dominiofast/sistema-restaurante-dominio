# Requirements Document

## Introduction

Este documento define os requisitos para diagnosticar e corrigir o problema de atualização em tempo real das mensagens do WhatsApp no chat. Atualmente, as mensagens recebidas pelo WhatsApp não estão aparecendo instantaneamente na interface do chat, forçando os usuários a recarregar a página ou aguardar o polling para ver novas mensagens.

## Requirements

### Requirement 1

**User Story:** Como operador do chat WhatsApp, eu quero ver as mensagens recebidas instantaneamente na interface, para que eu possa responder rapidamente aos clientes sem precisar recarregar a página.

#### Acceptance Criteria

1. WHEN uma nova mensagem WhatsApp é recebida THEN ela SHALL aparecer na interface do chat em menos de 2 segundos
2. WHEN uma mensagem é enviada por mim THEN ela SHALL aparecer imediatamente na interface sem delay
3. WHEN há problemas de conexão THEN o sistema SHALL mostrar um indicador visual de status de conexão
4. WHEN a conexão é restabelecida THEN as mensagens perdidas SHALL ser sincronizadas automaticamente

### Requirement 2

**User Story:** Como administrador do sistema, eu quero que o sistema de tempo real seja confiável e robusto, para que funcione consistentemente mesmo com múltiplos usuários simultâneos.

#### Acceptance Criteria

1. WHEN múltiplos operadores estão usando o chat THEN cada um SHALL receber as atualizações em tempo real independentemente
2. WHEN há alta carga no sistema THEN as mensagens SHALL continuar sendo entregues em tempo real
3. WHEN há falha na conexão WebSocket THEN o sistema SHALL usar polling como fallback automaticamente
4. WHEN a conexão WebSocket é restabelecida THEN o sistema SHALL retornar ao modo tempo real automaticamente

### Requirement 3

**User Story:** Como desenvolvedor, eu quero identificar e corrigir os problemas específicos que impedem o funcionamento do tempo real, para garantir uma solução duradoura.

#### Acceptance Criteria

1. WHEN executo diagnósticos THEN o sistema SHALL identificar problemas de configuração do Supabase Realtime
2. WHEN há problemas de RLS (Row Level Security) THEN eles SHALL ser identificados e corrigidos
3. WHEN há problemas de filtros de company_id THEN eles SHALL ser otimizados para melhor performance
4. WHEN há memory leaks ou problemas de cleanup THEN eles SHALL ser identificados e corrigidos

### Requirement 4

**User Story:** Como usuário do chat, eu quero receber notificações visuais e sonoras quando novas mensagens chegam, para que eu não perca nenhuma comunicação importante.

#### Acceptance Criteria

1. WHEN uma nova mensagem é recebida THEN eu SHALL ver uma notificação visual discreta
2. WHEN uma mensagem é de alta prioridade THEN eu SHALL receber uma notificação mais proeminente
3. WHEN estou em outra aba THEN eu SHALL receber notificações do navegador (se permitido)
4. WHEN há múltiplas mensagens não lidas THEN o contador SHALL ser atualizado em tempo real

### Requirement 5

**User Story:** Como operador do chat, eu quero que o sistema mantenha o histórico de mensagens sincronizado, para que eu tenha contexto completo das conversas.

#### Acceptance Criteria

1. WHEN uma conversa é selecionada THEN todas as mensagens SHALL ser carregadas corretamente
2. WHEN há mensagens antigas THEN elas SHALL ser carregadas sob demanda (lazy loading)
3. WHEN uma mensagem é editada ou deletada THEN a mudança SHALL ser refletida em tempo real
4. WHEN há conflitos de sincronização THEN o sistema SHALL priorizar a versão mais recente do servidor