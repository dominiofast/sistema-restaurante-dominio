# 🚀 Instruções para Aplicar Migrações - Cardápio Digital Branding

## 📋 Pré-requisitos
- Acesso ao [Supabase Dashboard](https://supabase.com/dashboard/project/epqppxteicfuzdblbluq)
- Permissões de administrador no projeto

## 🗄️ Migrações a Aplicar (EM ORDEM)

### **1. Migração de Slug da Empresa**
```sql
-- Copie e cole o conteúdo do arquivo:
-- supabase/migrations/20250617154900-add-company-slug.sql
```

### **2. Migração de Branding do Cardápio**
```sql
-- Copie e cole o conteúdo do arquivo:
-- supabase/migrations/20250617164200-add-cardapio-digital-branding.sql
```

### **3. Configuração do Storage**
```sql
-- Copie e cole o conteúdo do arquivo:
-- setup_storage.sql
```

## 📝 Passo a Passo

### **Etapa 1: Acessar SQL Editor**
1. Acesse: https://supabase.com/dashboard/project/epqppxteicfuzdblbluq
2. Clique em **"SQL Editor"** no menu lateral
3. Clique em **"New Query"**

### **Etapa 2: Aplicar Migração de Slug**
1. Abra o arquivo `supabase/migrations/20250617154900-add-company-slug.sql`
2. Copie TODO o conteúdo
3. Cole no SQL Editor
4. Clique em **"Run"**
5. ✅ Verifique se executou sem erros

### **Etapa 3: Aplicar Migração de Branding**
1. Crie uma **nova query** no SQL Editor
2. Abra o arquivo `supabase/migrations/20250617164200-add-cardapio-digital-branding.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. ✅ Verifique se executou sem erros

### **Etapa 4: Configurar Storage**
1. Crie uma **nova query** no SQL Editor
2. Abra o arquivo `setup_storage.sql`
3. Copie TODO o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"**
6. ✅ Verifique se executou sem erros

## ✅ Verificação das Migrações

### **Verificar Tabelas Criadas:**
```sql
-- Execute esta query para verificar se as tabelas foram criadas:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('media_files', 'cardapio_branding');
```

### **Verificar Campo Slug:**
```sql
-- Execute esta query para verificar se o campo slug foi adicionado:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'companies' 
AND column_name = 'slug';
```

### **Verificar Storage Bucket:**
```sql
-- Execute esta query para verificar se o bucket foi criado:
SELECT * FROM storage.buckets WHERE id = 'media';
```

## 🎯 Após Aplicar as Migrações

### **O que funcionará:**
- ✅ **Upload de logos e banners** na página de configurações
- ✅ **Salvamento de cores personalizadas**
- ✅ **Aplicação de branding** no cardápio público
- ✅ **URLs amigáveis** para cardápios (com slug)
- ✅ **Isolamento de dados** por empresa (RLS)

### **Testar Funcionalidades:**
1. **Configurações**: Acesse `/settings/cardapio-digital`
2. **Upload**: Teste upload de logo e banner
3. **Cores**: Altere as cores e salve
4. **Cardápio Público**: Acesse `/cardapio/[empresa]`
5. **Branding**: Verifique se as cores e imagens aparecem

## 🚨 Possíveis Erros

### **Erro: "relation already exists"**
- ✅ **Normal** - Significa que a tabela já existe
- Continue com a próxima migração

### **Erro: "column already exists"**
- ✅ **Normal** - Significa que o campo já existe
- Continue com a próxima migração

### **Erro de permissão**
- ❌ **Problema** - Verifique se você tem permissões de admin
- Entre em contato com o administrador do projeto

## 📞 Suporte
Se encontrar erros durante a aplicação, copie a mensagem de erro completa para análise.

---

**🎉 Após aplicar todas as migrações, o sistema de branding estará completamente funcional!**
