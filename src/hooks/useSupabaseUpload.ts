import { useState, useCallback } from 'react';
import { uploadFileToSupabase } from '@/services/supabaseStorageService';

interface UseSupabaseUploadResult {
  uploading: boolean;
  error: string | null;
  uploadFile: (file: File, companyId: string) => Promise<string | null>;
}

/**
 * Hook personalizado para gerenciar o upload de arquivos para o Supabase Storage.
 *
 * @returns Um objeto com o estado do upload e a função para iniciar o upload.
 */
export const useSupabaseUpload = (): UseSupabaseUploadResult => {
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(async (file: File, companyId: string): Promise<string | null> => {
    setUploading(true)
    setError(null)

    try {
      const publicUrl = await uploadFileToSupabase(file, companyId)
      return publicUrl;
    } catch (err: any) {
      console.error('[useSupabaseUpload] Falha no upload:', err)
      setError(err.message || 'Ocorreu um erro desconhecido durante o upload.')
      return null;
    } finally {
      setUploading(false)
    }
  }, [])

  return { uploading, error, uploadFile };
};
