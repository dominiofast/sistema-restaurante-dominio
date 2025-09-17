
// Interface para dados de arquivo
export interface FileData {
  id: string;
  originalName: string;
  size: number;
  format: string;
  cloudinaryUrl: string;
  publicId: string;
  uploadedAt: Date;
}

// Interface para progresso de upload
export interface UploadProgress {
  percentage: number;
  loaded: number;
  total: number;
}

// Interface para resultado do Cloudinary
export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  original_filename: string;
  created_at: string;
}

// Service para upload de arquivos no Cloudinary
export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'curriculos_unsigned';
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  
  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Service completo para gerenciar uploads
export const cloudinaryService = {
  uploadFile: async (file: File, onProgress?: (progress: UploadProgress) => void): Promise<CloudinaryUploadResult> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dztzpttib';
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'curriculos_unsigned';
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const percentage = Math.round((event.loaded * 100) / event.total);
          onProgress({
            percentage,
            loaded: event.loaded,
            total: event.total
          });
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            resolve(result);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed with status: ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      xhr.send(formData);
    });
  },

  convertToFileData: (result: CloudinaryUploadResult, originalFile: File): FileData => {
    return {
      id: result.public_id,
      originalName: originalFile.name,
      size: result.bytes,
      format: result.format,
      cloudinaryUrl: result.secure_url,
      publicId: result.public_id,
      uploadedAt: new Date(result.created_at)
    };
  },

  downloadFile: async (url: string, filename: string): Promise<boolean> => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(downloadUrl);
      return true;
    } catch (error) {
      console.error('Download error:', error);
      return false;
    }
  }
};
