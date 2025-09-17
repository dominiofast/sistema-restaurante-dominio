# 🔄 DIAGNÓSTICO: Agente IA em Loop

## 🚨 **PROBLEMA OBSERVADO**

**Na conversa do WhatsApp:**
```
Cliente: "Bom dia"
IA: "Bom dia! Aqui é a Cookielab. No momento estamos fechados..."

Cliente: "Oi não entendi" 
IA: "Olá! Sou o atendente virtual da Cookielab..."

Cliente: "Quero saber das promoções"
IA: "Temos ofertas especiais hoje na Cookielab!..."

Cliente: "Sim"
IA: "Ótimo! Estamos abertos agora e temos ofertas especiais hoje..."
```

**❌ PROBLEMAS DETECTADOS:**
1. **Loop infinito** - repete mesmas frases
2. **Não progride** na conversa
3. **Não fornece detalhes específicos**
4. **Perde contexto** entre mensagens
5. **Respostas genéricas** sem informações concretas

---

## 🔍 **CAUSAS IDENTIFICADAS**

### **1. CONFIGURAÇÃO GLOBAL INADEQUADA**
```sql
-- Configuração atual problemática:
max_tokens: 150        ❌ MUITO BAIXO (corta respostas)
temperature: 0.7       ⚠️ Pode gerar respostas similares
system_prompt: genérico ❌ Sem instruções específicas
```

### **2. FALTA DE KNOWLEDGE BASE ESPECÍFICA**
- ❌ Agente não conhece promoções reais
- ❌ Não tem acesso ao cardápio atualizado  
- ❌ Respostas vagas sem dados concretos
- ❌ Sem informações de horário, endereço, etc.

### **3. CONTEXTO DA CONVERSA**
- ❌ Não mantém histórico adequado
- ❌ Cada mensagem é tratada isoladamente
- ❌ Estado da conversa não persiste
- ❌ Memory de curto prazo inadequada

### **4. PROMPT SYSTEM DEFICIENTE**
- ❌ Instruções genéricas demais
- ❌ Sem guias de comportamento específicos
- ❌ Falta diretrizes para progressão da conversa

---

## 🎯 **SOLUÇÕES NECESSÁRIAS**

### **✅ 1. CORRIGIR CONFIGURAÇÕES GLOBAIS**
```sql
-- Configurações corretas:
max_tokens: 400-600     ✅ Respostas completas
temperature: 0.3-0.5    ✅ Mais consistente
system_prompt: específico ✅ Com instruções detalhadas
```

### **✅ 2. IMPLEMENTAR KNOWLEDGE BASE DINÂMICA**
- ✅ Carregar produtos reais da empresa
- ✅ Incluir promoções específicas com preços
- ✅ Dados de funcionamento, endereço, contato
- ✅ Atualização automática do cardápio

### **✅ 3. MELHORAR GESTÃO DE CONTEXTO**
- ✅ Salvar histórico de conversa
- ✅ Manter estado entre mensagens
- ✅ Context window maior
- ✅ Memory persistente por cliente

### **✅ 4. OTIMIZAR SYSTEM PROMPT**
- ✅ Instruções específicas de comportamento
- ✅ Guias para progressão da conversa
- ✅ Regras para evitar loops
- ✅ Respostas estruturadas

---

## 🚀 **SCRIPT DE CORREÇÃO**

Execute estas correções imediatamente:

### **PASSO 1: Corrigir Configuração Global**
```sql
UPDATE ai_global_config 
SET max_tokens = 500,
    temperature = 0.4,
    system_prompt = 'Você é um atendente virtual especializado. SEMPRE forneça informações específicas e concretas. NUNCA repita a mesma resposta. SEMPRE avance na conversa oferecendo opções ou detalhes específicos.'
WHERE is_active = true;
```

### **PASSO 2: Verificar Tabelas de Contexto**
```sql
-- Verificar se existe tabela de histórico
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'ai_conversation_logs';

-- Verificar configuração da empresa Cookielab
SELECT * FROM agente_ia_config 
WHERE company_id IN (
    SELECT id FROM companies WHERE name ILIKE '%cookielab%'
);
```

### **PASSO 3: Atualizar Edge Function**
- ✅ Aumentar context window
- ✅ Carregar produtos reais
- ✅ Implementar anti-loop logic
- ✅ Melhorar prompt instructions

---

## ⚠️ **AÇÃO URGENTE NECESSÁRIA**

1. **Execute o script SQL de correção**
2. **Atualize as configurações do agente**
3. **Teste com nova conversa**
4. **Monitore comportamento**

**O loop está acontecendo porque as configurações estão muito restritivas e o agente não tem dados concretos para trabalhar!** 