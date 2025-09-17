
// Configuração oficial do Cloudinary
export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib',
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'curriculos_unsigned',
  
  get UPLOAD_URL() {
    return `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/upload`;
  },
  
  // Configurações oficiais para arquivos
  RESOURCE_TYPE: 'auto',
  ACCESS_MODE: 'public',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FORMATS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt']
};

export const validateCloudinaryConfig = () => {
  if (!CLOUDINARY_CONFIG.CLOUD_NAME) {
    throw new Error('CLOUD_NAME do Cloudinary não configurado');
  }
  
  if (!CLOUDINARY_CONFIG.UPLOAD_PRESET) {
    throw new Error('UPLOAD_PRESET do Cloudinary não configurado');
  }
  
  return true;
};

// Log de configuração apenas em desenvolvimento
if (import.meta.env.DEV) {
  console.log('🌩️ [Cloudinary] Configuração:', {
    cloudName: CLOUDINARY_CONFIG.CLOUD_NAME,
    uploadPreset: CLOUDINARY_CONFIG.UPLOAD_PRESET,
    uploadUrl: CLOUDINARY_CONFIG.UPLOAD_URL
  });
}
