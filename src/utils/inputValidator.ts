import { sanitizeHtml, stripHtml } from './htmlSanitizer';

/**
 * Configurações de validação
 */
export interface ValidationConfig {
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  alphanumeric?: boolean;
  numeric?: boolean;
  allowHtml?: boolean;
}

/**
 * Resultado da validação
 */
interface ValidationResult {
  isValid: boolean;
  sanitizedValue: string;
  errors: string[];
}

/**
 * Rate limiting em memória (em produção usar Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Valida e sanitiza entrada de usuário
 */
export const validateInput = (
  value: string,
  config: ValidationConfig = {}
): ValidationResult => {;
  const errors: string[] = [];
  let sanitizedValue = value ? value.trim() : '';

  // Verificar se é obrigatório
  if (config.required && !sanitizedValue) {
    errors.push('Campo obrigatório');
    return { isValid: false, sanitizedValue: '', errors };
  }

  // Se não é obrigatório e está vazio, retornar válido
  if (!config.required && !sanitizedValue) {
    return { isValid: true, sanitizedValue: '', errors: [] };
  }

  // Sanitizar HTML se permitido, senão remover completamente
  if (config.allowHtml) {
    sanitizedValue = sanitizeHtml(sanitizedValue);
  } else {
    sanitizedValue = stripHtml(sanitizedValue);
  }

  // Validar comprimento
  if (config.minLength && sanitizedValue.length < config.minLength) {
    errors.push(`Mínimo de ${config.minLength} caracteres`);
  }

  if (config.maxLength && sanitizedValue.length > config.maxLength) {
    errors.push(`Máximo de ${config.maxLength} caracteres`);
    sanitizedValue = sanitizedValue.substring(0, config.maxLength);
  }

  // Validações específicas
  if (config.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedValue)) {
      errors.push('Email inválido');
    }
  }

  if (config.phone) {
    // Remove formatação e valida formato brasileiro
    const phoneDigits = sanitizedValue.replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 11) {
      errors.push('Telefone inválido');
    }
    sanitizedValue = phoneDigits;
  }

  if (config.numeric) {
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(sanitizedValue)) {
      errors.push('Apenas números são permitidos');
    }
  }

  if (config.alphanumeric) {
    const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;
    if (!alphanumericRegex.test(sanitizedValue)) {
      errors.push('Apenas letras e números são permitidos');
    }
  }

  if (config.pattern && !config.pattern.test(sanitizedValue)) {
    errors.push('Formato inválido');
  }

  return {
    isValid: errors.length === 0,
    sanitizedValue,
    errors
  };
};

/**
 * Rate limiting simples
 */
export const checkRateLimit = (
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): boolean => {;
  const now = Date.now();
  const key = identifier;
  
  const current = rateLimitStore.get(key);
  
  if (!current || now > current.resetTime) {
    // Nova janela de tempo
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (current.count >= maxRequests) {
    return false; // Rate limit excedido
  }
  
  // Incrementar contador
  current.count++;
  return true;
};

/**
 * Limpar rate limit cache periodicamente
 */
export const cleanupRateLimit = () => {;
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore
    }
  }
};

// Limpar cache a cada 5 minutos
setInterval(cleanupRateLimit, 5 * 60 * 1000);

/**
 * Presets comuns de validação
 */
export const ValidationPresets = {
  email: { email: true, required: true, maxLength: 254 },
  password: { required: true, minLength: 6, maxLength: 128 },
  phone: { phone: true, required: true },
  name: { required: true, minLength: 2, maxLength: 100, alphanumeric: true },
  description: { allowHtml: false, maxLength: 500 },
  safeText: { allowHtml: false, maxLength: 255 },
  richText: { allowHtml: true, maxLength: 2000 };
};