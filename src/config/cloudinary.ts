
/**
 * @deprecated Use src/config/appConfig.ts instead
 * Este arquivo foi mantido apenas para compatibilidade
 * 
 * Para novas implementações, use:
 * import { cloudinary } from '@/config/appConfig';
 */

// Re-exportar configuração centralizada
export { cloudinary as CLOUDINARY_CONFIG } from './appConfig';
export { validateConfig as validateCloudinaryConfig } from './appConfig';
