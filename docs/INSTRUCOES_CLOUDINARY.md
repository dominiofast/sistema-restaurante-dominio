# 🚀 Configuração Global do Cloudinary para Upload de Currículos

## **Passo 1: Criar Conta no Cloudinary**

1. Acesse: https://cloudinary.com/
2. Clique em **"Sign Up for Free"**
3. Preencha os dados:
   - Email
   - Senha
   - Nome da empresa: `MenuCloud Vagas`
4. Confirme o email

## **Passo 2: Obter Credenciais**

Após fazer login, você verá o **Dashboard** com suas credenciais:

```
Cloud Name: [seu-cloud-name]
API Key: [sua-api-key]
API Secret: [seu-api-secret]
```

## **Passo 3: Criar Upload Preset**

1. No painel do Cloudinary, vá em **Settings** (⚙️)
2. Clique na aba **Upload**
3. Role até **Upload presets**
4. Clique em **Add upload preset**
5. Configure:
   - **Preset name**: `curriculos_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Folder**: `curriculos`
   - **Resource type**: `Auto`
   - **Access control**: `Public read`
   - **Allowed formats**: `pdf,doc,docx`
   - **Max file size**: `10485760` (10MB)
6. Clique em **Save**

## **Passo 4: Configurar Variáveis de Ambiente (GLOBAL)**

### **🌍 Configuração Global com .env**

1. **Crie o arquivo `.env`** na raiz do projeto:
```bash
# Configuração do Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_unsigned
```

2. **Exemplo de configuração:**
```bash
# .env
VITE_CLOUDINARY_CLOUD_NAME=menucloud-vagas
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_unsigned
```

3. **Adicione `.env` ao .gitignore** para não committar credenciais:
```bash
echo ".env" >> .gitignore
```

### **✅ Vantagens da Configuração Global:**
- ✅ **Segurança**: Credenciais não ficam no código
- ✅ **Flexibilidade**: Diferentes ambientes (dev/prod)
- ✅ **Reutilização**: Configuração única para todo o projeto
- ✅ **Manutenção**: Fácil de atualizar em um só lugar

## **Passo 5: Verificar Configuração**

A configuração é **automaticamente validada** quando você usar o sistema:

### **✅ Configuração Correta:**
```
🌩️ Cloudinary Config: {
  cloudName: "menucloud-vagas",
  uploadPreset: "curriculos_unsigned", 
  uploadUrl: "https://api.cloudinary.com/v1_1/menucloud-vagas/upload"
}
```

### **❌ Configuração Incorreta:**
```
❌ CLOUD_NAME do Cloudinary não configurado!

Para configurar:
1. Crie um arquivo .env na raiz do projeto
2. Adicione: VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
3. Adicione: VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_unsigned
```

## **Passo 6: Testar Upload**

1. Acesse a página de candidatura de uma vaga
2. Tente fazer upload de um PDF
3. Verifique se aparece:
   - Barra de progresso
   - Mensagem "Enviando para Cloudinary..."
   - Sucesso com ícone verde

## **Passo 7: Verificar no Painel**

1. Acesse o **Media Library** no Cloudinary
2. Você deve ver uma pasta `curriculos/`
3. Os arquivos enviados aparecerão lá

## **🏗️ Arquitetura Global Implementada**

### **📁 Estrutura de Arquivos:**
```
src/
├── config/
│   └── cloudinary.ts          # ← Configuração global
├── services/
│   └── cloudinaryService.ts   # ← Serviço singleton
├── hooks/
│   └── useCloudinary.ts       # ← Hook global reutilizável
└── components/vagas/
    └── CurriculoUploadCloudinary.tsx  # ← Componente
```

### **🔧 Componentes Globais:**

1. **Config Global** (`cloudinary.ts`):
   - Variáveis de ambiente
   - Validação automática
   - URLs dinâmicas

2. **Serviço Singleton** (`cloudinaryService.ts`):
   - Instância única
   - Upload com progress
   - Validação de arquivos

3. **Hook Reutilizável** (`useCloudinary.ts`):
   - Estado global
   - Funções padronizadas
   - Tratamento de erros

4. **Componente Otimizado**:
   - Usa hook global
   - Interface consistente
   - Validação automática

## **🌍 Configuração para Diferentes Ambientes**

### **Desenvolvimento (.env.local):**
```bash
VITE_CLOUDINARY_CLOUD_NAME=menucloud-dev
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_dev
```

### **Produção (.env.production):**
```bash
VITE_CLOUDINARY_CLOUD_NAME=menucloud-prod
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_prod
```

### **Vercel/Netlify:**
Adicione as variáveis no painel de configuração:
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

## **Recursos do Cloudinary**

### **✅ Vantagens:**
- **25GB grátis** por mês
- **Upload seguro** com validação
- **Transformações automáticas** (thumbnails de PDF)
- **CDN global** para acesso rápido
- **Backup automático**
- **Gestão via painel web**

### **🔧 Funcionalidades Implementadas:**
- ✅ **Configuração global** com variáveis de ambiente
- ✅ **Hook reutilizável** para qualquer componente
- ✅ **Serviço singleton** otimizado
- ✅ **Validação automática** de configuração
- ✅ Upload com progress bar
- ✅ Validação de formato (PDF, DOC, DOCX)
- ✅ Validação de tamanho (10MB)
- ✅ Drag & drop
- ✅ Preview de arquivo enviado
- ✅ Download direto
- ✅ Remoção de arquivo
- ✅ Organização em pastas

## **Troubleshooting**

### **❌ Erro: "CLOUD_NAME não configurado"**
- Crie arquivo `.env` na raiz do projeto
- Adicione `VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name`

### **❌ Erro: "Upload preset not found"**
- Verifique se criou o preset `curriculos_unsigned`
- Confirme que está em modo `Unsigned`

### **❌ Variáveis não carregam:**
- Certifique-se que começam com `VITE_`
- Reinicie o servidor de desenvolvimento
- Verifique se o arquivo `.env` está na raiz

### **❌ Upload falha:**
- Verifique conexão com internet
- Confirme que o arquivo é PDF/DOC/DOCX
- Verifique se não excede 10MB

## **🎯 Resultado Final**

Após a configuração global, você terá:

1. **✅ Configuração centralizada** em variáveis de ambiente
2. **✅ Reutilização fácil** em qualquer componente
3. **✅ Segurança** (credenciais não no código)
4. **✅ Flexibilidade** para diferentes ambientes
5. **✅ Upload profissional** com Cloudinary
6. **✅ 25GB grátis** para armazenamento
7. **✅ Interface moderna** com drag & drop
8. **✅ Validação robusta** de arquivos
9. **✅ Gestão centralizada** no painel web
10. **✅ Backup automático** na nuvem

**O sistema está pronto para produção com configuração global! 🚀** 