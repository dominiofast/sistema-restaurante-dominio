# Exemplos de Correções de Segurança

## 1. Correção de XSS com DOMPurify

### ❌ Antes (Vulnerável):
```tsx
// src/pages/marketing/CampanhaWhatsApp.tsx
<div 
  className="text-sm whitespace-pre-wrap"
  dangerouslySetInnerHTML={{ __html: formatMessage(campaignData.message) }}
/>
```

### ✅ Depois (Seguro):
```tsx
import { useSafeHtml } from '@/utils/sanitizer';

// src/pages/marketing/CampanhaWhatsApp.tsx
<div 
  className="text-sm whitespace-pre-wrap"
  {...useSafeHtml(formatMessage(campaignData.message))}
/>
```

## 2. Validação de Senha Forte

### ❌ Antes (Fraca):
```tsx
// src/utils/inputValidator.ts
password: { required: true, minLength: 6, maxLength: 128 }
```

### ✅ Depois (Forte):
```tsx
import { validatePassword } from '@/utils/passwordValidator';

const handlePasswordChange = (password: string) => {
  const validation = validatePassword(password);
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    setSuggestions(validation.suggestions);
    return;
  }
  
  // Senha válida, continuar...
};
```

## 3. Rate Limiting em Requisições

### ❌ Antes (Sem Limite):
```tsx
// src/services/aiService.ts
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});
```

### ✅ Depois (Com Rate Limiting):
```tsx
import { aiRateLimiter } from '@/utils/rateLimiter';

const generateResponse = async (companyId: string, message: string) => {
  // Verificar rate limit
  if (!aiRateLimiter.isAllowed(companyId)) {
    throw new Error('Muitas requisições. Tente novamente em alguns minutos.');
  }
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  
  return response;
};
```

## 4. Sanitização de URLs

### ❌ Antes (Vulnerável):
```tsx
const handleLinkClick = (url: string) => {
  window.open(url, '_blank');
};
```

### ✅ Depois (Seguro):
```tsx
import { sanitizeUrl } from '@/utils/sanitizer';

const handleLinkClick = (url: string) => {
  const safeUrl = sanitizeUrl(url);
  
  if (!safeUrl) {
    console.warn('URL inválida ou perigosa:', url);
    return;
  }
  
  // Verificar se é uma URL válida
  try {
    const urlObj = new URL(safeUrl);
    if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
      window.open(safeUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.warn('URL malformada:', safeUrl);
  }
};
```

## 5. Logging Seguro

### ❌ Antes (Expõe Dados):
```tsx
console.log('Dados do usuário:', userData);
console.log('API Key:', apiKey);
```

### ✅ Depois (Seguro):
```tsx
const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  } else {
    // Em produção, enviar apenas para sistema de logging
    // sem dados sensíveis
    console.log(message);
  }
};

secureLog('Usuário autenticado', { id: userData.id, email: userData.email });
// Nunca logar: senhas, tokens, API keys, dados pessoais completos
```

## 6. Validação de Entrada

### ❌ Antes (Sem Validação):
```tsx
const handleSubmit = (formData: any) => {
  // Enviar dados diretamente
  submitData(formData);
};
```

### ✅ Depois (Com Validação):
```tsx
import { sanitizeText } from '@/utils/sanitizer';

const validateAndSanitizeInput = (input: string, maxLength: number = 255) => {
  if (!input || typeof input !== 'string') {
    throw new Error('Entrada inválida');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Entrada muito longa. Máximo ${maxLength} caracteres.`);
  }
  
  return sanitizeText(input.trim());
};

const handleSubmit = (formData: any) => {
  try {
    const sanitizedData = {
      name: validateAndSanitizeInput(formData.name, 100),
      email: validateAndSanitizeInput(formData.email, 254),
      message: validateAndSanitizeInput(formData.message, 1000)
    };
    
    submitData(sanitizedData);
  } catch (error) {
    setError(error.message);
  }
};
```

## 7. Headers de Segurança

### ❌ Antes (CSP Permissivo):
```tsx
"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co;"
```

### ✅ Depois (CSP Restritivo):
```tsx
"script-src 'self' 'nonce-{NONCE}' https://*.supabase.co;"
```

## 8. Timeout em Requisições

### ❌ Antes (Sem Timeout):
```tsx
const response = await fetch(url, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### ✅ Depois (Com Timeout):
```tsx
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number = 10000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Requisição expirou. Tente novamente.');
    }
    throw error;
  }
};
```

## 9. Validação de Arquivo Upload

### ❌ Antes (Sem Validação):
```tsx
const handleFileUpload = (file: File) => {
  uploadFile(file);
};
```

### ✅ Depois (Com Validação):
```tsx
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const validateFile = (file: File): boolean => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de arquivo não permitido');
  }
  
  if (file.size > MAX_SIZE) {
    throw new Error('Arquivo muito grande. Máximo 5MB.');
  }
  
  return true;
};

const handleFileUpload = (file: File) => {
  try {
    validateFile(file);
    uploadFile(file);
  } catch (error) {
    setError(error.message);
  }
};
```

## 10. Proteção CSRF

### ❌ Antes (Sem Proteção):
```tsx
const submitForm = async (data: any) => {
  const response = await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};
```

### ✅ Depois (Com Token CSRF):
```tsx
const getCSRFToken = (): string => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (!token) {
    throw new Error('Token CSRF não encontrado');
  }
  return token;
};

const submitForm = async (data: any) => {
  const csrfToken = getCSRFToken();
  
  const response = await fetch('/api/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    body: JSON.stringify(data)
  });
};
```

## Script de Aplicação Automática

Para aplicar essas correções automaticamente, execute:

```bash
# Tornar o script executável
chmod +x scripts/security-fixes.js

# Executar correções automáticas
node scripts/security-fixes.js
```

## Checklist de Implementação

- [ ] Instalar DOMPurify: `npm install dompurify @types/dompurify`
- [ ] Substituir todos os `dangerouslySetInnerHTML` por `useSafeHtml`
- [ ] Implementar validação de senha forte em formulários de registro
- [ ] Adicionar rate limiting em APIs críticas
- [ ] Atualizar CSP para ser mais restritivo
- [ ] Adicionar timeouts em todas as requisições HTTP
- [ ] Implementar validação de arquivos em uploads
- [ ] Adicionar logging seguro (sem dados sensíveis)
- [ ] Testar todas as funcionalidades após as mudanças
- [ ] Realizar auditoria de segurança completa