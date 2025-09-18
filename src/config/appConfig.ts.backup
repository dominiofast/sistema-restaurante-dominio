/**
 * Configuração Centralizada da Aplicação
 * 
 * Este arquivo centraliza todas as configurações da aplicação,
 * facilitando a manutenção e mudanças de sistema.
 */

// =================================
// CONFIGURAÇÕES DO CLOUDINARY
// =================================
export const CLOUDINARY_CONFIG = {
  // Configurações principais
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib',
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'cardapio_unsigned',
  API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  API_SECRET: import.meta.env.VITE_CLOUDINARY_API_SECRET || '',
  
  // URLs e endpoints
  get UPLOAD_URL() {
    return `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/auto/upload`;
  },
  
  get BASE_URL() {
    return `https://res.cloudinary.com/${this.CLOUD_NAME}`;
  },
  
  // Configurações de upload
  RESOURCE_TYPE: 'auto' as const,
  ACCESS_MODE: 'public' as const,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  
  // Pastas organizadas por funcionalidade
  FOLDERS: {
    CARDAPIO_PRODUTOS: 'cardapio/produtos',
    CARDAPIO_BRANDING: 'cardapio/branding',
    CARDAPIO_CATEGORIAS: 'cardapio/categorias',
    VAGAS_CURRICULOS: 'vagas/curriculos',
    VAGAS_IMAGENS: 'vagas/imagens',
    TEST: 'test',
    TEMP: 'temp'
  }
} as const;

// =================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// =================================
export const DATABASE_CONFIG = {
  // Neon PostgreSQL
  NEON_URL: import.meta.env.DATABASE_URL || '',
  
  // Supabase (para Edge Functions)
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const;

// =================================
// CONFIGURAÇÕES DA APLICAÇÃO
// =================================
export const APP_CONFIG = {
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  
  // Google Maps (opcional)
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Configurações de upload
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB para imagens
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB para documentos
  
  // Configurações de cache
  CACHE_DURATION: 3600, // 1 hora em segundos
} as const;

// =================================
// VALIDAÇÃO DE CONFIGURAÇÕES
// =================================
export const validateConfig = () => {
  const errors: string[] = [];
  
  // Validar Cloudinary
  if (!CLOUDINARY_CONFIG.CLOUD_NAME) {
    errors.push('VITE_CLOUDINARY_CLOUD_NAME não configurado');
  }
  
  if (!CLOUDINARY_CONFIG.UPLOAD_PRESET) {
    errors.push('VITE_CLOUDINARY_UPLOAD_PRESET não configurado');
  }
  
  // Validar banco de dados
  if (!DATABASE_CONFIG.NEON_URL) {
    errors.push('DATABASE_URL não configurado');
  }
  
  if (errors.length > 0) {
    console.error('❌ Erros de configuração:', errors);
    throw new Error(`Configuração inválida: ${errors.join(', ')}`);
  }
  
  return true;
};

// =================================
// LOGS DE CONFIGURAÇÃO
// =================================
export const logConfig = () => {
  if (import.meta.env.DEV) {
    console.log('🔧 [AppConfig] Configurações carregadas:', {
      environment: APP_CONFIG.ENVIRONMENT,
      cloudinary: {
        cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
        uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
        uploadUrl: CLOUDINARY_CONFIG.UPLOAD_URL
      },
      database: {
        neonConfigured: !!DATABASE_CONFIG.NEON_URL,
        supabaseConfigured: !!DATABASE_CONFIG.SUPABASE_URL
      }
    });
  }
};

// =================================
// EXPORTAÇÕES PRINCIPAIS
// =================================
export {
  CLOUDINARY_CONFIG as cloudinary,
  DATABASE_CONFIG as database,
  APP_CONFIG as app
};

// Inicializar logs em desenvolvimento
if (import.meta.env.DEV) {
  logConfig();
}
