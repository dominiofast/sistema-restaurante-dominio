# 🚀 Executar Agora - Firecrawl Configurado

## ✅ Chave da API Configurada

Sua chave da API do Firecrawl já está configurada:
**`fc-987060ceb5834d139f247bf55db7a249`**

## 🎯 Passos para Executar

### 1. Configurar no Banco de Dados

Execute este script no **SQL Editor do Supabase**:

```sql
-- Copie e cole este script no SQL Editor do Supabase
INSERT INTO app_settings (key, value, created_at, updated_at)
VALUES (
  'FIRECRAWL_API_KEY',
  'fc-987060ceb5834d139f247bf55db7a249',
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();
```

### 2. Deploy da Função

No terminal, na pasta do projeto:

```bash
supabase functions deploy ifood-import-preview
```

### 3. Testar a Integração

```bash
# Configure as variáveis de ambiente (substitua pelos seus valores)
export SUPABASE_URL="sua_url_supabase"
export SUPABASE_ANON_KEY="sua_chave_anonima"

# Execute o teste
node test-firecrawl-integration.js
```

## 🧪 Teste Rápido

Após o deploy, você pode testar diretamente na interface:

1. **Acesse** o Gestor do Cardápio
2. **Clique** em "Importar do iFood"
3. **Cole** uma URL do iFood
4. **Clique** em "Analisar Cardápio"

## 📊 Verificar Configuração

Para verificar se tudo está funcionando:

```sql
-- Execute no SQL Editor
SELECT 
  key,
  CASE 
    WHEN LENGTH(value) > 10 THEN CONCAT(LEFT(value, 10), '...')
    ELSE value 
  END as value_preview,
  description,
  created_at
FROM app_settings 
WHERE key = 'FIRECRAWL_API_KEY';
```

## 🎉 Resultado Esperado

Após executar os passos acima:

- ✅ Chave da API configurada no banco
- ✅ Função Supabase atualizada
- ✅ Interface pronta para uso
- ✅ Testes funcionando

## 🆘 Se algo der errado

### Erro: "Chave da API não configurada"
- Verifique se executou o script SQL
- Confirme se a tabela `app_settings` existe

### Erro: "Função não encontrada"
- Execute o deploy da função novamente
- Verifique se está na pasta correta do projeto

### Erro: "URL inválida"
- Use uma URL válida do iFood
- Confirme se o restaurante está aberto

---

**Status**: 🔑 Chave configurada e pronta para uso!
**Próximo**: Execute o script SQL e faça o deploy!
