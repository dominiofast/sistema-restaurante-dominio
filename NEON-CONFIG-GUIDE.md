# 🚀 Guia de Configuração do Banco Neon PostgreSQL

## ✅ Status da Configuração
- [x] Biblioteca `@neondatabase/serverless` já instalada
- [x] Configuração de conexão em `server/db.js` pronta  
- [x] Arquivo `.env` criado com DATABASE_URL
- [x] Tabelas básicas criadas no banco
- [x] Dados de teste inseridos
- [x] Conexão testada e funcionando

## 🔧 Como foi Configurado

### 1. String de Conexão
Foi adicionada no arquivo `.env`:
```env
DATABASE_URL=postgresql://neondb_owner:npg_zgJibF05ZSqC@ep-solitary-mud-acn84ca4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. Tabelas Criadas
- ✅ `users` - Usuários do sistema
- ✅ `companies` - Empresas/restaurantes
- ✅ `categorias` - Categorias de produtos
- ✅ `produtos` - Produtos/itens do cardápio
- ✅ `clientes` - Clientes dos restaurantes

### 3. Dados de Teste
- **Empresa:** Domínio Pizzas (domain: dominiopizzas)
- **Categoria:** Pizzas Tradicionais
- **Produto:** Pizza Margherita - R$ 45,90

### 4. Usuários Criados
- **👑 SUPERADMIN:** contato@dominio.tech / senha: 123456 (Acesso total)
- **👤 ADMIN EMPRESA:** admin@dominiopizzas.com.br / senha: 123456 (Gerenciar restaurante)

## 🔗 Conexão Configurada

O arquivo `server/db.js` já está configurado com:
- Pool de conexão Neon
- Suporte a WebSockets
- Funções para criação de pedidos
- Sistema de autenticação
- Drizzle ORM integrado

## 🚀 Como Usar

### 1. Iniciar o Servidor
```bash
npm start
```

### 2. Testar Conexão
A conexão é automaticamente testada quando o servidor inicia.

### 3. Acessar o Sistema  

**👑 Como SUPERADMIN (acesso total):**
- Email: `contato@dominio.tech`
- Senha: `123456`

**👤 Como ADMIN da empresa (gerenciar restaurante):**
- Email: `admin@dominiopizzas.com.br`
- Senha: `123456`

## 📝 Próximos Passos

1. **Personalizar dados:** Edite as empresas, produtos e categorias conforme necessário
2. **Configurar autenticação:** O sistema já tem estrutura básica pronta
3. **Adicionar funcionalidades:** Use as tabelas existentes como base
4. **Deploy:** Seu banco Neon já está pronto para produção

## 🔧 Comandos Úteis

### Verificar Status do Banco
```bash
# Via psql (se tiver instalado)
psql 'postgresql://neondb_owner:npg_zgJibF05ZSqC@ep-solitary-mud-acn84ca4-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require'

# Via código (já incluído no projeto)
node server/index.js
```

### Backup/Restore
O Neon oferece backups automáticos através do painel web.

## 📞 Suporte

- **Painel Neon:** https://neon.tech/
- **Documentação:** https://neon.tech/docs
- **String de Conexão:** Disponível no painel do projeto

---

## ⚠️ Importante

- Mantenha a `DATABASE_URL` segura no arquivo `.env`
- Não commite o arquivo `.env` no Git
- Use variáveis de ambiente em produção
- O banco está configurado para usar SSL (obrigatório no Neon)

## 🎉 Parabéns!

Seu sistema de restaurante agora está conectado ao banco Neon PostgreSQL e pronto para uso!
