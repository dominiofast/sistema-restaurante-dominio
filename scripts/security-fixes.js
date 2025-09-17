#!/usr/bin/env node

/**
 * Script de Correções Automáticas de Segurança
 * 
 * Este script implementa correções automáticas para algumas das vulnerabilidades
 * identificadas no relatório de auditoria de segurança.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔒 Iniciando correções automáticas de segurança...\n');

// 1. Corrigir dependências vulneráveis
console.log('1️⃣ Corrigindo dependências vulneráveis...');
try {
  execSync('npm audit fix --force', { stdio: 'inherit' });
  console.log('✅ Dependências corrigidas com sucesso\n');
} catch (error) {
  console.log('⚠️ Algumas dependências podem precisar de correção manual\n');
}

// 2. Instalar DOMPurify para sanitização
console.log('2️⃣ Instalando DOMPurify para sanitização...');
try {
  execSync('npm install dompurify @types/dompurify', { stdio: 'inherit' });
  console.log('✅ DOMPurify instalado com sucesso\n');
} catch (error) {
  console.log('❌ Erro ao instalar DOMPurify:', error.message, '\n');
}

// 3. Criar utilitário de sanitização
console.log('3️⃣ Criando utilitário de sanitização...');
const sanitizerCode = `import DOMPurify from 'dompurify';

/**
 * Utilitário para sanitização segura de HTML
 * Previne ataques XSS ao limpar conteúdo HTML malicioso
 */

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: string[];
  stripTags?: boolean;
}

/**
 * Sanitiza HTML removendo scripts e conteúdo malicioso
 */
export const sanitizeHtml = (
  html: string, 
  options: SanitizeOptions = {}
): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  const config: any = {
    ALLOWED_TAGS: options.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'
    ],
    ALLOWED_ATTR: options.allowedAttributes || ['class', 'id'],
    KEEP_CONTENT: !options.stripTags,
    REMOVE_TAGS: ['script', 'object', 'embed', 'link', 'style', 'iframe'],
    REMOVE_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
  };

  return DOMPurify.sanitize(html, config);
};

/**
 * Sanitiza texto removendo todas as tags HTML
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(text, { 
    ALLOWED_TAGS: [],
    KEEP_CONTENT: true 
  });
};

/**
 * Valida e sanitiza URLs
 */
export const sanitizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove javascript: e data: URLs maliciosos
  const cleanUrl = url.trim().toLowerCase();
  if (cleanUrl.startsWith('javascript:') || 
      cleanUrl.startsWith('data:') || 
      cleanUrl.startsWith('vbscript:')) {
    return '';
  }

  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [] });
};

/**
 * Hook React para sanitização segura
 */
export const useSafeHtml = (html: string, options?: SanitizeOptions) => {
  return {
    __html: sanitizeHtml(html, options)
  };
};`;

try {
  fs.writeFileSync('src/utils/sanitizer.ts', sanitizerCode);
  console.log('✅ Utilitário de sanitização criado em src/utils/sanitizer.ts\n');
} catch (error) {
  console.log('❌ Erro ao criar utilitário de sanitização:', error.message, '\n');
}

// 4. Criar utilitário de validação de senha forte
console.log('4️⃣ Atualizando validação de senha...');
const passwordValidatorCode = `/**
 * Validador de senha segura
 * Implementa políticas de segurança rigorosas para senhas
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: string[];
  suggestions: string[];
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  if (!password) {
    return {
      isValid: false,
      score: 0,
      errors: ['Senha é obrigatória'],
      suggestions: ['Digite uma senha']
    };
  }

  // Comprimento mínimo
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
    suggestions.push('Use pelo menos 8 caracteres');
  } else {
    score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
  }

  // Letra maiúscula
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
    suggestions.push('Adicione pelo menos uma letra maiúscula (A-Z)');
  } else {
    score += 15;
  }

  // Letra minúscula
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
    suggestions.push('Adicione pelo menos uma letra minúscula (a-z)');
  } else {
    score += 15;
  }

  // Número
  if (!/\\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
    suggestions.push('Adicione pelo menos um número (0-9)');
  } else {
    score += 15;
  }

  // Caractere especial
  if (!/[!@#$%^&*()_+\\-=\\[\\]{};':"\\\\|,.<>\\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
    suggestions.push('Adicione pelo menos um caractere especial (!@#$%^&*)');
  } else {
    score += 15;
  }

  // Verificações adicionais de segurança
  
  // Sequências comuns
  const commonSequences = ['123', 'abc', 'qwe', 'asd', 'zxc'];
  const lowerPassword = password.toLowerCase();
  if (commonSequences.some(seq => lowerPassword.includes(seq))) {
    score -= 10;
    suggestions.push('Evite sequências comuns como 123, abc, qwerty');
  }

  // Repetições
  if (/(..).*\\1/.test(password)) {
    score -= 5;
    suggestions.push('Evite repetir padrões na senha');
  }

  // Palavras comuns (básico)
  const commonWords = ['password', 'senha', '123456', 'admin', 'user'];
  if (commonWords.some(word => lowerPassword.includes(word))) {
    score -= 15;
    suggestions.push('Evite palavras comuns como "password" ou "123456"');
  }

  // Diversidade de caracteres
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.7) {
    score += 10;
  }

  // Garantir que score não seja negativo
  score = Math.max(0, Math.min(100, score));

  return {
    isValid: errors.length === 0 && score >= 60,
    score,
    errors,
    suggestions
  };
};

/**
 * Gera uma senha segura aleatória
 */
