# 🪳 Configuração CockroachDB Cloud

## 📋 **Passo a passo para conectar:**

### 1. **Criar conta no CockroachDB Cloud**
- Acesse: https://cockroachlabs.cloud/
- Crie uma conta gratuita
- Crie um novo cluster

### 2. **Obter string de conexão**
Após criar o cluster, você receberá uma string como:
```
postgresql://username:password@host:port/database?sslmode=require
```

### 3. **Configurar no projeto**
```bash
# Configure a variável de ambiente
export COCKROACH_URL="postgresql://seu_user:sua_senha@seu_host:26257/seu_db?sslmode=require"
```

### 4. **Testar conexão**
```bash
node test-cockroachdb.js
```

## 🔧 **Arquivos criados:**
- `test-cockroachdb.js` - Script de teste
- `server/cockroach-db.js` - Configuração do banco
- `COCKROACHDB_SETUP.md` - Esta documentação

## ✅ **Vantagens do CockroachDB:**
- Banco distribuído e escalável
- Compatível com PostgreSQL
- Alta disponibilidade
- Backup automático
- Interface web para gerenciamento
- Planos gratuitos disponíveis

## 🚀 **Próximos passos:**
1. Configure a `COCKROACH_URL`
2. Execute o teste
3. Atualize o servidor para usar CockroachDB
4. Faça o deploy com a nova configuração


