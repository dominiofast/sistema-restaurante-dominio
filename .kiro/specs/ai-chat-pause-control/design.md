# Documento de Design - Controle de Pausa da IA no Chat

## Visão Geral

Este documento descreve o design técnico para implementar o controle seletivo de pausa da IA no sistema de chat WhatsApp. A funcionalidade permitirá que operadores pausem a IA para clientes específicos enquanto mantém o funcionamento normal para outros clientes.

O sistema atual já possui um botão de pausa que não funciona corretamente - a IA continua respondendo mesmo quando pausada. Esta implementação corrigirá esse problema e adicionará persistência do estado de pausa por cliente.

## Arquitetura

### Componentes Principais

1. **WhatsappChat Component** - Interface principal do chat
2. **AIService** - Serviço responsável pela geração de respostas
3. **Database Layer** - Persistência do estado de pausa
4. **Webhook Handler** - Processamento de mensagens recebidas
5. **Local Storage** - Cache local do estado de pausa

### Fluxo de Dados

```
Operador clica pausa → Estado salvo no DB + LocalStorage → 
Webhook verifica estado → IA não processa se pausado → 
Interface mostra status visual
```

## Componentes e Interfaces

### 1. Modificações no Banco de Dados

#### Tabela whatsapp_chats
Adicionar campo para controlar o estado de pausa por conversa:

```sql
ALTER TABLE whatsapp_chats 
ADD COLUMN ai_paused BOOLEAN DEFAULT FALSE;
```

### 2. Interface do Usuário (WhatsappChat.tsx)

#### Estado do Componente
```typescript
interface ChatPauseState {
  isAIPaused: boolean;
  pausedChats: Set<string>; // IDs dos chats pausados
}
```

#### Botão de Pausa/Retomar
- Localização: Header da conversa selecionada
- Estados visuais:
  - Pausado: Ícone Play + texto "Retomar IA" + cor vermelha
  - Ativo: Ícone Pause + texto "Pausar IA" + cor verde
- Tooltip explicativo do estado atual

#### Indicadores Visuais
- Badge no header da conversa mostrando status da IA
- Cor diferenciada na lista de conversas para chats pausados
- Toast notifications ao pausar/retomar

### 3. Serviço de IA (AIService)

#### Método de Verificação de Pausa
```typescript
async isAIPausedForChat(companyId: string, chatId: string): Promise<boolean>
```

#### Modificação no generateResponse
Adicionar verificação de pausa antes de processar:
```typescript
// Verificar se IA está pausada para este chat
const isPaused = await this.isAIPausedForChat(companyId, chatId);
if (isPaused) {
  console.log('IA pausada para chat:', chatId);
  return null;
}
```

### 4. Webhook Handler

#### Verificação de Pausa
O webhook deve verificar o estado de pausa antes de chamar a IA:

```typescript
// Verificar se IA está pausada para este chat
const { data: chatData } = await supabase
  .from('whatsapp_chats')
  .select('ai_paused')
  .eq('company_id', companyId)
  .eq('chat_id', chatId)
  .single();

if (chatData?.ai_paused) {
  console.log('IA pausada - não processando mensagem');
  return;
}
```

## Modelos de Dados

### Estado de Pausa Local
```typescript
interface ChatPauseState {
  chatId: string;
  isPaused: boolean;
  pausedAt: Date;
  pausedBy: string; // ID do operador
}
```

### Configuração de Persistência
```typescript
const AI_PAUSE_STORAGE_KEY = 'whatsapp:aiPaused:';

// Chaves no localStorage
// whatsapp:aiPaused:{chatId} = "true" | "false"
```

### Estrutura do Banco
```sql
-- Campo adicionado à tabela existente
whatsapp_chats.ai_paused: BOOLEAN DEFAULT FALSE
```

## Tratamento de Erros

### Cenários de Erro
1. **Falha ao salvar estado no banco**
   - Fallback: Manter apenas no localStorage
   - Exibir toast de aviso ao usuário

2. **Inconsistência entre localStorage e banco**
   - Priorizar estado do banco
   - Sincronizar localStorage automaticamente

3. **Falha na verificação de pausa**
   - Assumir IA ativa (comportamento seguro)
   - Log do erro para debugging

### Recuperação de Erros
```typescript
try {
  await updatePauseState(chatId, isPaused);
} catch (error) {
  console.error('Erro ao salvar estado:', error);
  toast.error('Erro ao salvar configuração de pausa');
  // Reverter estado local se necessário
  setIsAIPaused(!isPaused);
}
```

## Estratégia de Testes

### Testes Unitários
1. **Componente WhatsappChat**
   - Renderização correta dos estados de pausa
   - Alternância entre pausar/retomar
   - Persistência no localStorage

2. **AIService**
   - Verificação de pausa por chat
   - Bloqueio de resposta quando pausado
   - Funcionamento normal quando ativo

3. **Utilitários de Estado**
   - Sincronização localStorage ↔ banco
   - Recuperação de estado na inicialização

### Testes de Integração
1. **Fluxo Completo de Pausa**
   - Operador pausa chat → Estado salvo → IA não responde
   - Operador retoma chat → Estado atualizado → IA volta a responder

2. **Múltiplos Chats**
   - Pausar chat A → IA continua respondendo chat B
   - Alternar entre chats → Estado correto exibido

3. **Persistência**
   - Pausar chat → Recarregar página → Estado mantido
   - Reiniciar sistema → Estados recuperados corretamente

### Testes de Webhook
1. **Mensagem Recebida - Chat Pausado**
   - Webhook não chama IA
   - Mensagem salva normalmente no banco

2. **Mensagem Recebida - Chat Ativo**
   - Webhook processa normalmente
   - IA gera resposta

## Considerações de Performance

### Otimizações
1. **Cache Local**
   - Estados de pausa em memória durante sessão
   - Reduz consultas ao banco

2. **Consultas Eficientes**
   - Index no campo ai_paused
   - Consulta apenas quando necessário

3. **Sincronização Inteligente**
   - Sincronizar apenas quando estado muda
   - Debounce em mudanças rápidas

### Monitoramento
- Log de mudanças de estado para auditoria
- Métricas de uso da funcionalidade de pausa
- Alertas para falhas de sincronização

## Segurança

### Controle de Acesso
- Apenas operadores autenticados podem pausar/retomar
- Validação de permissões no backend

### Auditoria
- Log de quem pausou/retomou cada chat
- Timestamp de todas as mudanças de estado

### Validação
- Sanitização de parâmetros de entrada
- Verificação de existência do chat antes de pausar