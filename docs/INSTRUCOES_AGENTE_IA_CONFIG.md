# 🤖 Sistema de Configuração Automática do Agente IA

## 📋 Visão Geral

O sistema de configuração automática do Agente IA resolve o problema de agentes que não conhecem o cardápio das empresas e fornecem links genéricos. Agora cada agente é configurado automaticamente com:

- ✅ URL personalizada da empresa (`https://pedido.dominio.tech/empresa-slug`)
- ✅ Cardápio completo com produtos e preços
- ✅ Knowledge base atualizada automaticamente
- ✅ Instruções de atendimento personalizadas

---

## 🚀 Como Usar

### **Para Empresas Individuais:**

1. **Acesse a página do Agente IA:**
   - Menu: `Configuração` → `Agente IA`
   - Clique na aba `Recursos`

2. **Configure automaticamente:**
   - Clique no botão azul: `Configurar Agente Automaticamente`
   - Confirme a ação no modal
   - Aguarde alguns segundos

3. **Resultado:**
   - URL corrigida: `https://pedido.dominio.tech/sua-empresa-slug`
   - Knowledge base completa com todos os produtos
   - Agente conhecerá preços e descrições

### **Para Super Admins (Múltiplas Empresas):**

1. **Acesse a configuração do Agente IA**
2. **Na aba Recursos**, encontre o card roxo: `Configuração em Lote`
3. **Clique em:** `Configurar Todas as Empresas`
4. **Aguarde o processamento** de todas as empresas ativas

---

## 🎯 O que é Configurado Automaticamente

### **1. URL Personalizada**
```
❌ Antes: https://api.empresa.com/cardapio
✅ Depois: https://pedido.dominio.tech/quadrata-pizzas
```

### **2. Knowledge Base Completa**
```markdown
# Informações da Quadrata Pizzas

## Empresa
- Nome: Quadrata Pizzas
- Link do cardápio: https://pedido.dominio.tech/quadrata-pizzas
- Atendimento online disponível

## Cardápio Disponível

### Pizzas Doces
- **Pizza de Chocolate** - R$ 32,90
  Massa tradicional com chocolate ao leite derretido

### Pizzas Salgadas
- **Pizza Margherita** - R$ 24,90
  Molho de tomate, mussarela e manjericão fresco
```

### **3. Instruções de Atendimento**
```
1. Sempre forneça o link: https://pedido.dominio.tech/quadrata-pizzas
2. Mencione produtos disponíveis quando perguntado
3. Informe preços quando disponíveis
4. Seja prestativo e cordial
5. Encoraje o cliente a fazer o pedido online
```

---

## 🔧 Requisitos Técnicos

### **Migração Necessária:**
Execute o script de migração antes de usar:
```powershell
./apply-agente-ia-config.ps1
```

### **Tabelas Criadas:**
- `ai_agents_config`: Armazena configurações por empresa
- `companies.slug`: Campo adicionado para URLs personalizadas

### **Permissões RLS:**
- Usuários veem apenas configurações de suas empresas
- Super admins podem ver/editar todas as configurações

---

## 📱 Resultado Final

### **❌ Problema Original (Conversas no WhatsApp):**
```
Cliente: tem pizza?
Agente: Acesse nosso cardápio: https://api.empresa.com/cardapio
Cliente: [clica no link] → Erro 404 / Link genérico
```

### **✅ Após Configuração Automática:**
```
Cliente: tem pizza?
Agente: Sim! Temos Pizza Margherita (R$ 24,90) e Pizza 4 Queijos (R$ 32,90).
       Veja nosso cardápio completo: https://pedido.dominio.tech/quadrata-pizzas
Cliente: [clica no link] → Página personalizada da Quadrata Pizzas
```

---

## 🛠️ Arquivos Técnicos

### **Serviços:**
- `src/services/agenteIAAutoConfigService.ts` - Lógica principal
- `src/services/dynamicMetaTagsService.ts` - Meta tags dinâmicas

### **Componentes:**
- `src/components/agente-ia/AutoConfigButton.tsx` - Botão individual
- `src/components/agente-ia/BatchConfigButton.tsx` - Configuração em lote

### **Migração:**
- `supabase/migrations/20250127_add_slug_to_companies.sql` - Campo slug
- `supabase/migrations/20250127_create_ai_agents_config.sql` - Tabela configurações

### **Scripts:**
- `apply-agente-ia-config.ps1` - Aplicar migrações
- `apply-meta-tags-migration.ps1` - Meta tags dinâmicas

---

## 🚨 Solução de Problemas

### **Agente ainda fornece link genérico:**
1. Verifique se a empresa tem produtos cadastrados
2. Execute a configuração automática novamente
3. Confirme que o slug da empresa foi gerado

### **URL não personalizada:**
1. Execute: `apply-meta-tags-migration.ps1`
2. Verifique se a migração de slugs foi aplicada
3. Teste em uma nova janela anônima

### **Knowledge base vazia:**
1. Cadastre produtos no sistema
2. Marque produtos como `is_active = true`
3. Execute configuração automática novamente

---

## 📊 Benefícios

### **Para as Empresas:**
- ✅ Agente conhece o cardápio completo
- ✅ Atendimento mais profissional
- ✅ Links personalizados da marca
- ✅ Configuração automática em segundos

### **Para o Sistema:**
- ✅ Escalabilidade automática
- ✅ White label completo
- ✅ Manutenção zero após configuração
- ✅ Knowledge base sempre atualizada

### **Para os Clientes:**
- ✅ Informações precisas sobre produtos
- ✅ Preços corretos
- ✅ Links funcionais
- ✅ Experiência consistente

---

## 🎊 Conclusão

O sistema de configuração automática do Agente IA transforma um agente genérico em um assistente especializado da empresa em segundos. 

**Antes:** Agente genérico com links quebrados
**Depois:** Assistente especializado com conhecimento completo

Execute `./apply-agente-ia-config.ps1` e comece a usar! 🚀 