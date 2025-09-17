# Estrutura do Projeto - GitHub Imports BR

## 📁 Organização das Pastas

O projeto foi reorganizado para melhorar a manutenibilidade e organização. Aqui está a nova estrutura:

### 📂 **database/**
Contém todos os arquivos SQL organizados por categoria:

- **📁 cashback/** - Scripts SQL relacionados ao sistema de cashback (13 arquivos)
- **📁 queries/** - Queries gerais e scripts SQL diversos (189 arquivos)  
- **📁 fiscal/** - Scripts relacionados ao sistema fiscal (vazio - a ser populado)
- **📁 horarios/** - Scripts relacionados a horários (vazio - a ser populado)
- **📁 migrations/** - Migrações do banco de dados (vazio - migrações estão em supabase/migrations)
- **📁 whatsapp/** - Scripts relacionados ao WhatsApp (vazio - a ser populado)

### 📂 **scripts/**
Scripts utilitários organizados por linguagem:

- **📁 powershell/** - Scripts PowerShell (.ps1) (16 arquivos)
- **📁 batch/** - Scripts batch (.bat) (2 arquivos)
- **📁 nodejs/** - Scripts JavaScript/Node.js (28 arquivos)

### 📂 **test-files/**
Arquivos de teste HTML e JavaScript para desenvolvimento e debugging

### 📂 **src/**
Código-fonte principal da aplicação React

### 📂 **supabase/**
- **📁 functions/** - Edge Functions do Supabase
- **📁 migrations/** - Migrações do banco de dados

### 📂 **docs/**
Documentação do projeto

### 📂 **public/**
Arquivos públicos estáticos

## 🗂️ Arquivos na Raiz

Apenas arquivos de configuração essenciais permanecem na raiz:

- `package.json` - Dependências do projeto
- `package-lock.json` - Lock file do npm
- `vite.config.ts` - Configuração do Vite
- `tailwind.config.ts` - Configuração do Tailwind CSS
- `postcss.config.js` - Configuração do PostCSS
- `eslint.config.js` - Configuração do ESLint
- `components.json` - Configuração dos componentes
- `netlify.toml` - Configuração do Netlify
- `vercel.json` - Configuração do Vercel
- `README.md` - Documentação principal
- `index.html` - Arquivo HTML principal

## 📊 Estatísticas da Organização

- **Total de arquivos SQL organizados**: ~202 arquivos
- **Scripts PowerShell organizados**: 16 arquivos
- **Scripts Node.js organizados**: 28 arquivos
- **Scripts Batch organizados**: 2 arquivos
- **Arquivos de teste movidos**: ~20 arquivos

## ✅ Benefícios da Nova Estrutura

1. **Melhor Organização**: Arquivos agrupados por tipo e propósito
2. **Fácil Navegação**: Estrutura lógica e intuitiva
3. **Manutenção Simplificada**: Localização rápida de arquivos específicos
4. **Profissionalismo**: Estrutura limpa e organizada
5. **Escalabilidade**: Fácil adicionar novos módulos e funcionalidades

## 🔄 Migração

Todos os arquivos foram movidos mantendo sua funcionalidade. Se houver alguma referência quebrada, verifique os novos caminhos:

- Arquivos SQL: `database/[categoria]/arquivo.sql`
- Scripts PowerShell: `scripts/powershell/arquivo.ps1`
- Scripts Node.js: `scripts/nodejs/arquivo.js`
- Arquivos de teste: `test-files/arquivo.html`

---

*Última atualização: 03/09/2025*
