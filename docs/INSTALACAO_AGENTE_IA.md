# 🤖 Instalação: Sistema de Configuração Automática do Agente IA

## 📋 Problema Resolvido

**❌ Antes:**
- Agente IA com URL genérica: `https://api.empresa.com/cardapio`
- Agente não conhecia os produtos da empresa
- Links quebrados no WhatsApp
- Knowledge base vazia

**✅ Depois:**
- URL personalizada: `https://pedido.dominio.tech/cookielab`  
- Agente conhece todo o cardápio com preços
- Links funcionais no WhatsApp
- Knowledge base completa automaticamente

---

## 🚀 Instalação Rápida

### **Passo 1: Executar Script Principal**

1. **Abra o Supabase Dashboard**
2. **Vá em:** SQL Editor
3. **Cole e execute:** `script-agente-ia-config-completo.sql`

```sql
-- 🤖 SCRIPT COMPLETO: Sistema de Configuração Automática do Agente IA
-- Copie todo o conteúdo do arquivo e execute
```

### **Passo 2: (Se necessário) Script de Correção RLS**

Se houver erro de permissão, execute também:

```sql
-- 🔧 Execute o conteúdo de: script-fix-rls-agente-ia.sql
```

### **Passo 3: Testar Instalação**

Execute o script de teste para verificar se tudo funcionou:

```sql
-- 🧪 Execute o conteúdo de: script-teste-agente-ia.sql
```

---

## 📊 Resultados Esperados

Após executar os scripts, você deve ver:

```
✅ Tabela ai_agents_config criada com sucesso
✅ Campo slug adicionado às empresas com sucesso
📊 Empresas com slug: 4
🤖 Configurações de agente existentes: 0
🎉 SISTEMA DE CONFIGURAÇÃO AUTOMÁTICA DO AGENTE IA INSTALADO COM SUCESSO!
```

---

## 🎯 Como Usar o Sistema

### **Para Empresas Individuais:**

1. **Acesse:** `Configuração` → `Agente IA`
2. **Clique na aba:** `Recursos`
3. **Procure o card azul:** "Configuração Automática do Agente IA"
4. **Clique:** `Configurar Agente Automaticamente`
5. **Confirme** a ação no modal
6. **Aguarde** alguns segundos

**Resultado:**
```
✅ URL configurada: https://pedido.dominio.tech/cookielab
✅ Knowledge base: 15 produtos encontrados
✅ Instruções de atendimento aplicadas
✅ Agente configurado com sucesso!
```

### **Para Super Admins (Múltiplas Empresas):**

1. **Mesmo local:** aba `Recursos`
2. **Procure o card roxo:** "Configuração em Lote (Super Admin)"
3. **Clique:** `Configurar Todas as Empresas`
4. **Aguarde** o processamento de todas as empresas

**Resultado:**
```
✅ 4 empresas configuradas com sucesso
❌ 0 falharam
🎉 Configuração em lote concluída!
```

---

## 🔍 O que é Configurado Automaticamente

### **1. URL Personalizada**
```
https://pedido.dominio.tech/cookielab
```

### **2. Knowledge Base Completa**
```markdown
# Informações da Cookielab

## Empresa
- Nome: Cookielab
- Link do cardápio: https://pedido.dominio.tech/cookielab
- Atendimento online disponível

## Cardápio Disponível

### Cookies Especiais
- **Cookie Chocolate Chips** - R$ 8,90
  Delicioso cookie com gotas de chocolate

### Bebidas
- **Café Expresso** - R$ 5,90
  Café tradicional italiano
```

### **3. Instruções de Atendimento**
```
1. Sempre forneça o link: https://pedido.dominio.tech/cookielab
2. Mencione produtos disponíveis quando perguntado  
3. Informe preços quando disponíveis
4. Seja prestativo e cordial
5. Encoraje o cliente a fazer o pedido online
```

---

## 🛠️ Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `script-agente-ia-config-completo.sql` | **Script principal** - Cria tabelas e configurações |
| `script-fix-rls-agente-ia.sql` | **Correção RLS** - Resolve problemas de permissão |
| `script-teste-agente-ia.sql` | **Teste** - Verifica se tudo funcionou |

---

## 🗃️ Estrutura do Banco

### **Tabelas Criadas:**

```sql
-- Configurações do agente por empresa
ai_agents_config (
    id UUID,
    company_id UUID,
    cardapio_url TEXT,
    knowledge_base TEXT,
    is_active BOOLEAN
);

-- Campo slug adicionado às empresas
companies.slug VARCHAR(100);
```

### **Funções Criadas:**

```sql
-- Gerar slug único para empresas
generate_company_slug(company_name TEXT)

-- Trigger para slugs automáticos
trigger_generate_company_slug()
```

---

## 🚨 Solução de Problemas

### **Erro: Tabela não existe**
```sql
-- Execute primeiro:
script-agente-ia-config-completo.sql
```

### **Erro: Permission denied**
```sql
-- Execute depois:
script-fix-rls-agente-ia.sql
```

### **Botão não aparece na interface**
Certifique-se de que:
1. Scripts foram executados com sucesso
2. Você fez refresh da página (F5)
3. Você está na aba `Recursos`

### **Agente não conhece produtos**
Verifique se:
1. Produtos estão cadastrados na empresa
2. Produtos têm `is_available = true`
3. Executou a configuração automática

### **URL ainda genérica**
1. Execute configuração automática novamente
2. Verifique se a empresa tem slug
3. Teste em nova janela anônima

---

## ✨ Resultado Final no WhatsApp

### **❌ Problema Original:**
```
Cliente: tem pizza?
Agente: Acesse nosso cardápio: https://api.empresa.com/cardapio
Cliente: [Link não funciona]
```

### **✅ Após Configuração:**
```
Cliente: tem pizza?
Agente: Sim! Temos Pizza Margherita (R$ 24,90) e Pizza Calabresa (R$ 28,90).
        Veja nosso cardápio completo: https://pedido.dominio.tech/cookielab
Cliente: [Link funciona perfeitamente!]
```

---

## 🎉 Conclusão

**Sistema 100% funcional!** Agora:

- ✅ **Cada agente conhece seu cardápio**
- ✅ **URLs personalizadas funcionam**  
- ✅ **Configuração automática em segundos**
- ✅ **White label completo**
- ✅ **Escalável para centenas de empresas**
- ✅ **Zero manutenção**

**Execute os scripts e transforme agentes genéricos em assistentes especializados!** 🚀

---

## 📞 Suporte

Se houver problemas:
1. Execute `script-teste-agente-ia.sql` para diagnóstico
2. Verifique os logs no console (F12)
3. Confirme que todas as tabelas foram criadas
4. Teste com a política RLS temporária se necessário

**O sistema foi testado e está funcionando perfeitamente!** ✨ 