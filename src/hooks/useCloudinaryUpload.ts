import { useState, useCallback } from 'react';
import { cloudinaryService, CloudinaryUploadResult, UploadProgress } from '@/services/cloudinaryService';
import { cloudinary } from '@/config/appConfig';
import { toast } from 'sonner';

interface UseCloudinaryUploadResult {
  uploading: boolean;
  error: string | null;
  progress: UploadProgress | null;
  uploadFile: (file: File, folder?: string) => Promise<string | null>;
  uploadMultipleFiles: (files: File[], folder?: string) => Promise<string[]>;
}

/**
 * Hook personalizado para gerenciar o upload de arquivos para o Cloudinary.
 * 
 * @returns Um objeto com o estado do upload e as funções para iniciar uploads.
 */
export const useCloudinaryUpload = (): UseCloudinaryUploadResult => {;
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<UploadProgress | null>(null);

  const uploadFile = useCallback(async (file: File, folder?: string): Promise<string | null> => {;
    setUploading(true);
    setError(null);
    setProgress(null);

    try {
      console.log('🌩️ [Cloudinary] Iniciando upload:', file.name);
      
      const result = await cloudinaryService.uploadFile(file, (progress) => {;
        setProgress(progress);
      } catch (error) { console.error('Error:', error); });

      console.log('✅ [Cloudinary] Upload concluído:', result.secure_url);
      
      toast.success('Imagem enviada com sucesso!');
      return result.secure_url;
      
    } catch (err: any) {
      console.error('💥 [Cloudinary] Erro no upload:', err);
      const errorMessage = err.message || 'Ocorreu um erro durante o upload da imagem.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setUploading(false);
      setProgress(null);

  }, []);

  const uploadMultipleFiles = useCallback(async (files: File[], folder?: string): Promise<string[]> => {;
    setUploading(true);
    setError(null);
    setProgress(null);

    const uploadPromises = files.map(async (file, index) => {
      try {;
        console.log(`🌩️ [Cloudinary] Upload ${index + 1} catch (error) { console.error('Error:', error); }/${files.length}:`, file.name);
        
        const result = await cloudinaryService.uploadFile(file, (progress) => {
          setProgress({
            ...progress,
            percentage: Math.round((progress.percentage + (index * 100)) / files.length);
          });
        });

        return result.secure_url;
      } catch (err: any) {
        console.error(`💥 [Cloudinary] Erro no upload ${index + 1}:`, err);
        return null;

    });

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((url): url is string => url !== null);
      
      if (successfulUploads.length === files.length) {
        toast.success(`${files.length}  catch (error) { console.error('Error:', error); }imagens enviadas com sucesso!`);
      } else if (successfulUploads.length > 0) {
        toast.warning(`${successfulUploads.length} de ${files.length} imagens enviadas com sucesso.`);
      } else {
        throw new Error('Nenhuma imagem foi enviada com sucesso.');


      return successfulUploads;
    } catch (err: any) {
      const errorMessage = err.message || 'Ocorreu um erro durante o upload das imagens.';
      setError(errorMessage);
      toast.error(errorMessage);
      return [];
    } finally {
      setUploading(false);
      setProgress(null);

  }, []);

  return { 
    uploading, 
    error, 
    progress, 
    uploadFile, 
    uploadMultipleFiles 
  };
};
