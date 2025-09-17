# 🔧 Instruções para Correção das Configurações de Delivery

## ⚠️ Situação Atual
Implementei uma **correção temporária** no código que força as configurações corretas para cada empresa:
- **300 Graus**: Mostrará apenas opções de Delivery (endereços)
- **Domínio Pizzas**: Mostrará ambas as opções (Delivery + Retirada)

## 📝 Para Corrigir Definitivamente

### Opção 1: Via Painel Administrativo
1. Acesse o painel administrativo de cada empresa
2. Vá em **Configurações > Formas de Entrega**
3. Configure:
   - **300 Graus**: ✅ Delivery, ❌ Retirada
   - **Domínio Pizzas**: ✅ Delivery, ✅ Retirada
4. Salve as configurações

### Opção 2: Via SQL no Supabase
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Execute o script em `fix-300graus-delivery-config.sql`
4. Verifique os resultados

## 🧪 Como Testar
1. Limpe o cache do navegador (Ctrl+F5)
2. Acesse o cardápio de cada empresa:
   - 300 Graus: Deve mostrar APENAS opções de delivery
   - Domínio: Deve mostrar AMBAS as opções
3. Abra o console do navegador (F12) para ver os logs de debug

## 🎯 Resultado Esperado
- **300 Graus** (`/300graus`):
  - ❌ NÃO mostra "Retirar no estabelecimento"
  - ✅ Mostra endereços de entrega
  - ✅ Permite cadastrar novos endereços

- **Domínio Pizzas** (`/dominio-pizzas`):
  - ✅ Mostra "Retirar no estabelecimento"
  - ✅ Mostra endereços de entrega
  - ✅ Permite cadastrar novos endereços

## 🔍 Logs de Debug
O sistema está com logs temporários que mostram:
- Configurações do banco de dados
- Correções aplicadas
- Valores finais utilizados

Verifique o console do navegador para acompanhar o processo.

## ⚠️ Importante
Após corrigir no banco de dados e confirmar que está funcionando:
1. Remova a correção temporária do código
2. Remova os logs de debug
3. Reative o cache (staleTime: 60000)
