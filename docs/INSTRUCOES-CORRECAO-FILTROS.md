# Correção dos Filtros de Clientes

## Problema Identificado

Os filtros de clientes não estão funcionando porque a tabela `clientes` não possui as colunas necessárias:

- `company_id` - Para associar clientes às empresas
- `data_nascimento` - Para filtros de data de nascimento
- `dias_sem_comprar` - Para exibir quantos dias sem comprar
- `total_pedidos` - Para filtros de quantidade de pedidos
- `saldo` - Para filtros de saldo negativo

## Solução

### 1. Execute a migração SQL

Execute o arquivo `fix-clientes-table-structure.sql` no seu banco de dados. Este arquivo:

- Adiciona as colunas faltantes na tabela `clientes`
- Cria índices para melhor performance
- Cria a função `update_client_status_by_inactivity()`
- Configura as políticas RLS (Row Level Security)
- Popula os dados iniciais

### 2. Como executar

**Opção A - Via psql:**
```bash
psql -h seu-host -U seu-usuario -d sua-database -f fix-clientes-table-structure.sql
```

**Opção B - Via interface gráfica (pgAdmin, DBeaver, etc.):**
1. Abra o arquivo `fix-clientes-table-structure.sql`
2. Copie todo o conteúdo
3. Execute no seu banco de dados

### 3. Verificação

Após executar a migração, você pode verificar se funcionou:

```sql
-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'clientes' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se a função foi criada
SELECT proname FROM pg_proc WHERE proname = 'update_client_status_by_inactivity';

-- Testar a função
SELECT update_client_status_by_inactivity();
```

### 4. Resultado Esperado

Após a migração:

✅ **Filtros funcionando:**
- Período de Cadastro
- Status de Atividade (Ativos, Inativos, Potenciais)
- Data de Nascimento
- Apenas saldos negativos
- Quantidade de pedidos

✅ **Coluna "Dias sem Comprar" exibida corretamente**

✅ **Botão "Atualizar Status" funcionando**

## Logs de Debug

O código agora inclui logs detalhados no console do navegador. Para debugar:

1. Abra o DevTools (F12)
2. Vá na aba Console
3. Use os filtros e observe os logs que começam com 🔍

## Notas Importantes

- A migração é segura e não remove dados existentes
- Clientes existentes serão associados à primeira empresa ativa encontrada
- A função `update_client_status_by_inactivity()` deve ser executada periodicamente para manter os dados atualizados
- Os filtros agora funcionam no nível do banco de dados, não no frontend