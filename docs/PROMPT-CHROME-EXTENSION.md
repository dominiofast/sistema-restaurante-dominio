# Chrome Extension para WhatsApp Web - Controle de Assistente IA

## 📋 BRIEFING DO PROJETO

Desenvolver uma extensão Chrome que se integra ao WhatsApp Web para permitir **pausar/retomar** o assistente de IA automatizado e fornecer informações do cliente em tempo real.

## 🎯 OBJETIVO PRINCIPAL

Criar um **botão de controle** no WhatsApp Web que permita pausar temporariamente as respostas automáticas do assistente IA, permitindo atendimento manual, com integração total ao sistema web existente.

## 🔧 FUNCIONALIDADES REQUERIDAS

### 1. **CONTROLE DO ASSISTENTE**
- ✅ **Botão "PAUSAR IA"** visível em cada conversa
- ✅ **Botão "RETOMAR IA"** para reativar automação  
- ✅ **Indicador visual** do status (ativo/pausado)
- ✅ **Persistência** do status por conversa

### 2. **SIDEBAR COM INFORMAÇÕES**
- 📊 **Dados do cliente:**
  - Nome completo
  - Histórico de pedidos (últimos 5)
  - Cashback disponível  
  - Total gasto
  - Dias desde último pedido
- 📱 **Status da conversa:**
  - IA ativa/pausada
  - Última mensagem recebida
  - Tempo de resposta médio

### 3. **TEMPLATES RÁPIDOS**
- 🍕 **Cardápio:** Link direto personalizado
- ⏰ **Horário:** Status funcionamento atual
- 🚚 **Entrega:** Informações de entrega
- 💰 **Cashback:** Saldo disponível do cliente
- 📋 **Pedidos:** Status do último pedido

### 4. **NOTIFICAÇÕES**
- 🔔 **Nova mensagem** quando IA pausada
- ⚠️ **Tempo sem resposta** (alertas configuráveis)
- 📊 **Métricas** de atendimento

## 🌐 INTEGRAÇÃO COM API

### **ENDPOINTS NECESSÁRIOS:**

#### 1. **Controle do Assistente**
```javascript
// Pausar IA para um número específico
POST /api/whatsapp/pause-assistant
{
  "phone": "5569999999999",
  "company_id": "uuid",
  "paused_by": "operador@email.com"
}

// Retomar IA
POST /api/whatsapp/resume-assistant  
{
  "phone": "5569999999999",
  "company_id": "uuid"
}

// Verificar status
GET /api/whatsapp/assistant-status?phone=5569999999999&company_id=uuid
```

#### 2. **Dados do Cliente**
```javascript
GET /api/whatsapp/customer-info?phone=5569999999999&company_id=uuid
// Retorna: nome, pedidos, cashback, etc.
```

#### 3. **Templates**
```javascript
GET /api/whatsapp/templates?company_id=uuid
// Retorna: cardápio_url, horario_funcionamento, mensagens_padrão
```

## 🔨 ESPECIFICAÇÕES TÉCNICAS

### **TECNOLOGIAS:**
- **Manifest V3** (Chrome Extension)
- **JavaScript ES6+** ou TypeScript
- **CSS3** para interface
- **Fetch API** para comunicação
- **Chrome Storage API** para persistência local

### **ESTRUTURA DE ARQUIVOS:**
```
extension/
├── manifest.json
├── content-script.js    // Injeção no WhatsApp Web
├── popup.html          // Interface configuração  
├── popup.js           // Lógica da popup
├── background.js      // Service worker
├── styles.css         // Estilos da interface
└── icons/            // Ícones da extensão
```

### **PONTOS DE INJEÇÃO:**
- **Chat principal:** Botões de controle
- **Sidebar direita:** Informações do cliente  
- **Área de digitação:** Templates rápidos
- **Header do chat:** Status visual

## 🎨 INTERFACE VISUAL

