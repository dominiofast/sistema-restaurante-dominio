import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { UploadCloud, CheckCircle, Loader2, X, Image } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  label: string;
  filePath: string;
  onUploadComplete: (url: string) => void;
  currentImageUrl?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  filePath, 
  onUploadComplete,
  currentImageUrl 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const uploadFile = async (file: File) => {
    // Validar tipo de arquivo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Tipo de arquivo não suportado. Use PNG, JPG, WEBP ou GIF.');
      return;
    }

    // Validar tamanho (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setUploading(true);
    const fileName = `${filePath}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

    try {
      console.log('🔄 Iniciando upload:', fileName);

      const { data, error } = await supabase.storage
        .from('vagas_assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Erro no upload:', error);
        throw error;
      }

      console.log('✅ Upload concluído:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('vagas_assets')
        .getPublicUrl(fileName);
      
      console.log('🔗 URL pública:', publicUrl);
      
      onUploadComplete(publicUrl);
      toast.success(`${label} enviado com sucesso!`);

    } catch (error: any) {
      console.error('💥 Erro no upload:', error);
      toast.error(`Erro ao enviar ${label.toLowerCase()}: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onUploadComplete('');
    toast.success(`${label} removido`);
  };

  return (
    <div className="space-y-3" style={{ minHeight: '200px' }}>
      {/* Área de upload com drag & drop */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : uploading 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${uploading ? 'pointer-events-none' : ''}
        `}
        style={{
          minHeight: '120px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: dragOver ? '#EBF8FF' : '#FFFFFF',
          borderColor: dragOver ? '#3182CE' : '#D1D5DB'
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {currentImageUrl && !uploading ? (
          /* Preview da imagem atual */
          <div className="space-y-3" style={{ width: '100%' }}>
            <div className="relative inline-block">
              <img 
                src={currentImageUrl} 
                alt={`Preview ${label}`}
                className="h-24 w-24 object-cover rounded-lg border shadow-sm mx-auto"
                style={{ display: 'block' }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px'
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {label} atual
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                style={{ 
                  display: 'inline-flex',
                  visibility: 'visible',
                  opacity: 1
                }}
              >
                <UploadCloud className="mr-1 h-3 w-3" />
                Alterar {label}
              </button>
            </div>
          </div>
        ) : uploading ? (
          /* Estado de upload */
          <div className="space-y-3" style={{ width: '100%' }}>
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm text-gray-600">Enviando {label.toLowerCase()}...</p>
          </div>
        ) : (
          /* Estado inicial - sem imagem */
          <div className="space-y-3" style={{ width: '100%' }}>
            <Image className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
              <p className="text-xs text-gray-500 mb-3">
                PNG, JPG, WEBP ou GIF • Máximo 5MB
              </p>
            </div>
            <button
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              style={{ 
                display: 'inline-flex',
                visibility: 'visible',
                opacity: 1
              }}
            >
              <UploadCloud className="mr-2 h-4 w-4" />
              Selecionar {label}
            </button>
          </div>
        )}

        {/* Input file oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
          disabled={uploading}
          style={{ display: 'none' }}
        />
      </div>

      {/* Botão adicional SEMPRE VISÍVEL */}
      <div className="flex justify-center" style={{ minHeight: '40px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className={`
            inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors
            ${uploading 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }
          `}
          style={{ 
            display: 'inline-flex',
            visibility: 'visible',
            opacity: 1,
            minWidth: '200px',
            justifyContent: 'center',
            backgroundColor: uploading ? '#F3F4F6' : '#FFFFFF',
            borderColor: '#D1D5DB',
            color: uploading ? '#9CA3AF' : '#374151'
          }}
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <UploadCloud className="mr-2 h-4 w-4" />
              {currentImageUrl ? `Alterar ${label}` : `Enviar ${label}`}
            </>
          )}
        </button>
      </div>

      {/* Debug info - remover depois */}
      <div className="text-xs text-gray-400 text-center" style={{ opacity: 0.5 }}>
        Debug: {uploading ? 'Uploading' : 'Ready'} | {currentImageUrl ? 'Has image' : 'No image'}
      </div>
    </div>
  );
}; 