export const generateSecurePassword = (length: number = 16): string => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  
  let password = '';
  
  // Garantir pelo menos um de cada tipo
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Preencher o resto aleatoriamente
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralhar a senha
  return password.split('').sort(() => Math.random() - 0.5).join('');
};`;

try {
  fs.writeFileSync('src/utils/passwordValidator.ts', passwordValidatorCode);
  console.log('✅ Validador de senha atualizado em src/utils/passwordValidator.ts\n');
} catch (error) {
  console.log('❌ Erro ao criar validador de senha:', error.message, '\n');
}

// 5. Criar middleware de rate limiting
console.log('5️⃣ Criando middleware de rate limiting...');
const rateLimitCode = `/**
 * Rate Limiting Middleware para Frontend
 * Previne abuso de APIs e ataques de força bruta
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private storage = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Limpeza periódica de entradas expiradas
    setInterval(() => {
      this.cleanup();
    }, this.config.windowMs);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      if (entry.resetTime <= now) {
        this.storage.delete(key);
      }
    }
  }

  private getKey(identifier: string): string {
    return this.config.keyGenerator ? 
      this.config.keyGenerator(identifier) : 
      identifier;
  }

  public isAllowed(identifier: string): boolean {
    const key = this.getKey(identifier);
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry || entry.resetTime <= now) {
      // Nova janela de tempo
      this.storage.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return true;
    }

    if (entry.count >= this.config.maxRequests) {
      return false;
    }

    entry.count++;
    return true;
  }

  public getRemainingRequests(identifier: string): number {
    const key = this.getKey(identifier);
    const entry = this.storage.get(key);
    
    if (!entry || entry.resetTime <= Date.now()) {
      return this.config.maxRequests;
    }
    
    return Math.max(0, this.config.maxRequests - entry.count);
  }

  public getResetTime(identifier: string): number {
    const key = this.getKey(identifier);
    const entry = this.storage.get(key);
    
    return entry ? entry.resetTime : Date.now();
  }
}

// Rate limiters pré-configurados
export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000, // 15 minutos
});

export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
});

export const aiRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minuto
});

/**
 * Hook React para rate limiting
 */
export const useRateLimit = (
  identifier: string, 
  limiter: RateLimiter = apiRateLimiter
) => {
  const checkLimit = (): boolean => {
    return limiter.isAllowed(identifier);
  };

  const getRemainingRequests = (): number => {
    return limiter.getRemainingRequests(identifier);
  };

  const getResetTime = (): number => {
    return limiter.getResetTime(identifier);
  };

  return {
    checkLimit,
    getRemainingRequests,
    getResetTime
  };
};

/**
 * Decorator para funções com rate limiting
 */
export const withRateLimit = (
  limiter: RateLimiter,
  identifier: string
) => {
  return function <T extends (...args: any[]) => any>(
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<T>
  ) {
    const method = descriptor.value!;
    
    descriptor.value = ((...args: any[]) => {
      if (!limiter.isAllowed(identifier)) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      return method.apply(target, args);
    }) as T;
  };
};`;

try {
  fs.writeFileSync('src/utils/rateLimiter.ts', rateLimitCode);
  console.log('✅ Rate limiter criado em src/utils/rateLimiter.ts\n');
} catch (error) {
  console.log('❌ Erro ao criar rate limiter:', error.message, '\n');
}

// 6. Atualizar CSP
console.log('6️⃣ Atualizando Content Security Policy...');
const securityHeadersPath = 'src/utils/securityHeaders.ts';

if (fs.existsSync(securityHeadersPath)) {
  let content = fs.readFileSync(securityHeadersPath, 'utf8');
  
  // Atualizar CSP para ser mais restritivo
  const newCSP = `  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'nonce-{NONCE}' https://*.supabase.co; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://*.supabase.co https://api.openai.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",`;
  
  content = content.replace(
    /'Content-Security-Policy':[^,]+,/s,
    newCSP
  );
  
  // Adicionar novos headers de segurança
  const additionalHeaders = `
  // Proteção adicional contra ataques
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Controle de permissões mais restritivo
  'Permissions-Policy': 
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',`;
  
  if (!content.includes('X-Content-Type-Options')) {
    content = content.replace(
      /} as const;/,
      additionalHeaders + '\n} as const;'
    );
  }
  
  fs.writeFileSync(securityHeadersPath, content);
  console.log('✅ Headers de segurança atualizados\n');
} else {
  console.log('⚠️ Arquivo de headers de segurança não encontrado\n');
}

console.log('🎉 Correções automáticas de segurança concluídas!');
console.log('\n📋 Próximos passos manuais:');
console.log('1. Revisar e testar todas as alterações');
console.log('2. Atualizar componentes que usam dangerouslySetInnerHTML');
console.log('3. Implementar rate limiting nas APIs');
console.log('4. Configurar monitoramento de segurança');
console.log('5. Realizar testes de penetração');

console.log('\n🔍 Para aplicar as correções de sanitização:');
console.log('- Substitua dangerouslySetInnerHTML por useSafeHtml');
console.log('- Importe: import { useSafeHtml } from "@/utils/sanitizer"');
console.log('- Use: <div {...useSafeHtml(htmlContent)} />');