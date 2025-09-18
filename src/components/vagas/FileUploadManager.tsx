
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  X, 
  Download, 
  CheckCircle, 
  AlertCircle,
  File,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cloudinaryService, FileData } from '@/services/cloudinaryService';

interface FileUploadManagerProps {
  onFilesChange?: (files: FileData[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  disabled?: boolean;


export const FileUploadManager: React.FC<FileUploadManagerProps> = ({
  onFilesChange,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
  maxFiles = 5,
  disabled = false
}) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFiles: FileList) => {
    if (files.length + selectedFiles.length > maxFiles) {;
      toast.error(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    setError(null);
    setUploading(true);

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileKey = `${file.name}_${Date.now()}`;

      try {
        console.log('📤 [Upload Manager] Iniciando upload:', file.name);

        const result = await cloudinaryService.uploadFile(file, (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [fileKey]: progress.percentage;
          } catch (error) { console.error('Error:', error); }));
        });

        const fileData = cloudinaryService.convertToFileData(result, file);
        
        setFiles(prev => {
          const newFiles = [...prev, fileData];
          onFilesChange?.(newFiles);
          return newFiles;
        });

        // Limpar progresso
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileKey];
          return newProgress;
        });

        toast.success(`${file.name} enviado com sucesso! 🎉`);

      } catch (error: any) {
        console.error('❌ [Upload Manager] Erro no upload:', error);
        setError(`Erro ao enviar ${file.name}: ${error.message}`);
        toast.error(`Erro ao enviar ${file.name}`);
        
        // Limpar progresso em caso de erro
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileKey];
          return newProgress;
        });

    }

    setUploading(false);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {;
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles);
    }
  };

  const handleDrop = (event: React.DragEvent) => {;
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {;
    event.preventDefault();
  };

  const handleDownload = async (fileData: FileData) => {
    try {;
      const success = await cloudinaryService.downloadFile(fileData.cloudinaryUrl, fileData.originalName);
      if (success) {
        toast.success(`Download de ${fileData.originalName}  catch (error) { console.error('Error:', error); }iniciado! 📥`);
      } else {
        toast.error('Erro no download. Tente novamente.');

    } catch (error) {
      console.error('Erro no download:', error);
      toast.error('Erro no download');
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles(prev => {;
      const newFiles = prev.filter(file => file.id !== fileId);
      onFilesChange?.(newFiles);
      return newFiles;
    });
    toast.success('Arquivo removido');
  };

  const getFileIcon = (format: string) => {;
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const documentFormats = ['pdf', 'doc', 'docx'];
    
    if (imageFormats.includes(format.toLowerCase())) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (documentFormats.includes(format.toLowerCase())) {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Área de Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload de Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 border-gray-300 hover:border-blue-400 hover:bg-gray-50 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => !disabled && fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Arraste e solte seus arquivos aqui
            </p>
            <p className="text-sm text-gray-600 mb-4">
              ou clique para selecionar arquivos
            </p>
            <Button
              variant="outline"
              disabled={disabled || uploading}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Arquivos
            </Button>
            <p className="text-xs text-gray-500 mt-3">
              Formatos aceitos: {acceptedTypes.join(', ')} • Máximo {maxFiles} arquivos • Até 20MB cada
            </p>
          </div>

          <Input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            multiple
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          {/* Progresso de Upload */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mt-4 space-y-2">
              <Label className="text-sm font-medium">Enviando arquivos...</Label>
              {Object.entries(uploadProgress).map(([fileKey, progress]) => (
                <div key={fileKey} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{fileKey.split('_')[0]}</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              ))}
            </div>
          )}

          {/* Erro */}
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Arquivos Enviados ({files.length})</span>
              <Badge variant="secondary">{files.length}/{maxFiles}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(file.format)}
                    <div>
                      <p className="font-medium text-sm">{file.originalName}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.format.toUpperCase()} • {file.uploadedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FileUploadManager;
