import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Store, MapPin, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner';

interface StoreInfo {
  id: string;
  merchant_id: string;
  store_name: string;
  is_active: boolean;
  company_name: string;
  environment?: string;
}

interface StoreSelectorProps {
  selectedStore: StoreInfo | null;
  onStoreSelect: (store: StoreInfo | null) => void;
}

const StoreSelector: React.FC<StoreSelectorProps> = ({ selectedStore, onStoreSelect }) => {
  const { user, currentCompany } = useAuth();
  const [open, setOpen] = useState(false);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [filteredStores, setFilteredStores] = useState<StoreInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchStores();
    }
  }, [open, user?.role]);

  useEffect(() => {
    filterStores();
  }, [stores, searchTerm]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      
      console.log('🏪 StoreSelector: Buscando lojas...');
      console.log('👤 Usuário:', user?.name, 'Role:', user?.role);
      console.log('🏢 Empresa atual:', currentCompany?.name, 'ID:', currentCompany?.id);
      
      let query = supabase
        .from('companies')
        .select(`
          id,
          name,
          domain,
          status,
          plan,
          user_count
        `)
        .eq('status', 'active');

      // Se não é super admin, filtrar apenas a empresa atual
      if (user?.role !== 'super_admin' && currentCompany?.id) {
        console.log('🔍 Filtrando por empresa:', currentCompany.id);
        query = query.eq('id', currentCompany.id);
      } else if (user?.role === 'super_admin') {
        console.log('👑 Super admin - buscando todas as empresas');
      }

      const { data, error } = await query.order('name');
      
      console.log('📊 Resultado da query:', { data, error });

      if (error) throw error;

      console.log(`✅ Encontradas ${data?.length || 0} lojas`);

      // Formatar empresas como lojas
      const formattedStores = (data || []).map((company) => ({
        id: company.id,
        merchant_id: company.domain,
        store_name: company.name,
        is_active: company.status === 'active',
        company_name: company.name,
        environment: company.plan
      }));

      console.log('🏪 Lojas formatadas:', formattedStores);
      setStores(formattedStores);
    } catch (error) {
      console.error('❌ Erro ao carregar lojas:', error);
      toast.error('Erro ao carregar lojas disponíveis');
    } finally {
      setLoading(false);
    }
  };

  const filterStores = () => {
    if (!searchTerm.trim()) {
      setFilteredStores(stores);
      return;
    }

    const filtered = stores.filter(store => 
      store.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.merchant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.company_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStores(filtered);
  };

  const handleStoreSelect = (store: StoreInfo) => {
    console.log('🎯 StoreSelector: handleStoreSelect chamado com:', store);
    onStoreSelect(store);
    setOpen(false);
    setSearchTerm('');
    console.log('✅ StoreSelector: Store selecionada e modal fechado');
    toast.success(`Loja selecionada: ${store.store_name}`);
  };

  const clearSelection = () => {
    onStoreSelect(null);
    setOpen(false);
    toast.success('Filtro de loja removido - visualizando todas as lojas');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex items-center gap-2 min-w-[180px] justify-between 
            bg-white/10 hover:bg-white/20 text-white border-white/20 
            transition-all duration-300 hover:scale-105 py-2 px-3
            ${selectedStore ? 'bg-white/20' : ''}`}
          size="sm"
        >
          <div className="flex items-center gap-2">
            <Store className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate text-xs sm:text-sm">
              {selectedStore ? selectedStore.store_name : 'Todas as lojas'}
            </span>
            {selectedStore && (
              <Badge variant="secondary" className="text-xs bg-white/20 text-white border-white/20">
                Filtrado
              </Badge>
            )}
          </div>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-70" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-full max-w-2xl h-[90vh] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Store className="w-5 h-5" />
            Escolher loja
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 min-h-0 px-6 py-4 gap-4">
          {/* Barra de busca */}
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Busque pelo nome ou ID da loja"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Opção "Todas as lojas" */}
          <div className="flex-shrink-0">
            <div 
              className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                !selectedStore ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={clearSelection}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                    <Store className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm sm:text-base">Todas as lojas</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Visualizar dados de todas as lojas</p>
                  </div>
                </div>
                {!selectedStore && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />}
              </div>
            </div>
          </div>

          {/* Lista de lojas - agora ocupará todo o espaço restante */}
          <div className="flex-1 min-h-0">
            <ScrollArea className="h-full">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredStores.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'Nenhuma loja encontrada com esse termo' : 'Nenhuma loja disponível'}
                </div>
              ) : (
                <div className="space-y-2 pb-4">
                  {filteredStores.map((store) => (
                    <div
                      key={store.id}
                      className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedStore?.id === store.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                      onClick={() => handleStoreSelect(store)}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                            <Store className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-sm sm:text-base truncate">{store.store_name}</h3>
                              <Badge variant="outline" className="text-xs flex-shrink-0">
                                ID: {store.merchant_id}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 mt-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{store.company_name}</span>
                            </div>
                            {store.environment && (
                              <div className="mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {store.environment === 'sandbox' ? 'Sandbox' : 'Produção'}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                        {selectedStore?.id === store.id && (
                          <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Footer com contador */}
          {filteredStores.length > 0 && (
            <div className="text-center text-xs sm:text-sm text-gray-500 border-t pt-3 flex-shrink-0">
              Exibindo {filteredStores.length} de {stores.length} lojas
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StoreSelector;