# Sistema de Prompts Dinâmicos - AI Agent

Este documento descreve como rodar localmente e gerenciar o sistema de prompts dinâmicos para agentes IA.

## 🚀 Como Rodar Localmente

### 1. Configurar Supabase Local
```bash
# Iniciar Supabase local
supabase start

# Aplicar migrações
supabase db reset
```

### 2. Configurar Secrets do Edge Config
No Supabase Dashboard → Edge Functions → Secrets, adicione:
- `EDGE_CONFIG_URL`: URL do seu Edge Config da Vercel
- `EDGE_CONFIG_TOKEN`: Token de acesso do Edge Config  
- `EDGE_CONFIG_READ`: Token de leitura do Edge Config

### 3. Testar o Sistema

#### 3.1 Criar um Prompt
```sql
INSERT INTO ai_agent_prompts (agent_slug, template, vars) 
VALUES (
    'agente-ia-conversa',
    'Olá! Sou {{agent_name}} da {{company_name}}. {{greeting_message}}',
    '{"agent_name": "Maria", "company_name": "MinhaLoja", "greeting_message": "Como posso ajudar?"}'
);
```

#### 3.2 Verificar Trigger
O trigger deve automaticamente chamar a edge function `push_prompt_to_edge`.

#### 3.3 Testar Edge Function
```bash
curl -X POST "http://localhost:54321/functions/v1/agente-ia-conversa" \
  -H "Content-Type: application/json" \
  -d '{
    "slug_empresa": "test",
    "user_message": "oi",
    "historico": [],
    "customer_phone": "5511999999999"
  }'
```

## 🎛️ Como Usar a Interface Admin

### Acessar o Editor
1. Navegue para `/admin/agents/agente-ia-conversa`
2. Edite o template usando sintaxe Mustache: `{{variavel}}`
3. Configure as variáveis no campo JSON
4. Ajuste as flags do agente
5. Clique em "Salvar" para aplicar

### Testar Prompt
1. Clique no botão "Testar"
2. Veja a resposta gerada
3. Ajuste conforme necessário

### Histórico e Reversão
1. Clique em "Histórico" para ver versões anteriores
2. Use "Reverter" para voltar a uma versão específica
3. Salve para aplicar a reversão

## 🔄 Fluxo de Sincronização

```
1. Usuário edita prompt na interface /admin/agents/:slug
2. Sistema salva em ai_agent_prompts
3. Trigger SQL executa automaticamente
4. Chama push_prompt_to_edge
5. Edge Config é atualizado
6. Próximas conversas usam novo prompt
```

## 📊 Staging vs Produção

### Staging
```bash
# Verificar se Edge Config foi atualizado
vercel env ls

# Testar endpoint
curl https://[projeto].vercel.app/api/chat-test
```

### Produção
1. Aplicar migração no Supabase produção
2. Fazer deploy das edge functions
3. Configurar secrets de produção
4. Fazer deploy do frontend

## 🛠️ Como Reverter

### Reverter pela Interface
1. Acesse `/admin/agents/:slug`
2. Clique em "Histórico"
3. Selecione a versão desejada
4. Clique em "Reverter"
5. Salve para aplicar

### Reverter via SQL
```sql
-- Ver histórico
SELECT * FROM ai_prompt_history 
WHERE agent_id = (
  SELECT id FROM ai_agent_prompts 
  WHERE agent_slug = 'agente-ia-conversa'
) 
ORDER BY version DESC;

-- Reverter para versão específica
UPDATE ai_agent_prompts 
SET 
  template = (SELECT template FROM ai_prompt_history WHERE version = 2),
  vars = (SELECT vars FROM ai_prompt_history WHERE version = 2)
WHERE agent_slug = 'agente-ia-conversa';
```

## 🔧 Troubleshooting

### Edge Config não atualiza
1. Verificar logs da edge function `push_prompt_to_edge`
2. Confirmar secrets `EDGE_CONFIG_*` configurados
3. Testar manualmente: `supabase functions invoke push_prompt_to_edge`

### Trigger não dispara
```sql
-- Verificar se trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trg_push_prompt';

-- Recriar se necessário
DROP TRIGGER IF EXISTS trg_push_prompt ON ai_agent_prompts;
CREATE TRIGGER trg_push_prompt
  AFTER INSERT OR UPDATE ON ai_agent_prompts
  FOR EACH ROW EXECUTE FUNCTION notify_edge();
```

### Template não renderiza
- Verificar sintaxe das variáveis: `{{nome_variavel}}`
- Confirmar JSON válido no campo vars
- Testar template na interface de admin

## 📝 Variáveis Disponíveis

- `{{company_slug}}` - Slug da empresa
- `{{agent_name}}` - Nome do assistente
- `{{company_name}}` - Nome da empresa  
- `{{menu_data}}` - Cardápio formatado
- `{{personality}}` - Personalidade configurada
- `{{sales_phrases}}` - Frases de venda
- `{{link_cardapio}}` - Link do cardápio

## 🎯 Smoke Tests

### Teste Completo
1. Editar prompt na interface
2. Verificar `updated_at` na tabela `ai_agent_prompts`  
3. Enviar mensagem de teste
4. Confirmar que resposta usa novo template
5. Verificar `version` incrementada no histórico