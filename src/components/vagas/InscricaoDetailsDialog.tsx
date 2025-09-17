import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Mail, 
  Phone, 
  Linkedin, 
  FileText, 
  ExternalLink,
  Download,
  Copy,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Inscricao {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  linkedin_url?: string;
  curriculo_url?: string;
  curriculo_nome?: string;
  carta_apresentacao?: string;
  experiencia_relevante?: string;
  pretensao_salarial?: string;
  disponibilidade_inicio?: string;
  status: string;
  created_at: string;
  rh_vagas: {
    title: string;
    location: string;
  };
}

interface InscricaoDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inscricao: Inscricao | null;
  onUpdateStatus: (inscricaoId: string, newStatus: string) => void;
}

export const InscricaoDetailsDialog: React.FC<InscricaoDetailsDialogProps> = ({
  open,
  onOpenChange,
  inscricao,
  onUpdateStatus
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!inscricao) return null;

  const handleViewCurriculo = () => {
    if (!inscricao.curriculo_url) {
      toast.error('URL do currículo não encontrada');
      return;
    }

    console.log('🔍 Tentando abrir currículo:', inscricao.curriculo_url);
    
    try {
      const newWindow = window.open(inscricao.curriculo_url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        toast.warning('Pop-up bloqueado! Tentando download...', {
          description: 'Habilite pop-ups ou use o botão Download'
        });
        handleDownloadCurriculo();
      } else {
        toast.success('Abrindo currículo em nova aba');
      }
    } catch (error) {
      console.error('Erro ao abrir currículo:', error);
      toast.error('Erro ao abrir. Tentando download...');
      handleDownloadCurriculo();
    }
  };

  const handleDownloadCurriculo = async () => {
    if (!inscricao.curriculo_url) {
      toast.error('URL do currículo não encontrada');
      return;
    }

    setIsDownloading(true);
    console.log('📥 Iniciando download:', inscricao.curriculo_url);

    try {
      // Primeiro, tentar fetch com blob
      const response = await fetch(inscricao.curriculo_url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Accept': 'application/pdf,application/octet-stream,*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('📦 Blob criado:', { size: blob.size, type: blob.type });

      if (blob.size === 0) {
        throw new Error('Arquivo vazio (0 bytes)');
      }

      // Criar download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = inscricao.curriculo_nome || `curriculo_${inscricao.nome_completo.replace(/\s+/g, '_')}.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpar URL após um tempo
      setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
      
      toast.success(`Download iniciado! (${Math.round(blob.size / 1024)} KB)`);

    } catch (error: any) {
      console.error('❌ Erro no download via fetch:', error);
      
      // Fallback: download direto
      try {
        const link = document.createElement('a');
        link.href = inscricao.curriculo_url;
        link.download = inscricao.curriculo_nome || 'curriculo.pdf';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.warning('Download iniciado (método alternativo)', {
          description: 'Se não funcionar, copie a URL e cole no navegador'
        });
        
      } catch (directError) {
        console.error('❌ Erro no download direto:', directError);
        toast.error(`Erro no download: ${error.message}`, {
          description: 'Tente copiar a URL e abrir manualmente'
        });
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!inscricao.curriculo_url) {
      toast.error('URL do currículo não encontrada');
      return;
    }

    try {
      await navigator.clipboard.writeText(inscricao.curriculo_url);
      toast.success('URL copiada para a área de transferência!', {
        description: 'Cole em uma nova aba do navegador para acessar'
      });
    } catch (error) {
      console.error('Erro ao copiar URL:', error);
      toast.error('Erro ao copiar URL. Tente selecionar manualmente.');
    }
  };

  const getFileExtension = (fileName?: string) => {
    if (!fileName) return 'arquivo';
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ext || 'arquivo';
  };

  const isImageFile = (fileName?: string) => {
    const ext = getFileExtension(fileName);
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto !bg-white"
        style={{ backgroundColor: '#ffffff', color: '#000000' }}
      >
        <DialogHeader style={{ backgroundColor: '#ffffff' }}>
          <DialogTitle className="text-xl font-semibold">
            Detalhes da Candidatura
          </DialogTitle>
          <DialogDescription>
            {inscricao.nome_completo} - {inscricao.rh_vagas.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 p-6" style={{ backgroundColor: '#ffffff' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Coluna da Esquerda: Informações Pessoais e Currículo */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Informações de Contato</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>{inscricao.email}</span>
                </div>
                {inscricao.telefone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{inscricao.telefone}</span>
                  </div>
                )}
                {inscricao.linkedin_url && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-4 w-4 text-gray-500" />
                    <a 
                      href={inscricao.linkedin_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      Perfil no LinkedIn
                    </a>
                  </div>
                )}
              </div>

              {inscricao.curriculo_url && (
                <div className="pt-4">
                  <h4 className="font-medium text-gray-800 mb-2">
                    {isImageFile(inscricao.curriculo_nome) ? 'Currículo (Imagem)' : 'Currículo'}
                  </h4>
                  
                  <div className="space-y-3">
                    {/* Informações do arquivo */}
                    <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      <FileText className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate" title={inscricao.curriculo_nome}>
                          {inscricao.curriculo_nome || 'Arquivo Anexado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getFileExtension(inscricao.curriculo_nome).toUpperCase()} • 
                          {isImageFile(inscricao.curriculo_nome) ? ' Imagem' : ' Documento'}
                        </p>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        onClick={handleViewCurriculo}
                        size="sm"
                        variant="default"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {isImageFile(inscricao.curriculo_nome) ? 'Ver Imagem' : 'Ver Arquivo'}
                      </Button>

                      <Button 
                        onClick={handleDownloadCurriculo}
                        size="sm"
                        variant="outline"
                        disabled={isDownloading}
                        className="flex items-center gap-1"
                      >
                        <Download className={`h-3 w-3 ${isDownloading ? 'animate-spin' : ''}`} />
                        {isDownloading ? 'Baixando...' : 'Download'}
                      </Button>

                      <Button 
                        onClick={handleCopyUrl}
                        size="sm"
                        variant="ghost"
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copiar URL
                      </Button>
                    </div>

                    {/* Aviso explicativo */}
                    <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-blue-700">
                        <p className="font-medium">Dicas:</p>
                        <p>• Se "Ver Arquivo" não funcionar, use "Download"</p>
                        <p>• "Copiar URL" permite abrir em nova aba manualmente</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Coluna da Direita: Informações da Candidatura */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">Detalhes da Candidatura</h4>
              <div className="space-y-3 text-sm bg-slate-50 p-4 rounded-lg border border-slate-200">
                {inscricao.pretensao_salarial && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Pretensão Salarial:</span> 
                    <span className="text-gray-800">{inscricao.pretensao_salarial}</span>
                  </div>
                )}
                {inscricao.disponibilidade_inicio && (
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-600">Disponibilidade:</span> 
                    <span className="text-gray-800">{inscricao.disponibilidade_inicio}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Data da Inscrição:</span> 
                  <span className="text-gray-800">{new Date(inscricao.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>

          {inscricao.experiencia_relevante && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Experiência Relevante</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">
                {inscricao.experiencia_relevante}
              </p>
            </div>
          )}

          {inscricao.carta_apresentacao && (
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Carta de Apresentação</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-200">
                {inscricao.carta_apresentacao}
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t mt-6">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status da candidatura:</span>
              <Select
                value={inscricao.status}
                onValueChange={(value) => onUpdateStatus(inscricao.id, value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="em_analise">Em Análise</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
