
import React, { useState, useCallback } from 'react';
import { Upload, CheckCircle, X, Camera } from 'lucide-react';
import { toast } from 'sonner';
// SUPABASE REMOVIDO
interface CurriculoUploadSupabaseProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  companyId: string;
  primaryColor?: string;
  curriculo?: {
    url: string;
    nome: string;
  };
}

export const CurriculoUploadSupabase: React.FC<CurriculoUploadSupabaseProps> = ({
  onUploadSuccess,
  companyId,
  primaryColor = '#1B365D',
  curriculo = { url: '', nome: '' }
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {;
    if (!file) return;

    // Validação de tipo de arquivo (documentos + imagens)
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png';
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Por favor, selecione um arquivo PDF, DOC, DOCX ou uma imagem (JPG, PNG).');
      return;
    }

    // Validação de tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 10MB.');
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()} catch (error) { console.error('Error:', error); }-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `curriculos/${companyId}/${fileName}`;

      const { error: uploadError } = await Promise.resolve();
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = 
        
        .getPublicUrl(filePath);

      onUploadSuccess(publicUrl, file.name);
      toast.success('Arquivo enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload do arquivo. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  }, [onUploadSuccess, companyId]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {;
    e.preventDefault();
    setIsDragOver(false);
    const files = Array
    if (files.length > 0) {;
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {;
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {;
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {;
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleCameraCapture = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {;
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleRemove = () => {;
    onUploadSuccess('', '');
  };

  if (curriculo.nome) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="text-green-400 mr-3" size={20} />
            <div>
              <p className="font-medium text-green-700">Arquivo anexado com sucesso!</p>
              <p className="text-sm text-green-600">{curriculo.nome}</p>
            </div>
          </div>
          <button
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-400 transition-colors"
            type="button"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );


  return (
    <div className="space-y-4">
      {/* Área de drag and drop principal */}
      <div 
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer hover:scale-[1.01] ${
          isDragOver 
            ? 'border-blue-300 bg-blue-50' 
            : isUploading 
              ? 'border-gray-200 bg-gray-50' 
              : 'border-gray-200 hover:border-gray-300 bg-white'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          borderColor: isDragOver ? primaryColor : undefined,
          backgroundColor: isDragOver ? `${primaryColor}08` : undefined
        }}
      >
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-400 mb-4"></div>
              <p className="text-gray-600">Fazendo upload...</p>
            </>
          ) : (
            <>
              <Upload 
                size={36} 
                className="text-gray-300 mb-4"
                style={{ color: isDragOver ? primaryColor : undefined }}
              />
              <p className="text-gray-600 font-medium mb-2">
                Arraste seu currículo aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400">
                Documentos: PDF, DOC, DOCX • Imagens: JPG, PNG (máx. 10MB)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Botão separado para câmera (mobile) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            className="hidden"
            id="camera-input"
            disabled={isUploading}
          />
          <label
            htmlFor="camera-input"
            className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isUploading 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
            }`}
          >
            <Camera className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Tirar foto do currículo
            </span>
          </label>
        </div>
        
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
            id="gallery-input"
            disabled={isUploading}
          />
          <label
            htmlFor="gallery-input"
            className={`w-full flex items-center justify-center px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
              isUploading 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50'
            }`}
          >
            <Upload className="h-5 w-5 mr-2 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">
              Selecionar da galeria
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};