### **BOTÃO PRINCIPAL:**
```css
/* Botão integrado ao design do WhatsApp */
.ia-control-button {
  background: #25D366; /* Verde WhatsApp quando ativo */
  background: #FF6B6B; /* Vermelho quando pausado */
  border-radius: 50%;
  width: 40px;
  height: 40px;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}
```

### **SIDEBAR:**
```css
.customer-sidebar {
  width: 300px;
  background: #f0f2f5;
  border-left: 1px solid #e1e1e1;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
```

## 📊 FLUXO DE FUNCIONAMENTO

### **1. INICIALIZAÇÃO:**
```javascript
1. Extension detecta WhatsApp Web
2. Injeta botões e interface
3. Identifica número do chat atual
4. Consulta API para status do assistente
5. Atualiza interface visual
```

### **2. PAUSE/RESUME:**
```javascript
1. Usuário clica "PAUSAR IA"
2. Extension faz POST /api/whatsapp/pause-assistant
3. Sistema marca conversa como "pausada" no banco
4. Webhook para de processar mensagens deste número
5. Interface mostra status "PAUSADO"
```

### **3. INFORMAÇÕES CLIENTE:**
```javascript
1. Extension detecta mudança de chat
2. Extrai número do telefone
3. Consulta GET /api/whatsapp/customer-info  
4. Atualiza sidebar com dados
5. Carrega templates específicos da empresa
```

## 🔒 SEGURANÇA E AUTENTICAÇÃO

### **AUTENTICAÇÃO:**
- **JWT Token** armazenado no Chrome Storage
- **Login via popup** da extensão
- **Integração** com sistema de auth existente
- **Timeout automático** de sessão

### **PERMISSÕES NECESSÁRIAS:**
```json
{
  "permissions": [
    "activeTab",
    "storage", 
    "background",
    "scripting"
  ],
  "host_permissions": [
    "*://web.whatsapp.com/*",
    "*://conta.dominio.tech/*"
  ]
}
```

## 🚀 FASES DE DESENVOLVIMENTO

### **FASE 1 - MVP (1 semana):**
- ✅ Botão pausar/retomar IA
- ✅ Integração básica com API
- ✅ Indicador visual de status

### **FASE 2 - Informações (1 semana):**  
- ✅ Sidebar com dados do cliente
- ✅ Histórico de pedidos
- ✅ Cashback e métricas

### **FASE 3 - Templates (3 dias):**
- ✅ Botões de resposta rápida
- ✅ Templates configuráveis
- ✅ Inserção automática no chat

### **FASE 4 - Polimento (2 dias):**
- ✅ Notificações e alertas
- ✅ Configurações avançadas  
- ✅ Testes finais

## 📱 EXEMPLO DE USO

### **CENÁRIO TÍPICO:**
```
1. Cliente envia mensagem no WhatsApp
2. IA responde automaticamente (situação normal)
3. Atendente vê que precisa intervenção manual
4. Clica "PAUSAR IA" na extensão
5. IA para de responder este cliente
6. Atendente conversa manualmente pelo WhatsApp Web
7. Resolve a situação específica
8. Clica "RETOMAR IA" 
9. IA volta a responder automaticamente
```

## 🎯 RESULTADO ESPERADO

Uma extensão que permita **controle total** sobre quando usar IA e quando usar atendimento humano, mantendo toda a automação funcionando normalmente, mas com flexibilidade para casos especiais.

**PERFEITA COMBINAÇÃO DE AUTOMAÇÃO + CONTROLE HUMANO!** 🚀

---

## 💻 INFORMAÇÕES TÉCNICAS DO SISTEMA ATUAL

- **Backend:** Supabase + Edge Functions
- **API Base:** `https://conta.dominio.tech/api/`  
- **Webhook WhatsApp:** `https://conta.dominio.tech/api/webhook`
- **Tabela controle:** `whatsapp_assistant_control` (a ser criada)
- **Auth:** JWT tokens compatíveis com sistema existente

**ESTE PROMPT ESTÁ PRONTO PARA PRODUÇÃO!** ✅
