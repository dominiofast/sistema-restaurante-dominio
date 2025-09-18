import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// SUPABASE REMOVIDO
import { toast } from 'sonner';
import { Upload, FileText, X, Check, AlertCircle } from 'lucide-react';

interface CurriculoUploadProps {
  onUploadSuccess: (url: string, fileName: string) => void;
  currentFile?: string;
  disabled?: boolean;
}

const CurriculoUpload: React.FC<CurriculoUploadProps> = ({
  onUploadSuccess,
  currentFile,
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(currentFile || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Verificar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return 'Formato não suportado. Use PDF, DOC ou DOCX.';
    }

    // Verificar tamanho (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      return 'Arquivo muito grande. Máximo 10MB.';
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);

      console.log('Processando arquivo:', file.name);
      console.log('Tamanho do arquivo:', file.size, 'bytes');
      console.log('Tipo do arquivo:', file.type);

      // Converter arquivo para Base64
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(reader.error);
      });

      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      console.log('Arquivo convertido para Base64');

      // Criar URL de dados para o arquivo
      const fileUrl = base64Data;
      
      setUploadedFile(file.name);
      onUploadSuccess(fileUrl, file.name);
      
      toast.success('Currículo processado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao processar arquivo:', error);
      
      let errorMessage = 'Erro ao processar currículo';
      if (error.message.includes('size')) {
        errorMessage = 'Arquivo muito grande. Máximo 10MB.';
      } else if (error.message.includes('type') || error.message.includes('format')) {
        errorMessage = 'Formato de arquivo não suportado. Use PDF, DOC ou DOCX.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    onUploadSuccess('', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (uploading) {
      return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>;
    }
    if (uploadedFile) {
      return <Check className="h-5 w-5 text-green-600" />;
    }
    return <Upload className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = () => {
    if (uploading) return 'border-blue-300 bg-blue-50';
    if (uploadedFile) return 'border-green-300 bg-green-50';
    return 'border-gray-300 hover:border-blue-400';
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
        <FileText className="h-4 w-4" />
        Currículo *
      </Label>
      
      <div className={`border-2 border-dashed rounded-lg p-4 transition-colors ${getStatusColor()}`}>
        {!uploadedFile ? (
          <div className="text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={disabled || uploading}
              className="hidden"
              id="curriculo-upload"
            />
            <label
              htmlFor="curriculo-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${
                disabled || uploading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {getFileIcon()}
              <div className="text-sm">
                <span className="font-medium text-blue-600">
                  {uploading ? 'Enviando...' : 'Clique para enviar'}
                </span>
                <span className="text-gray-500"> ou arraste aqui</span>
              </div>
              <p className="text-xs text-gray-400">
                PDF, DOC ou DOCX até 10MB
              </p>
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getFileIcon()}
              <div>
                <p className="text-sm font-medium text-gray-900">{uploadedFile}</p>
                <p className="text-xs text-gray-500">Currículo enviado com sucesso</p>
              </div>
            </div>
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={removeFile}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-2 text-xs text-green-600">
          <Check className="h-3 w-3" />
          <span>Arquivo pronto para envio com a candidatura</span>
        </div>
      )}
    </div>
  );
};

export default CurriculoUpload; 