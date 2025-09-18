import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { cloudinary } from '@/config/appConfig';
import { toast } from 'sonner';

interface ImageUploaderProps {
  label: string;
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  onRemove?: () => void;
  className?: string;
  maxSize?: number; // em MB
  acceptedFormats?: string[];
  folder?: string;
  multiple?: boolean;
  onMultipleImagesChange?: (urls: string[]) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImageUrl,
  onImageChange,
  onRemove,
  className = '',
  maxSize = 5, // 5MB padrão
  acceptedFormats = cloudinary.ALLOWED_FORMATS,
  folder = 'cardapio',
  multiple = false,
  onMultipleImagesChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const { uploading, error, progress, uploadFile, uploadMultipleFiles } = useCloudinaryUpload();

  const validateFile = (file: File): boolean => {
    // Validar tipo de arquivo
    if (!acceptedFormats.includes(file.type)) {
      toast.error(`Tipo de arquivo não suportado. Use: ${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')}`);
      return false;
    }

    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`Arquivo muito grande. Máximo ${maxSize}MB.`);
      return false;
    }

    return true;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validar todos os arquivos
    const validFiles = fileArray.filter(validateFile);
    if (validFiles.length === 0) return;

    if (multiple) {
      // Upload múltiplo
      const urls = await uploadMultipleFiles(validFiles, folder);
      if (urls.length > 0) {
        onMultipleImagesChange?.(urls);
        setPreviewUrls(urls);
      }
    } else {
      // Upload único
      const file = validFiles[0];
      const url = await uploadFile(file, folder);
      if (url) {
        onImageChange(url);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = () => {
    onImageChange('');
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveMultiple = (index: number) => {
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(newUrls);
    onMultipleImagesChange?.(newUrls);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Área de Upload */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="h-8 w-8 text-blue-500 mx-auto animate-spin" />
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Enviando imagem...</p>
              {progress && (
                <div className="space-y-1">
                  <Progress value={progress.percentage} className="w-full" />
                  <p className="text-xs text-gray-500">
                    {progress.percentage}% - {Math.round(progress.loaded / 1024)}KB / {Math.round(progress.total / 1024)}KB
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : multiple ? (
          <div className="space-y-3">
            <Upload className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                Arraste imagens aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500">
                {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} até {maxSize}MB cada
              </p>
            </div>
          </div>
        ) : currentImageUrl ? (
          <div className="space-y-3">
            <img 
              src={currentImageUrl} 
              alt="Preview" 
              className="h-32 w-full object-cover rounded-lg mx-auto"
            />
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <ImageIcon className="h-8 w-8 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm text-gray-600">
                Clique para selecionar uma imagem
              </p>
              <p className="text-xs text-gray-500">
                {acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} até {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Preview de múltiplas imagens */}
      {multiple && previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <img 
                src={url} 
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveMultiple(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};
