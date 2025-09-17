
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardapio } from '@/hooks/useCardapio';
import { Produto, ProdutoCategoriaAdicional } from '@/types/cardapio';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { GruposAssociadosTab } from './adicionais/GruposAssociadosTab';
import { NovoGrupoTab } from './adicionais/NovoGrupoTab';
import { NovaOpcaoTab } from './adicionais/NovaOpcaoTab';
import { CopiarAdicionaisTab } from './adicionais/CopiarAdicionaisTab';

interface AdicionaisModalProps {
  produto: Produto;
  isOpen: boolean;
  onClose: () => void;
}

export const AdicionaisModal: React.FC<AdicionaisModalProps> = ({
  produto,
  isOpen,
  onClose
}) => {
  const { currentCompany } = useAuth();
  const { categoriasAdicionais, adicionais, produtos, fetchCategoriasAdicionais, fetchAdicionais } = useCardapio();
  const [produtoCategoriasAdicionais, setProdutoCategoriasAdicionais] = useState<ProdutoCategoriaAdicional[]>([]);

  useEffect(() => {
    if (isOpen && produto.id) {
      fetchProdutoCategoriasAdicionais();
    }
  }, [isOpen, produto.id]);

  const fetchProdutoCategoriasAdicionais = async () => {
    try {
      const { data, error } = await supabase
        .from('produto_categorias_adicionais')
        .select('*')
        .eq('produto_id', produto.id)
        .order('order_position', { ascending: true });
      
      if (error) throw error;
      setProdutoCategoriasAdicionais(data || []);
      
      // Também atualizar os dados globais para garantir sincronização
      await Promise.all([
        fetchCategoriasAdicionais(),
        fetchAdicionais()
      ]);
    } catch (error) {
      console.error('Erro ao buscar categorias de adicionais do produto:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader className="border-b border-gray-200 pb-4">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Gerenciar Adicionais - {produto.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="associados" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="associados" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Grupos Associados
            </TabsTrigger>
            <TabsTrigger value="categoria" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Novo Grupo
            </TabsTrigger>
            <TabsTrigger value="adicional" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Nova Opção
            </TabsTrigger>
            <TabsTrigger value="copiar" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">
              Copiar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="associados">
            <GruposAssociadosTab
              produto={produto}
              categoriasAdicionais={categoriasAdicionais}
              adicionais={adicionais}
              produtoCategoriasAdicionais={produtoCategoriasAdicionais}
              onRefresh={fetchProdutoCategoriasAdicionais}
            />
          </TabsContent>

          <TabsContent value="categoria">
            <NovoGrupoTab
              currentCompany={currentCompany!}
              produto={produto}
              onRefresh={fetchProdutoCategoriasAdicionais}
            />
          </TabsContent>

          <TabsContent value="adicional">
            <NovaOpcaoTab
              categoriasAdicionais={categoriasAdicionais}
              onRefresh={fetchProdutoCategoriasAdicionais}
            />
          </TabsContent>

          <TabsContent value="copiar">
            <CopiarAdicionaisTab
              produto={produto}
              produtos={produtos}
              onRefresh={fetchProdutoCategoriasAdicionais}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
