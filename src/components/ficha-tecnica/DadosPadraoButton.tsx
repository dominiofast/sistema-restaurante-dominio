import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Info, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { FichasTecnicasDefaultService } from '@/services/fichasTecnicasDefaultService';
import PreviewDadosPadrao from './PreviewDadosPadrao';

interface DadosPadraoButtonProps {
  tipo: 'mercadorias' | 'receitas';
  onSucesso?: () => void;
  className?: string;
}

const DadosPadraoButton: React.FC<DadosPadraoButtonProps> = ({
  tipo,
  onSucesso,
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();
  const { user, currentCompany } = useAuth();

  const stats = FichasTecnicasDefaultService.getDadosEstatisticas();
  const dadosInfo = tipo === 'mercadorias' ? stats.mercadorias : stats.receitas;

  const handleCarregarDados = async () => {
    if (!user || !currentCompany?.id) {
      toast({
        title: 'Erro',
        description: 'Usuário ou empresa não identificados',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setDialogOpen(false);

    try {
      let resultado;
      
      if (tipo === 'mercadorias') {
        resultado = await FichasTecnicasDefaultService.carregarMercadoriasPadrao(
          currentCompany.id, 
          user.id
        );
      } else {
        resultado = await FichasTecnicasDefaultService.carregarReceitasPadrao(
          currentCompany.id, 
          user.id
        );
      }

      if (resultado.sucesso) {
        toast({
          title: 'Dados carregados!',
          description: resultado.mensagem,
          duration: 5000,
        });
        
        // Callback de sucesso para recarregar a lista
        if (onSucesso) {
          setTimeout(() => onSucesso(), 1000);
        }
      } else {
        toast({
          title: 'Aviso',
          description: resultado.mensagem,
          variant: 'destructive',
        });
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados padrão:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro inesperado ao carregar os dados',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTitulo = () => {
    return tipo === 'mercadorias' 
      ? 'Carregar Ingredientes Padrão' 
      : 'Carregar Receitas Padrão';
  };

  const getDescricao = () => {
    const itemNome = tipo === 'mercadorias' ? 'ingredientes' : 'receitas';
    const exemplos = tipo === 'mercadorias' 
      ? 'farinha de trigo, mussarela, calabresa, molho de tomate, etc.'
      : 'massa de pizza, molho base, pizza margherita, pizza calabresa, etc.';

    return (
      <div className="space-y-3">
        <p>
          Esta ação carregará <strong>{dadosInfo.total} {itemNome}</strong> pré-definidos 
          organizados em <strong>{dadosInfo.categorias} categorias</strong>, incluindo:
        </p>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {exemplos}
        </div>
        <div className="space-y-2">
          <p className="font-medium text-blue-600 flex items-center gap-2">
            <Info className="h-4 w-4" />
            Categorias incluídas:
          </p>
          <div className="flex flex-wrap gap-1">
            {dadosInfo.categoriasNomes.map(categoria => (
              <Badge key={categoria} variant="secondary" className="text-xs">
                {categoria}
              </Badge>
            ))}
          </div>
        </div>
        <div className="border-t pt-3 mt-3 text-sm text-amber-700 bg-amber-50 p-2 rounded">
          <p className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <strong>Importante:</strong> Só é possível carregar se não existirem dados já cadastrados.
          </p>
        </div>
      </div>
    );
  };

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 ${className}`}
          disabled={loading}
        >
          <Download className="h-4 w-4 mr-2" />
          {loading ? 'Carregando...' : getTitulo()}
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600" />
            {getTitulo()}
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh]">
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                Informações
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="space-y-4">
              <AlertDialogDescription asChild>
                {getDescricao()}
              </AlertDialogDescription>
            </TabsContent>
            
            <TabsContent value="preview">
              <PreviewDadosPadrao tipo={tipo} />
            </TabsContent>
          </Tabs>
        </div>
        
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCarregarDados}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading ? 'Carregando...' : `Carregar ${dadosInfo.total} ${tipo}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DadosPadraoButton; 