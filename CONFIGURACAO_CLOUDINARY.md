# 🌩️ Configuração do Cloudinary

Este guia explica como configurar o Cloudinary para o sistema de cardápio digital.

## 📋 Pré-requisitos

1. Conta no Cloudinary (gratuita): https://cloudinary.com
2. Acesso ao painel de administração do Cloudinary

## 🔧 Configuração Passo a Passo

### 1. Obter Credenciais

1. Acesse: https://cloudinary.com/console
2. No painel, copie:
   - **Cloud Name** (ex: `dztzpttib`)
   - **API Key** (opcional)
   - **API Secret** (opcional)

### 2. Criar Upload Preset

1. No painel do Cloudinary, vá em **Settings** → **Upload presets**
2. Clique em **"Add upload preset"**
3. Configure:
   - **Name**: `cardapio_unsigned`
   - **Signing Mode**: `Unsigned`
   - **Access Mode**: `Public`
   - **Resource Type**: `Auto`
   - **Folder**: `cardapio`
4. Clique em **"Save"**

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Cloudinary Configuration (OBRIGATÓRIO)
VITE_CLOUDINARY_CLOUD_NAME=seu_cloud_name_aqui
VITE_CLOUDINARY_UPLOAD_PRESET=cardapio_unsigned

# Cloudinary API Keys (OPCIONAL - apenas para uploads assinados)
VITE_CLOUDINARY_API_KEY=seu_api_key_aqui
VITE_CLOUDINARY_API_SECRET=seu_api_secret_aqui
```

> **ℹ️ IMPORTANTE**: Para uploads "unsigned" (nossa implementação), você **NÃO precisa** da API key e API secret. Essas variáveis são opcionais e só são necessárias para uploads assinados ou operações no backend.

### 4. Estrutura de Pastas

O sistema organiza as imagens em pastas específicas:

```
cardapio/
├── produtos/          # Imagens de produtos do cardápio
├── branding/          # Logo e banner da empresa
├── categorias/        # Imagens de categorias
└── test/             # Pasta para testes
```

## 🚀 Como Usar

### Upload Simples

```typescript
import { cloudinaryService } from '@/services/cloudinaryService';

const uploadImage = async (file: File) => {
  try {
    const result = await cloudinaryService.uploadFile(file);
    console.log('URL da imagem:', result.secure_url);
    return result.secure_url;
  } catch (error) {
    console.error('Erro no upload:', error);
  }
};
```

### Upload com Pasta Específica

```typescript
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

const { uploadFile } = useCloudinaryUpload();

const uploadToFolder = async (file: File) => {
  const url = await uploadFile(file, 'cardapio/produtos');
  return url;
};
```

### Usando o Componente ImageUploader

```tsx
import { ImageUploader } from '@/components/cardapio/ImageUploader';

<ImageUploader
  label="Imagem do Produto"
  currentImageUrl={imageUrl}
  onImageChange={setImageUrl}
  folder="cardapio/produtos"
  maxSize={5}
/>
```

## ⚙️ Configurações Avançadas

### Validação de Arquivos

```typescript
import { cloudinary } from '@/config/appConfig';

// Formatos permitidos
const allowedFormats = cloudinary.ALLOWED_FORMATS;

// Tamanho máximo
const maxSize = cloudinary.MAX_FILE_SIZE;
```

### Transformações de Imagem

O Cloudinary permite transformações automáticas:

```typescript
// Redimensionar para 300x300
const resizedUrl = `${baseUrl}/w_300,h_300,c_fill/${publicId}`;

// Comprimir e otimizar
const optimizedUrl = `${baseUrl}/q_auto,f_auto/${publicId}`;
```

## 🔑 API Keys - Quando Usar?

### **❌ NÃO precisa de API Key para:**
- ✅ **Uploads "Unsigned"** (nossa implementação atual)
- ✅ **Uploads públicos** via frontend
- ✅ **Aplicações client-side** (React, Vue, Angular)
- ✅ **Uploads diretos** do navegador

### **✅ PRECISA de API Key para:**
- 🔒 **Uploads "Signed"** (autenticados)
- 🔒 **Operações no backend** (Node.js, Python, PHP)
- 🔒 **Deletar arquivos** via API
- 🔒 **Listar arquivos** via API
- 🔒 **Transformações avançadas** no servidor
- 🔒 **Uploads com restrições** de segurança

### **Nossa Implementação:**
```typescript
// Upload "unsigned" - NÃO precisa de API key
const formData = new FormData();
formData.append('file', file);
formData.append('upload_preset', 'cardapio_unsigned'); // Preset público
```

### **Se precisar de API Key no futuro:**
```typescript
// Upload "signed" - PRECISA de API key
const formData = new FormData();
formData.append('file', file);
formData.append('api_key', cloudinary.API_KEY);
formData.append('timestamp', Date.now().toString());
// + assinatura digital
```

## 🔍 Troubleshooting

### Erro 401 "Unauthorized"

**Causa**: Upload preset não configurado corretamente

**Solução**:
1. Verifique se o preset `cardapio_unsigned` existe
2. Confirme que está configurado como "Unsigned" e "Public"
3. Verifique se a variável `VITE_CLOUDINARY_UPLOAD_PRESET` está correta

### Erro 400 "Bad Request"

**Causa**: Arquivo muito grande ou formato não suportado

**Solução**:
1. Verifique o tamanho do arquivo (máximo 10MB)
2. Confirme o formato (JPEG, PNG, WEBP, GIF)
3. Verifique as configurações do preset

### Imagens não aparecem

**Causa**: URL incorreta ou arquivo não existe

**Solução**:
1. Verifique se a URL está completa
2. Confirme se o arquivo foi enviado com sucesso
3. Verifique as configurações de CORS

## 📊 Monitoramento

### Logs de Desenvolvimento

Em modo de desenvolvimento, o sistema exibe logs detalhados:

```javascript
🌩️ [Cloudinary] Configuração: {
  cloudName: "dztzpttib",
  uploadPreset: "cardapio_unsigned",
  uploadUrl: "https://api.cloudinary.com/v1_1/dztzpttib/auto/upload"
}
```

### Dashboard do Cloudinary

Acesse o dashboard para monitorar:
- Uso de banda
- Armazenamento
- Transformações
- Uploads recentes

## 🔒 Segurança

### Upload Preset Unsigned

- ✅ Permite uploads sem autenticação
- ✅ Ideal para aplicações frontend
- ⚠️ Configure corretamente as permissões

### Validação no Frontend

```typescript
// Validar tipo de arquivo
const isValidType = cloudinary.ALLOWED_FORMATS.includes(file.type);

// Validar tamanho
const isValidSize = file.size <= cloudinary.MAX_FILE_SIZE;
```

## 📈 Performance

### Otimizações Automáticas

O Cloudinary aplica automaticamente:
- Compressão de imagens
- Conversão para formatos otimizados (WebP)
- Redimensionamento responsivo
- Cache global (CDN)

### Configurações Recomendadas

```typescript
// Para imagens de produtos
const productImageUrl = `${baseUrl}/w_400,h_400,c_fill,q_auto,f_auto/${publicId}`;

// Para thumbnails
const thumbnailUrl = `${baseUrl}/w_150,h_150,c_fill,q_auto,f_auto/${publicId}`;
```

## 🆘 Suporte

- **Documentação**: https://cloudinary.com/documentation
- **Console**: https://cloudinary.com/console
- **Status**: https://status.cloudinary.com
