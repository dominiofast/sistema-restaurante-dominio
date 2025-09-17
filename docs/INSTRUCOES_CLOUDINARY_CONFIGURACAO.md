# 🌩️ Configuração do Cloudinary - Resolver Erro 401

## 🔍 Problema
Quando você tenta abrir um PDF de currículo e recebe erro **HTTP 401 (Unauthorized)**, isso significa que o arquivo não está acessível publicamente.

## ✅ Solução Rápida (Já Implementada)
- ✅ Adicionado botão de download alternativo
- ✅ Melhorado tratamento de erros
- ✅ Configuração automática de acesso público

## 🛠️ Configuração Completa do Cloudinary

### 1. Criar Conta no Cloudinary
1. Acesse: https://cloudinary.com/
2. Clique em "Sign Up Free"
3. Confirme seu email

### 2. Configurar Upload Preset
1. Faça login no painel do Cloudinary
2. Vá em **Settings** (⚙️) → **Upload**
3. Clique em **Add upload preset**
4. Configure:
   ```
   Preset name: curriculos_unsigned
   Signing Mode: Unsigned
   Resource type: Auto
   Access mode: Public
   Folder: curriculos
   ```
5. Clique em **Save**

### 3. Configurar Variáveis de Ambiente
1. Crie um arquivo `.env` na raiz do projeto:
```bash
# Configuração do Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_unsigned
```

2. Para encontrar seu **Cloud Name**:
   - No painel do Cloudinary
   - Vá em **Dashboard**
   - Copie o valor de **Cloud name**

### 4. Configurações de Segurança (Importante!)
No painel do Cloudinary, vá em **Settings** → **Security**:

```bash
# Allowed upload domains (opcional - deixe vazio para permitir todos)
# Deixe em branco ou adicione seus domínios:
localhost
conta.dominio.tech
vagas.dominio.tech

# Delivery URL transformations
✅ Allow derived URL transformations

# Strict image transformations
❌ Desmarque "Restrict media uploads"
```

## 🔧 Resolução de Problemas

### Erro 401 - Unauthorized
**Causa:** Upload preset configurado como "signed" ou arquivo privado.
**Solução:**
1. Verifique se o preset está como "Unsigned"
2. Confirme que `access_mode` está como "Public"
3. Use o botão "📥 Download" na interface

### Erro CORS
**Causa:** Domínio não autorizado.
**Solução:**
1. Adicione seu domínio nas configurações de segurança
2. Ou deixe vazio para permitir todos os domínios

### Upload Falha
**Causa:** Configurações incorretas.
**Solução:**
1. Verifique as variáveis de ambiente
2. Confirme que o preset existe e está correto
3. Verifique se o arquivo está dentro do limite de 10MB

## 🧪 Teste a Configuração
1. Acesse: http://localhost:8080/test-vaga
2. Tente fazer upload de um PDF
3. Verifique se consegue visualizar o arquivo

## 📱 Configuração para Produção
Para usar em produção, adicione as variáveis de ambiente na plataforma de deploy:

### Vercel
```bash
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=curriculos_unsigned
```

### Netlify
No painel → Site settings → Environment variables

## 🆘 Suporte
Se o problema persistir:
1. Verifique o console do navegador (F12)
2. Confirme as configurações do Cloudinary
3. Teste com um arquivo pequeno primeiro

## 🔒 Segurança
- ✅ Upload preset "unsigned" é seguro para currículos
- ✅ Arquivos ficam em pasta organizada (`curriculos/`)
- ✅ Acesso público controlado pelo Cloudinary
- ✅ Validação de tamanho e formato no frontend

---
*Última atualização: Janeiro 2025* 