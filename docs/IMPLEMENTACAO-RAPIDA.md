# ⚡ IMPLEMENTAÇÃO RÁPIDA - 4 PASSOS

## 🎯 OBJETIVO
Substituir o chat integrado por uma **extensão Chrome** que controla o assistente IA diretamente no WhatsApp Web.

---

## 📋 PASSO 1: BANCO DE DADOS (5 min)

**Execute no SQL Editor do Supabase:**
```sql
-- Copie TODO o conteúdo do arquivo: API-ENDPOINTS-EXTENSION.sql
-- Cole no SQL Editor e execute
```

**Resultado esperado:** `"ESTRUTURA PARA EXTENSÃO CHROME CRIADA COM SUCESSO!"`

---

## 🔧 PASSO 2: MODIFICAR WEBHOOK (10 min)

**No arquivo `api/webhook.js`**, adicione no início da função principal:

```javascript
// ADICIONAR após identificar o remetente:
async function isAssistantPaused(supabase, companyId, phone) {
  try {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const { data, error } = await supabase
      .rpc('get_assistant_status', {
        p_company_id: companyId,
        p_phone: cleanPhone
      });
    return data?.is_paused || false;
  } catch (error) {
    return false;
  }
}

// MODIFICAR o processamento da mensagem:
if (from && mensagemCliente) {
  // ... código de salvar mensagem ...
  
  // NOVA VERIFICAÇÃO:
  const assistantPaused = await isAssistantPaused(supabase, integration.company_id, from);
  
  if (assistantPaused) {
    console.log(`🔴 ASSISTENTE PAUSADO para ${from}`);
    return { statusCode: 200, body: JSON.stringify({ paused: true }) };
  }
  
  // Se não pausado, continuar processamento normal...
}
```

---

## 🌐 PASSO 3: CRIAR ENDPOINTS API (15 min)

**Criar 4 arquivos na pasta `api/`:**

### **`api/pause-assistant.js`:**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { phone, company_id, paused_by } = JSON.parse(event.body);
    
    const { data, error } = await supabase
      .rpc('pause_whatsapp_assistant', {
        p_company_id: company_id,
        p_phone: phone,
        p_paused_by: paused_by
      });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
```

### **`api/resume-assistant.js`:**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event, context) => {
  try {
    const { phone, company_id } = JSON.parse(event.body);
    
    const { data, error } = await supabase
      .rpc('resume_whatsapp_assistant', {
        p_company_id: company_id,
        p_phone: phone
      });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
```

### **`api/assistant-status.js`:**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event, context) => {
  try {
    const { phone, company_id } = event.queryStringParameters;
    
    const { data, error } = await supabase
      .rpc('get_assistant_status', {
        p_company_id: company_id,
        p_phone: phone
      });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
```

### **`api/customer-info.js`:**
```javascript
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

exports.handler = async (event, context) => {
  try {
    const { phone, company_id } = event.queryStringParameters;
    
    const { data, error } = await supabase
      .rpc('get_customer_info', {
        p_company_id: company_id,
        p_phone: phone
      });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
```

**Deploy:** `vercel --prod`

---

## 🔌 PASSO 4: EXTENSÃO CHROME (20 min)

### **4.1 - Criar pasta e arquivos:**
```bash
mkdir chrome-extension
cd chrome-extension
```

### **4.2 - Copiar arquivos:**
Copie TODOS os arquivos da pasta `EXEMPLO-CHROME-EXTENSION/` para `chrome-extension/`

### **4.3 - Testar extensão:**
1. **Abrir Chrome:** `chrome://extensions/`
2. **Ativar:** "Modo do desenvolvedor"  
3. **Clicar:** "Carregar sem compactação"
4. **Selecionar:** pasta `chrome-extension/`
5. **Resultado:** Extensão instalada ✅

### **4.4 - Configurar extensão:**
1. **Abrir:** WhatsApp Web
2. **Clicar:** ícone da extensão
3. **Configurar:**
   - **Company ID:** `[UUID da empresa]`
   - **Company Slug:** `[slug-da-empresa]`  
   - **API URL:** `https://conta.dominio.tech/api`
4. **Salvar** configurações

---

## 🧪 TESTE FINAL

### **Verificar se tudo funciona:**

1. **Abrir** WhatsApp Web
2. **Ver botão** "IA/MANUAL" no canto superior direito
3. **Selecionar** uma conversa  
4. **Clicar** botão para pausar IA
5. **Enviar mensagem** de teste (como cliente)
6. **Verificar:** IA não responde ✅
7. **Clicar** botão para retomar IA
8. **Enviar mensagem** novamente
9. **Verificar:** IA responde normalmente ✅

---

## ⚡ RESULTADO

**ANTES:**
- ❌ Chat com problemas de real-time
- ❌ Mensagens não chegando
- ❌ Interface duplicada  
- ❌ Complexidade técnica

**DEPOIS:**
- ✅ **Controle total** sobre IA
- ✅ **Interface nativa** WhatsApp Web
- ✅ **Dados do cliente** em tempo real
- ✅ **Templates rápidos**
- ✅ **Zero problemas técnicos**

---

## 🚀 IMPLEMENTAÇÃO TOTAL: ~50 MINUTOS

**Esta solução resolve TODOS os problemas atuais e adiciona funcionalidades extras!**

**MUITO SUPERIOR ao chat integrado!** 🎉
