
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
// SUPABASE REMOVIDO
import { useToast } from '@/hooks/use-toast';
import { useCardapio } from '@/hooks/useCardapio';

interface NovoGrupoTabProps {
  currentCompany: { id: string };
  produto: { id: string };
  onRefresh: () => void;
}

export const NovoGrupoTab: React.FC<NovoGrupoTabProps> = ({
  currentCompany,
  produto,
  onRefresh
}) => {
  const { toast } = useToast();
  const { fetchCategoriasAdicionais } = useCardapio();
  const [loading, setLoading] = useState(false);
  const [novaCategoriaAdicional, setNovaCategoriaAdicional] = useState({
    name: '',
    description: '',
    is_required: false,
    min_selection: 0,
    max_selection: 1
  });

  const associarCategoriaAoProduto = async (categoriaId: string) => {
    try {
      console.log('🔗 Iniciando associação categoria-produto:', { categoriaId, produtoId: produto.id });
      
      const { error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'produto_categorias_adicionais')
        /* .insert\( REMOVIDO */ ; //[{
          produto_id: produto.id,
          categoria_adicional_id: categoriaId,
          is_required: false,
          min_selection: 0,
          max_selection: 1
        }]);

      if (error) {
        console.error('❌ Erro na associação categoria-produto:', error);
        throw error;
      }
      
      console.log('✅ Associação categoria-produto criada com sucesso');
      onRefresh();
    } catch (error) {
      console.error('💥 Erro geral ao associar categoria ao produto:', error);
      throw error;
    }
  };

  const handleCreateCategoriaAdicional = async () => {
    console.log('🚀 Iniciando criação de grupo de adicionais...');
    console.log('📋 Dados do formulário:', novaCategoriaAdicional);
    console.log('🏢 Empresa atual:', currentCompany);
    console.log('🍕 Produto:', produto);

    if (!novaCategoriaAdicional.name) {
      console.log('❌ Nome do grupo não foi preenchido');
      toast({
        title: "Erro",
        description: "O nome do grupo é obrigatório!",
        variant: "destructive",
      });
      return;
    }

    if (!currentCompany?.id) {
      console.log('❌ Empresa não selecionada');
      toast({
        title: "Erro", 
        description: "Nenhuma empresa selecionada!",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('📤 Enviando dados para o Supabase...');
      
      // Inferir selection_type automaticamente baseado em min/max
      const selection_type = 
        novaCategoriaAdicional.max_selection === 1 ? 'single' : 
        novaCategoriaAdicional.max_selection > 1 ? 'multiple' : 'quantity';

      const dadosParaInserir = {
        ...novaCategoriaAdicional,
        selection_type,
        company_id: currentCompany.id
      };
      
      console.log('📊 Dados finais para inserção:', dadosParaInserir);

      const { data, error } = /* await supabase REMOVIDO */ null
        /* .from REMOVIDO */ ; //'categorias_adicionais')
        /* .insert\( REMOVIDO */ ; //[dadosParaInserir])
        /* .select\( REMOVIDO */ ; //)
        /* .single\( REMOVIDO */ ; //);

      if (error) {
        console.error('❌ Erro do Supabase ao criar categoria:', error);
        console.error('📋 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        toast({
          title: "Erro ao criar grupo",
          description: error.message || "Erro desconhecido ao criar grupo de adicionais",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ Categoria criada com sucesso!', data);
      
      toast({
        title: "Sucesso",
        description: `Grupo "${data.name}" criado com sucesso!`,
      });

      // Limpar formulário
      setNovaCategoriaAdicional({
        name: '',
        description: '',
        is_required: false,
        min_selection: 0,
        max_selection: 1
      });

      console.log('🔗 Iniciando associação com produto...');
      await associarCategoriaAoProduto(data.id);
      
      // Atualizar o estado global das categorias de adicionais
      await fetchCategoriasAdicionais();
      
      // Atualizar também o componente pai (AdicionaisModal) 
      onRefresh();
      
      console.log('🎉 Processo completo finalizado com sucesso!');
      
    } catch (error) {
      console.error('💥 Erro geral na criação do grupo:', error);
      
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar grupo de adicionais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('🏁 Processo finalizado, loading = false');
    }
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold text-gray-900">Criar Novo Grupo de Opções</h3>
      
      {/* Debug Info - remover em produção */}
      <div className="bg-gray-100 p-2 rounded text-xs">
        <strong>Debug:</strong> Empresa: {currentCompany?.id} | Produto: {produto?.id}
      </div>
      
      <div>
        <Label className="text-sm font-medium text-gray-900">Nome do Grupo *</Label>
        <Input
          value={novaCategoriaAdicional.name}
          onChange={(e) => setNovaCategoriaAdicional(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Ex: Molhos, Bebidas, Tamanhos"
          className="mt-1"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">Descrição</Label>
        <Input
          value={novaCategoriaAdicional.description}
          onChange={(e) => setNovaCategoriaAdicional(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição opcional do grupo"
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            checked={novaCategoriaAdicional.is_required}
            onCheckedChange={(checked) => setNovaCategoriaAdicional(prev => ({ ...prev, is_required: checked }))}
          />
          <Label className="text-sm text-gray-900">Obrigatório</Label>
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-900">Mín. Seleções</Label>
          <Input
            type="number"
            min="0"
            value={novaCategoriaAdicional.min_selection}
            onChange={(e) => setNovaCategoriaAdicional(prev => ({ ...prev, min_selection: parseInt(e.target.value) || 0 }))}
            className="mt-1"
          />
        </div>
        
        <div>
          <Label className="text-sm font-medium text-gray-900">Máx. Seleções</Label>
          <Input
            type="number"
            min="1"
            value={novaCategoriaAdicional.max_selection}
            onChange={(e) => setNovaCategoriaAdicional(prev => ({ ...prev, max_selection: parseInt(e.target.value) || 1 }))}
            className="mt-1"
          />
        </div>
      </div>

      <Button 
        onClick={handleCreateCategoriaAdicional} 
        disabled={loading || !novaCategoriaAdicional.name}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Plus className="h-4 w-4 mr-2" />
        {loading ? 'Criando...' : 'Criar Grupo'}
      </Button>
    </div>
  );
};
