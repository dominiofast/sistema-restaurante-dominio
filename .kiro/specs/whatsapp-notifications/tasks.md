# Implementation Plan

- [ ] 1. Criar estrutura de banco de dados para sistema de notificações
  - Criar tabela `notification_queue` para processamento assíncrono
  - Criar tabela `notification_logs` para auditoria e debugging
  - Criar índices otimizados para performance das queries
  - Escrever testes para verificar estrutura das tabelas
  - _Requirements: 1.2, 3.1, 4.4_

- [x] 2. Implementar função de trigger PostgreSQL otimizada



  - Criar função `send_whatsapp_notification_after_items()` com controle de duplicação
  - Implementar lógica para detectar primeiro item do pedido
  - Adicionar fallback automático para queue assíncrona em caso de falha
  - Implementar logs detalhados para debugging
  - Escrever testes unitários para a função de trigger
  - _Requirements: 1.1, 1.3, 3.1_

- [ ] 3. Criar trigger na tabela pedido_itens
  - Implementar trigger `trigger_whatsapp_notification` que executa após INSERT
  - Configurar trigger para executar apenas uma vez por pedido
  - Adicionar tratamento de erros robusto
  - Escrever testes de integração para o trigger
  - _Requirements: 1.1, 1.4_

- [ ] 4. Implementar cliente WhatsApp abstrato
  - Criar interface `WhatsAppClient` para abstração da API
  - Implementar classe `WhatsAppClientImpl` com integração real
  - Adicionar validação de números de telefone
  - Implementar rate limiting e tratamento de erros
  - Escrever testes unitários para o cliente WhatsApp
  - _Requirements: 2.1, 2.3, 3.3_

- [ ] 5. Desenvolver serviço de notificações assíncronas
  - Criar classe `WhatsAppNotificationService` para processamento da queue
  - Implementar método `processQueue()` para processar notificações pendentes
  - Adicionar lógica de retry com backoff exponencial
  - Implementar método `sendWhatsAppNotification()` para envio individual
  - Escrever testes unitários para o serviço de notificações
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 6. Implementar sistema de retry inteligente
  - Criar função `calculateBackoff()` para backoff exponencial
  - Implementar método `scheduleRetry()` para reagendar notificações falhadas
  - Adicionar limite máximo de tentativas configurável
  - Implementar lógica para marcar notificações como falha definitiva
  - Escrever testes para diferentes cenários de retry
  - _Requirements: 3.2, 3.4_

- [ ] 7. Criar sistema de templates de mensagem
  - Implementar modelo `MessageTemplate` para templates personalizáveis
  - Criar função para renderizar templates com dados do pedido
  - Adicionar suporte a variáveis dinâmicas (nome, pedido, total, etc.)
  - Implementar templates padrão para diferentes tipos de notificação
  - Escrever testes para renderização de templates
  - _Requirements: 2.2, 2.4_

- [ ] 8. Implementar configuração por empresa
  - Criar modelo `WhatsAppConfig` para configurações específicas por empresa
  - Implementar método `getIntegrationConfig()` para buscar configuração
  - Adicionar suporte a múltiplas integrações WhatsApp
  - Implementar validação de configurações
  - Escrever testes para configurações multi-empresa
  - _Requirements: 2.4, 3.3, 4.3_

- [ ] 9. Desenvolver sistema de logs e auditoria
  - Implementar função para registrar logs detalhados de notificações
  - Criar estrutura de logs com diferentes níveis (success, error, retry)
  - Adicionar logs de performance e métricas
  - Implementar limpeza automática de logs antigos
  - Escrever testes para sistema de logging
  - _Requirements: 1.2, 4.1, 4.4_

- [ ] 10. Criar worker para processamento assíncrono
  - Implementar worker Node.js para processar queue de notificações
  - Adicionar agendamento automático para processamento periódico
  - Implementar graceful shutdown e tratamento de sinais
  - Adicionar monitoramento de saúde do worker
  - Escrever testes de integração para o worker
  - _Requirements: 3.1, 3.4_

- [ ] 11. Implementar sistema de monitoramento
  - Criar métricas para taxa de sucesso de notificações
  - Implementar alertas para falhas consecutivas
  - Adicionar métricas de performance (latência, throughput)
  - Criar dashboard básico para visualização de métricas
  - Escrever testes para sistema de monitoramento
  - _Requirements: 4.1, 4.2, 4.4_

- [ ] 12. Desenvolver API de status e controle
  - Criar endpoint para consultar status de notificações
  - Implementar endpoint para reenviar notificações falhadas
  - Adicionar endpoint para configurar templates por empresa
  - Implementar autenticação e autorização para APIs
  - Escrever testes de API para todos os endpoints
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 13. Implementar testes de integração end-to-end
  - Criar testes que simulam criação de pedido completa
  - Testar fluxo trigger → queue → WhatsApp API
  - Implementar testes de falha e recuperação
  - Adicionar testes de performance com múltiplos pedidos
  - Criar testes para diferentes cenários de empresa
  - _Requirements: 1.1, 2.1, 3.1, 3.4_

- [ ] 14. Configurar deployment e infraestrutura
  - Configurar variáveis de ambiente para diferentes ambientes
  - Implementar scripts de migração de banco de dados
  - Configurar processo de deploy do worker assíncrono
  - Adicionar configuração de monitoramento em produção
  - Criar documentação de deployment e troubleshooting
  - _Requirements: 3.4, 4.2_

- [ ] 15. Implementar migração e rollback seguro
  - Criar script de migração dos triggers existentes
  - Implementar modo de compatibilidade com sistema antigo
  - Adicionar feature flags para ativar/desativar novo sistema
  - Criar plano de rollback em caso de problemas
  - Testar migração em ambiente de staging
  - _Requirements: 1.1, 3.1, 4.3_