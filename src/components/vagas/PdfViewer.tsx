import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  FileText,
  RefreshCw,
  Info
} from 'lucide-react';

interface PdfViewerProps {
  url: string;
  fileName: string;
  className?: string;


export const PdfViewer: React.FC<PdfViewerProps> = ({ url, fileName, className = '' }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const handleDirectView = () => {
    try {
      const newWindow = window.open(url, '_blank')
      if (!newWindow) {
        setError('Pop-up bloqueado. Tente habilitar pop-ups ou use o download.')
      }
     } catch (err) {
      setError('Erro ao abrir o arquivo. Tente o download.')
    }
  };

  const handleDownload = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Método 1: Fetch + Blob (mais compatível)
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/pdf,*/*'
        };
       catch (error) { console.error('Error:', error) }})

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const blob = await response.blob()
      
      // Verificar se é um PDF válido
      if (blob.size === 0) {
        throw new Error('Arquivo vazio')
      }

      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL do objeto após um tempo
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000)
      
    } catch (err: any) {
      console.error('Erro no download via fetch:', err)
      
      // Método 2: Download direto (fallback)
      try {
        const link = document.createElement('a')
        link.href = url;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
      } catch (directErr) {
        setError(`Erro no download: ${err.message}. Tente clicar com o botão direito no link e "Salvar como".`)
      }
    } finally {
      setIsLoading(false)
    }
  };

  const handleRetry = () => {
    setError(null)
    setIsLoading(false)
  };

  const getFileInfo = () => {
    try {
      const urlObj = new URL(url)
      return {
        domain: urlObj.hostname,
        isCloudinary: urlObj.hostname.includes('cloudinary'),
        fileName: fileName,
        extension: fileName.split('.').pop()?.toLowerCase()
      } catch (error) { console.error('Error:', error) };
    } catch {
      return {
        domain: 'Desconhecido',
        isCloudinary: false,
        fileName: fileName,
        extension: 'pdf'
      };
    }
  };

  const fileInfo = getFileInfo()

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Informações do arquivo */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-gray-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{fileName}</p>
            <p className="text-xs text-gray-500">
              {fileInfo.isCloudinary ? '☁️ Cloudinary' : 'Arquivo'} • 
              {fileInfo.extension?.toUpperCase()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-4 w-4" />
        </Button>
      </div>

      {/* Informações técnicas (expansível) */}
      {showInfo && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            <strong>URL:</strong> {url.substring(0, 60)}...<br/>
            <strong>Servidor:</strong> {fileInfo.domain}<br/>
            <strong>Tipo:</strong> {fileInfo.isCloudinary ? 'Cloudinary CDN' : 'Servidor direto'}
          </AlertDescription>
        </Alert>
      )}

      {/* Botões de ação */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="default"
          size="sm"
          onClick={handleDirectView}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-3 w-3" />
          Abrir PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {isLoading ? 'Baixando...' : 'Download'}
        </Button>

        {error && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="flex items-center gap-1 text-gray-500"
          >
            <RefreshCw className="h-3 w-3" />
            Tentar Novamente
          </Button>
        )}
      </div>

      {/* Mensagens de erro ou sucesso */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Erro:</strong> {error}
            <br />
            <em className="text-xs">
              💡 Dica: Se o problema persistir, peça ao candidato para reenviar o currículo.
            </em>
          </AlertDescription>
        </Alert>
      )}

      {/* Embed do PDF (experimental) */}
      <div className="border rounded-lg overflow-hidden">
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          className="w-full h-96"
          title={`Preview: ${fileName}`}
          onError={() => setError('Não foi possível carregar a prévia do PDF')}
          onLoad={() => setError(null)}
        />
      </div>

      {/* Link direto como fallback */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          Problemas para visualizar? 
          <a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline ml-1"
          >
            Clique aqui para link direto
          </a>
        </p>
      </div>
    </div>
  )
}; 
