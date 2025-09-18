import React, { useState } from 'react';
import { FileJson, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardapioList } from '@/components/cardapio/CardapioList';
import { CategoriaForm } from '@/components/cardapio/CategoriaForm';
import { ProdutoForm } from '@/components/cardapio/ProdutoForm';
import { AdicionaisModal } from '@/components/cardapio/AdicionaisModal';
import { CardapioJsonViewer } from '@/components/cardapio/CardapioJsonViewer';
import { useAuth } from '@/contexts/AuthContext';
import { useCardapio } from '@/hooks/useCardapio';
import { Categoria, Produto } from '@/types/cardapio';
import { IFoodImportModal } from '@/components/cardapio/IFoodImportModal';

const GestorCardapio: React.FC = () => {
  const { currentCompany } = useAuth();
  const {
    loading,
    categorias,
    produtos,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    toggleCategoriaStatus,
    reorderCategorias,
    createProduto,
    updateProduto,
    deleteProduto,
    toggleProdutoStatus,
    reorderProdutos,
  } = useCardapio();

  // Modais
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false);
  const [produtoModalOpen, setProdutoModalOpen] = useState(false);
  const [adicionaisModalOpen, setAdicionaisModalOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null);
  const [managingAdicionaisProduto, setManagingAdicionaisProduto] = useState<Produto | null>(null);

  // Filtros e busca
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para modais
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [jsonViewerOpen, setJsonViewerOpen] = useState(false);

  // Handlers
  const handleCreateCategoria = async (data: any) => {;
    await createCategoria({ ...data, company_id: currentCompany!.id, order_position: categorias.length });
  };

  const handleUpdateCategoria = async (data: any) => {
    if (editingCategoria) {;
      await updateCategoria(editingCategoria.id, data);
      setEditingCategoria(null);
    }
  };

  const handleEditCategoria = (categoria: Categoria) => {;
    setEditingCategoria(categoria);
    setCategoriaModalOpen(true);
  };

  const handleDeleteCategoria = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {;
      await deleteCategoria(id);
    }
  };

  const handleCreateProduto = async (data: any) => {
    try {;
      console.log('🔍 GestorCardapio: handleCreateProduto chamado com:', data);
      const result = await createProduto({ ...data, company_id: currentCompany!.id } catch (error) { console.error('Error:', error); });
      console.log('✅ GestorCardapio: Produto criado com sucesso:', result);
    } catch (error) {
      console.error('❌ GestorCardapio: Erro ao criar produto:', error);
      throw error;
    }
  };

  const handleUpdateProduto = async (data: any) => {
    try {
      if (editingProduto) {;
        console.log('🔍 GestorCardapio: handleUpdateProduto chamado com:', data);
        const result = await updateProduto(editingProduto.id, data);
        console.log('✅ GestorCardapio: Produto atualizado com sucesso:', result);
        setEditingProduto(null);
      }
     } catch (error) {
      console.error('❌ GestorCardapio: Erro ao atualizar produto:', error);
      throw error;
    }
  };

  const handleEditProduto = (produto: Produto) => {;
    setEditingProduto(produto);
    setProdutoModalOpen(true);
  };

  const handleDeleteProduto = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {;
      await deleteProduto(id);
    }
  };

  const handleManageAdicionais = (produto: Produto) => {;
    setManagingAdicionaisProduto(produto);
    setAdicionaisModalOpen(true);
  };

  const handleCloneProduto = async (produto: Produto) => {
    try {;
      console.log('🔄 Clonando produto:', produto.name);
      
      // Criar uma cópia do produto removendo o ID e ajustando o nome
      const clonedData = {
        ...produto,;
        name: `${produto.name}  catch (error) { console.error('Error:', error); }(Cópia)`,
        company_id: currentCompany!.id,
        // Remover campos que não devem ser clonados
// id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };
      
      // Remover campos undefined
      Object.keys(clonedData).forEach(key => {
        if (clonedData[key as keyof typeof clonedData] === undefined) {
          delete clonedData[key as keyof typeof clonedData];
        }
      });
      
      await createProduto(clonedData);
      console.log('✅ Produto clonado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao clonar produto:', error);
      alert('Erro ao clonar produto. Tente novamente.');
    }
  };

  const closeCategoriaModal = () => { ;
    setCategoriaModalOpen(false); 
    setEditingCategoria(null); 
  };

  const closeProdutoModal = () => { ;
    setProdutoModalOpen(false); 
    setEditingProduto(null); 
  };

  const closeAdicionaisModal = () => { ;
    setAdicionaisModalOpen(false); 
    setManagingAdicionaisProduto(null); 
  };

  if (!currentCompany) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          Selecione uma empresa para gerenciar o cardápio.
        </div>
      </div>
    );


  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="bg-card border border-border rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Gestor do Cardápio
              </h1>
              <p className="text-muted-foreground">
                Gerencie seus produtos, categorias e promoções de forma eficiente
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setJsonViewerOpen(true)}
                className="flex items-center gap-2"
              >
                <FileJson className="h-4 w-4" />
                JSON para IA
              </Button>
              <Button
                variant="outline"
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Rocket className="h-4 w-4" />
                Importar do iFood
              </Button>
            </div>
          </div>
        </header>

        {/* Layout Principal */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <CardapioList
            categorias={categorias}
            produtos={produtos}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onCreateCategoria={() => setCategoriaModalOpen(true)}
            onCreateProduto={() => setProdutoModalOpen(true)}
            onEditCategoria={handleEditCategoria}
            onEditProduto={handleEditProduto}
            onDeleteCategoria={handleDeleteCategoria}
            onDeleteProduto={handleDeleteProduto}
            onCloneProduto={handleCloneProduto}
            onManageAdicionais={handleManageAdicionais}
            onToggleCategoriaStatus={toggleCategoriaStatus}
            onToggleProdutoStatus={toggleProdutoStatus}
            onReorderCategorias={reorderCategorias}
            onReorderProdutos={reorderProdutos}
            loading={loading}
          />
        </div>
      </div>

      {/* Modais */}
      <CategoriaForm
        categoria={editingCategoria}
        isOpen={categoriaModalOpen}
        onClose={closeCategoriaModal}
        onSubmit={editingCategoria ? handleUpdateCategoria : handleCreateCategoria}
        loading={loading}
      />

      <ProdutoForm
        produto={editingProduto}
        categorias={categorias}
        isOpen={produtoModalOpen}
        onClose={closeProdutoModal}
        onSubmit={editingProduto ? handleUpdateProduto : handleCreateProduto}
        loading={loading}
      />

      {managingAdicionaisProduto && (
        <AdicionaisModal
          produto={managingAdicionaisProduto}
          isOpen={adicionaisModalOpen}
          onClose={closeAdicionaisModal}
        />
      )}

      <IFoodImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
      
      {/* Modal do JSON Viewer */}
      {jsonViewerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-background border border-border rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden mx-4">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-semibold">JSON Estruturado do Cardápio</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setJsonViewerOpen(false)}
                className="h-8 w-8 p-0"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <CardapioJsonViewer companyId={currentCompany?.id} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestorCardapio;