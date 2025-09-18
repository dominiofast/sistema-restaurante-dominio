import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CardapioJsonService } from '@/services/cardapioJsonService';
import { AICardapioService } from '@/services/aiCardapioService';
// SUPABASE REMOVIDO
import { Download, RefreshCw, Eye, Copy, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CardapioJsonViewerProps {
  companyId?: string;
}

export const CardapioJsonViewer: React.FC<CardapioJsonViewerProps> = ({ companyId }) => {
  const { currentCompany } = useAuth();
  const { toast } = useToast();
  const [jsonData, setJsonData] = useState<any>(null);
  const [textData, setTextData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [uploadingToAI, setUploadingToAI] = useState(false);
  const [viewMode, setViewMode] = useState<'json' | 'text'>('text');

  const effectiveCompanyId = companyId || currentCompany?.id;

  console.log('🔍 CardapioJsonViewer render:', { 
    companyId, 
    currentCompanyId: currentCompany?.id, 
    effectiveCompanyId,
    loading,
    uploadingToAI
  });

  const generateJson = async () => {
    console.log('🔄 generateJson - INÍCIO');
    
    if (!effectiveCompanyId) {
      console.error('❌ Company ID não encontrado');
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('📋 Chamando CardapioJsonService.generateCardapioJson...');
      const cardapioJson = await CardapioJsonService.generateCardapioJson(effectiveCompanyId);
      console.log('📋 Resultado do service:', cardapioJson);
      
      if (!cardapioJson) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o JSON do cardápio",
          variant: "destructive"
        });
        return;
      }

      setJsonData(cardapioJson);
      const textFormatted = CardapioJsonService.formatJsonToText(cardapioJson);
      setTextData(textFormatted);

      toast({
        title: "Sucesso",
        description: `JSON gerado com ${cardapioJson.totalProdutos} produtos`
      });
    } catch (error) {
      console.error('❌ Erro ao gerar JSON:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar JSON do cardápio",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = async () => {
    if (!effectiveCompanyId) return;

    try {
      const url = await CardapioJsonService.saveJsonToFile(effectiveCompanyId);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.download = `cardapio-${effectiveCompanyId}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: "Sucesso",
          description: "JSON baixado com sucesso"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao baixar JSON",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async () => {
    const content = viewMode === 'json' 
      ? JSON.stringify(jsonData, null, 2)
      : textData;

    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Sucesso",
        description: "Conteúdo copiado para a área de transferência"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao copiar conteúdo",
        variant: "destructive"
      });
    }
  };

  const updateAIAssistant = async () => {
    console.log('🤖 updateAIAssistant - INÍCIO');
    
    if (!effectiveCompanyId) {
      console.error('❌ Company ID não encontrado para IA');
      toast({
        title: "Erro",
        description: "ID da empresa não encontrado",
        variant: "destructive"
      });
      return;
    }

    setUploadingToAI(true);
    
    try {
      console.log('📤 Chamando updateAICardapio...');
      const aiService = new AICardapioService();
      const success = await aiService.updateAICardapio(effectiveCompanyId);
      console.log('📤 Resultado do updateAICardapio:', success);

      if (success) {
        toast({
          title: "Sucesso",
          description: "Cardápio enviado para IA com sucesso!"
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao enviar cardápio para IA",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar IA:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar IA",
        variant: "destructive"
      });
    } finally {
      setUploadingToAI(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          JSON Estruturado do Cardápio para IA
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Gere um JSON estruturado do seu cardápio com todas as opções obrigatórias e opcionais para alimentar a IA
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => {
              console.log('🎯 Botão Gerar JSON clicado');
              generateJson();
            }} 
            disabled={loading || !effectiveCompanyId}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Gerando...' : 'Gerar JSON'}
          </Button>

          <Button 
            onClick={() => {
              console.log('🎯 Botão Enviar para IA clicado');
              updateAIAssistant();
            }} 
            disabled={uploadingToAI || !effectiveCompanyId}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Upload className={`h-4 w-4 ${uploadingToAI ? 'animate-spin' : ''}`} />
            {uploadingToAI ? 'Enviando...' : 'Enviar para IA'}
          </Button>

          {jsonData && (
            <>
              <Button 
                variant="outline" 
                onClick={downloadJson}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar JSON
              </Button>

              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copiar
              </Button>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'text' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('text')}
                  className="rounded-r-none"
                >
                  Texto
                </Button>
                <Button
                  variant={viewMode === 'json' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('json')}
                  className="rounded-l-none"
                >
                  JSON
                </Button>
              </div>
            </>
          )}
        </div>

        {jsonData && (
          <div className="space-y-2">
            <div className="text-sm font-medium">
              {viewMode === 'json' ? 'JSON Estruturado:' : 'Formato de Texto para IA:'}
            </div>
            <Textarea
              value={viewMode === 'json' 
                ? JSON.stringify(jsonData, null, 2)
                : textData
              }
              readOnly
              className="min-h-[400px] font-mono text-xs"
              placeholder="O JSON será exibido aqui após a geração..."
            />
          </div>
        )}

        {jsonData && (
          <div className="text-xs text-muted-foreground border-t pt-2">
            <p><strong>Total de produtos:</strong> {jsonData.totalProdutos}</p>
            <p><strong>Gerado em:</strong> {new Date(jsonData.geradoEm).toLocaleString('pt-BR')}</p>
            <p><strong>Com adicionais:</strong> {jsonData.produtos.filter((p: any) => p.opcoesObrigatorias || p.opcoesOpcionais).length} produtos</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};