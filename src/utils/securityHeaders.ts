// Utility para adicionar headers de segurança

export const SECURITY_HEADERS = {
  // Content Security Policy - previne XSS
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "font-src 'self' https:; " +
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co; " +
    "media-src 'self'; " +
    "object-src 'none'; " +
    "frame-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';",
  
  // Previne clickjacking
  'X-Frame-Options': 'DENY',
  
  // Previne MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS Protection
  'X-XSS-Protection': '1; mode=block',
  
  // Força HTTPS (quando em produção)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Previne leakage de informações do referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Controle de permissões
  'Permissions-Policy': 
    'camera=(), microphone=(), geolocation=(), payment=()',
} as const;

// Função para adicionar headers de segurança a respostas
export const addSecurityHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
  return {
    ...headers,
    ...SECURITY_HEADERS
  };
};

// Função para sanitizar input do usuário (prevenção XSS básica)
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    });
};

// Validação de email mais rigorosa
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

// Validação de senha forte
export const isStrongPassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Rate limiting simples no frontend (complementa o backend)
class FrontendRateLimit {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();
  
  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }
    
    // Reset window se passou o tempo
    if (now - record.firstAttempt > windowMs) {
      this.attempts.set(key, { count: 1, firstAttempt: now });
      return true;
    }
    
    // Verificar se excedeu o limite
    if (record.count >= maxAttempts) {
      return false;
    }
    
    // Incrementar contador
    record.count++;
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const frontendRateLimit = new FrontendRateLimit();