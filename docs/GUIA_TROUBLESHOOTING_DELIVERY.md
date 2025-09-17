# 🔧 Guia de Troubleshooting - Opções de Entrega

## 🚨 Problemas Comuns

### 1. Pickup habilitado mas não aparece (Caso Dominio)
### 2. Pickup desabilitado mas ainda aparece (Caso 300 Graus)

## 🔍 Ferramentas de Diagnóstico

### A. Console do Navegador - Verificação Geral
```javascript
// 1. Verificar todas as empresas e suas configurações
debugAllCompanies();

// 2. Verificar empresa específica por nome
debugCompanyByName('dominio');
debugCompanyByName('300 graus');

// 3. Forçar refresh das configurações (sem alterar banco)
forceRefreshDeliveryOptions('COMPANY_ID_AQUI');

// 4. Verificar cache atual
deliveryOptionsService.cache;

// 5. Limpar todo o cache
deliveryOptionsService.clearCache();
```

### B. Verificação Visual no Cardápio
Procure pela caixa verde de debug que mostra:
- Company ID
- Estado do loading
- Dados retornados do banco
- Valores processados (pickup/delivery)

## 🎯 Soluções por Problema

### Problema 1: Pickup Habilitado mas Não Aparece

**Possíveis Causas:**
1. Cache desatualizado
2. Erro na consulta ao banco
3. Company ID incorreto
4. Registro não existe na tabela delivery_methods

**Soluções:**
```javascript
// 1. Verificar se empresa existe e tem configurações
debugCompanyByName('nome_da_empresa');

// 2. Forçar refresh
forceRefreshDeliveryOptions('COMPANY_ID');

// 3. Se não tem registro, criar um
forceDeliveryUpdate('COMPANY_ID', {
  delivery: false,
  pickup: true,  // HABILITAR pickup
  eat_in: false
});
```

### Problema 2: Pickup Desabilitado mas Ainda Aparece

**Possíveis Causas:**
1. Cache antigo
2. Múltiplos registros na tabela
3. Fallback incorreto no código

**Soluções:**
```javascript
// 1. Verificar configurações atuais
debugCompanyByName('nome_da_empresa');

// 2. Forçar desabilitação
disablePickupForCompany('COMPANY_ID');

// 3. Limpar cache e recarregar
deliveryOptionsService.clearCache();
location.reload();
```

## 📋 Checklist de Verificação

### ✅ Para Cada Empresa:

1. **Verificar se existe registro na tabela delivery_methods**
   ```sql
   SELECT * FROM delivery_methods WHERE company_id = 'COMPANY_ID';
   ```

2. **Verificar valores corretos**
   - `pickup: true` = deve aparecer
   - `pickup: false` = NÃO deve aparecer

3. **Verificar cache**
   - Limpar cache após mudanças
   - Recarregar página

4. **Verificar logs no console**
   - Procurar por erros
   - Verificar dados retornados

## 🔧 Scripts SQL de Correção

### Verificar Todas as Configurações
```sql
SELECT 
    c.name as empresa,
    c.id as company_id,
    dm.delivery,
    dm.pickup,
    dm.eat_in,
    dm.updated_at
FROM companies c
LEFT JOIN delivery_methods dm ON c.id = dm.company_id
ORDER BY c.name;
```

### Habilitar Pickup para Empresa Específica
```sql
-- Substitua 'COMPANY_ID' pelo ID real da empresa
UPDATE delivery_methods 
SET pickup = true, updated_at = NOW()
WHERE company_id = 'COMPANY_ID';

-- Se não existir registro, criar um
INSERT INTO delivery_methods (company_id, delivery, pickup, eat_in)
SELECT 'COMPANY_ID', false, true, false
WHERE NOT EXISTS (
    SELECT 1 FROM delivery_methods WHERE company_id = 'COMPANY_ID'
);
```

### Desabilitar Pickup para Empresa Específica
```sql
UPDATE delivery_methods 
SET pickup = false, updated_at = NOW()
WHERE company_id = 'COMPANY_ID';
```

## 🚀 Processo de Correção Rápida

### Para Dominio (Pickup deve aparecer):
1. Abrir console no cardápio da Dominio
2. Executar: `debugCompanyByName('dominio')`
3. Verificar se `pickup: true`
4. Se não, executar: `forceDeliveryUpdate('DOMINIO_ID', {delivery: false, pickup: true, eat_in: false})`
5. Aguardar reload automático

### Para 300 Graus (Pickup NÃO deve aparecer):
1. Abrir console no cardápio da 300 Graus
2. Executar: `debugCompanyByName('300')`
3. Verificar se `pickup: false`
4. Se não, executar: `disablePickupForCompany('300GRAUS_ID')`
5. Aguardar reload automático

## ⚠️ Importante

1. **Sempre verificar Company ID correto** - IDs diferentes causam problemas
2. **Limpar cache após mudanças** - Cache pode manter dados antigos
3. **Recarregar página** - Garante que mudanças sejam aplicadas
4. **Verificar logs** - Console mostra exatamente o que está acontecendo

## 📞 Se Problema Persistir

1. Verificar se há múltiplos registros para a mesma empresa
2. Verificar se Company ID está correto
3. Executar script SQL de verificação completa
4. Limpar cache do navegador (Ctrl+Shift+Delete)
5. Verificar se há service workers interferindo