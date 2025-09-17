# 🎨 Prompt para Lovable: Sistema de Branding do Cardápio Digital

## 📋 **Contexto**
Preciso implementar a persistência de dados para o sistema de personalização de marca do cardápio digital que já foi criado. A interface está pronta, mas precisa se conectar ao banco de dados.

## 🗄️ **Estrutura do Banco de Dados**

### **Tabelas Criadas:**

#### 1. **`media_files`** - Armazenamento de Arquivos
```sql
- id (UUID, PK)
- company_id (UUID, FK → companies.id)
- file_name (VARCHAR) - Nome do arquivo
- file_type (VARCHAR) - Tipo: 'logo', 'banner', 'product_image'
- file_url (TEXT) - URL no Supabase Storage
- file_size (INTEGER) - Tamanho em bytes
- mime_type (VARCHAR) - image/jpeg, image/png, etc.
- alt_text (VARCHAR) - Texto alternativo
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

#### 2. **`cardapio_branding`** - Configurações de Marca
```sql
- id (UUID, PK)
- company_id (UUID, FK → companies.id)
- logo_file_id (UUID, FK → media_files.id)
- banner_file_id (UUID, FK → media_files.id)
- show_logo (BOOLEAN)
- show_banner (BOOLEAN)
- primary_color (VARCHAR) - Cor primária (#3B82F6)
- secondary_color (VARCHAR) - Cor secundária (#1E40AF)
- accent_color (VARCHAR) - Cor destaque (#F59E0B)
- text_color (VARCHAR) - Cor texto (#1F2937)
- background_color (VARCHAR) - Cor fundo (#FFFFFF)
- header_style (VARCHAR) - 'modern', 'classic', 'minimal'
- additional_settings (JSONB) - Configurações extras
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

## 🔧 **Implementações Necessárias**

### **1. Upload de Arquivos**
```typescript
// Função para upload no Supabase Storage
const uploadFile = async (file: File, type: 'logo' | 'banner') => {
  // 1. Upload para Supabase Storage bucket 'media'
  // 2. Inserir registro na tabela media_files
  // 3. Retornar URL pública do arquivo
}
```

### **2. Hooks de Dados**
```typescript
// Hook para carregar configurações da empresa
const useBrandingConfig = (companyId: string) => {
  // Buscar dados da tabela cardapio_branding
  // Incluir JOINs com media_files para logo e banner
}

// Hook para salvar configurações
const useSaveBrandingConfig = () => {
  // UPSERT na tabela cardapio_branding
  // Gerenciar relacionamentos com media_files
}
```

### **3. Integração com a Interface Existente**
A página `CardapioDigitalConfig.tsx` já está criada e precisa:

- **Conectar com os hooks de dados**
- **Implementar upload real de arquivos**
- **Salvar configurações no banco**
- **Carregar configurações existentes**

### **4. Aplicar Configurações no Cardápio Público**
A página `CardapioPublico.tsx` precisa:

- **Carregar configurações de branding da empresa**
- **Aplicar cores personalizadas via CSS-in-JS**
- **Exibir logo e banner quando configurados**
- **Usar estilo de cabeçalho selecionado**

## 📁 **Arquivos Principais**

### **Já Criados:**
- ✅ `src/pages/CardapioDigitalConfig.tsx` - Interface de configuração
- ✅ `src/pages/CardapioPublico.tsx` - Cardápio público
- ✅ `supabase/migrations/20250617164200-add-cardapio-digital-branding.sql` - Migração

### **Precisam ser Implementados:**
- 🔄 Hooks para gerenciar dados de branding
- 🔄 Serviços de upload de arquivos
- 🔄 Integração da interface com o banco
- 🔄 Aplicação das configurações no cardápio público

## 🎯 **Objetivos**

### **Funcionalidades Esperadas:**
1. **Upload de Logo/Banner** → Salvar no Supabase Storage + DB
2. **Seleção de Cores** → Persistir na tabela cardapio_branding
3. **Escolha de Estilo** → Salvar header_style no DB
4. **Preview em Tempo Real** → Aplicar configurações instantaneamente
5. **Cardápio Público Personalizado** → Usar configurações salvas

### **Fluxo de Dados:**
```
[Interface Config] → [Upload Storage] → [Save DB] → [Load Public] → [Apply Styles]
```

## 🔒 **Segurança**
- ✅ **RLS habilitado** nas tabelas
- ✅ **Políticas de acesso** por empresa
- ✅ **Validação de tipos** de arquivo
- ✅ **Constraints de integridade** referencial

## 📱 **Supabase Storage**
Criar bucket `media` com:
- **Acesso público** para leitura
- **Upload restrito** por autenticação
- **Organização por empresa**: `{company_id}/logo.png`, `{company_id}/banner.jpg`

## 🚀 **Resultado Esperado**
Um sistema completo onde empresas podem:
- Fazer upload de logo e banner
- Personalizar paleta de cores
- Escolher estilo de cabeçalho
- Ver preview em tempo real
- Ter cardápio público com sua identidade visual

---

**Migração SQL já está pronta e pode ser aplicada diretamente no Supabase!**
