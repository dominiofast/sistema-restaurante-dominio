# Integração Firecrawl para Importação de Cardápios do iFood

## Visão Geral

Esta integração substitui o sistema anterior de web scraping (ScrapingBee) pela API moderna do [Firecrawl](https://www.firecrawl.dev/), oferecendo melhor performance, confiabilidade e extração inteligente de dados.

## Vantagens do Firecrawl

- **Extração Inteligente**: Usa LLM (Large Language Model) para entender e extrair dados de forma mais precisa
- **Melhor Performance**: 50x mais rápido que soluções tradicionais
- **Suporte a JavaScript**: Renderiza páginas dinâmicas automaticamente
- **Fallback Robusto**: Se a extração LLM falhar, usa seletores CSS como backup
- **API Moderna**: Interface RESTful simples e bem documentada

## Configuração

### 1. Obter Chave da API do Firecrawl

1. Acesse [https://www.firecrawl.dev/](https://www.firecrawl.dev/)
2. Crie uma conta ou faça login
3. Vá para a seção "API Keys"
4. Copie sua chave da API

### 2. Configurar no Banco de Dados

Execute o script SQL `setup-firecrawl-api.sql` no seu banco Supabase:

```sql
-- Substitua 'SUA_CHAVE_API_AQUI' pela sua chave real
INSERT INTO app_settings (key, value, description, created_at, updated_at)
VALUES (
  'FIRECRAWL_API_KEY',
  'SUA_CHAVE_API_AQUI',
  'Chave da API do Firecrawl para web scraping de cardápios do iFood',
  NOW(),
  NOW()
)
ON CONFLICT (key) 
DO UPDATE SET 
  value = EXCLUDED.value,
  description = EXCLUDED.description,
  updated_at = NOW();
```

### 3. Deploy das Funções

As funções Supabase já estão atualizadas. Certifique-se de fazer o deploy:

```bash
supabase functions deploy ifood-import-preview
```

## Como Funciona

### 1. Extração Principal (LLM)

A função usa o modo `llm-extraction` do Firecrawl com:

- **Prompt Inteligente**: Instruções específicas para extrair dados de cardápios
- **Schema Estruturado**: Define exatamente quais campos extrair
- **Validação Automática**: Garante que os dados estejam no formato correto

### 2. Fallback (Seletores CSS)

Se a extração LLM falhar, o sistema automaticamente:

- Extrai o HTML da página
- Usa regex para encontrar elementos de produtos
- Aplica seletores CSS para extrair nome, preço, descrição e imagem

### 3. Processamento de Dados

- Validação de preços
- Limpeza de texto
- Normalização de dados
- Filtragem de itens inválidos

## Estrutura da API

### Endpoint: `/scrape`

```json
{
  "url": "https://www.ifood.com.br/delivery/restaurante",
  "pageOptions": {
    "waitFor": 5000,
    "screenshot": false,
    "pdf": false
  },
  "extractorOptions": {
    "mode": "llm-extraction",
    "extractionPrompt": "...",
    "extractionSchema": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "name": { "type": "string" },
              "description": { "type": "string" },
              "price": { "type": "number" },
              "image": { "type": "string" }
            },
            "required": ["name", "price"]
          }
        }
      },
      "required": ["items"]
    }
  }
}
```

## Resposta Esperada

```json
{
  "data": {
    "llm_extraction": {
      "items": [
        {
          "name": "Pizza Margherita",
          "description": "Molho de tomate, mussarela, manjericão",
          "price": 29.90,
          "image": "https://example.com/pizza.jpg"
        }
      ]
    }
  }
}
```

## Tratamento de Erros

### Erros Comuns

1. **Chave da API não configurada**
   - Solução: Configure a chave no banco de dados

2. **URL inválida**
   - Solução: Verifique se a URL é do iFood

3. **Nenhum item encontrado**
   - Possíveis causas:
     - Restaurante fechado
     - URL incorreta
     - Página com estrutura diferente
   - Solução: Verifique a URL e tente novamente

4. **Erro de rate limit**
   - Solução: Aguarde alguns minutos e tente novamente

### Logs de Debug

A função gera logs detalhados para facilitar o debug:

```
🚀 Iniciando preview com Firecrawl...
✅ URL recebida: https://www.ifood.com.br/delivery/restaurante
✅ Chave da API do Firecrawl obtida
📡 Chamando API do Firecrawl...
📊 Resposta do Firecrawl - Status: 200
✅ Dados recebidos do Firecrawl
✅ 15 itens extraídos via LLM
✅ 15 itens processados com sucesso
```

## Custos

O Firecrawl oferece:

- **Plano Gratuito**: 100 requests/mês
- **Planos Pagos**: A partir de $29/mês
- **Pay-per-use**: Disponível para uso ocasional

## Monitoramento

### Logs de Importação

Todas as importações são registradas na tabela `import_logs`:

```sql
SELECT 
  company_id,
  source_url,
  items_imported,
  status,
  created_at
FROM import_logs 
ORDER BY created_at DESC;
```

### Métricas de Sucesso

```sql
SELECT 
  status,
  COUNT(*) as total_imports,
  AVG(items_imported) as avg_items_per_import
FROM import_logs 
GROUP BY status;
```

## Troubleshooting

### Problema: "Chave da API não configurada"

```sql
-- Verificar se a chave existe
SELECT key, LENGTH(value) as key_length 
FROM app_settings 
WHERE key = 'FIRECRAWL_API_KEY';
```

### Problema: "Nenhum item encontrado"

1. Verifique se a URL está correta
2. Confirme se o restaurante está aberto
3. Teste a URL diretamente no navegador
4. Verifique os logs da função para mais detalhes

### Problema: "Erro de rate limit"

1. Aguarde alguns minutos
2. Verifique seu plano do Firecrawl
3. Considere fazer upgrade do plano se necessário

## Suporte

- **Documentação Firecrawl**: [https://www.firecrawl.dev/docs](https://www.firecrawl.dev/docs)
- **API Reference**: [https://www.firecrawl.dev/api](https://www.firecrawl.dev/api)
- **Status da API**: [https://status.firecrawl.dev](https://status.firecrawl.dev)

## Migração do ScrapingBee

Se você estava usando ScrapingBee anteriormente:

1. ✅ A função já foi atualizada
2. ✅ O modal já foi atualizado
3. ⚠️ Configure a nova chave do Firecrawl
4. ⚠️ Teste com algumas URLs para validar

A migração é transparente para o usuário final - apenas a performance e confiabilidade melhoram.

