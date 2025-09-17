import React, { useState, useEffect } from 'react';
import { Search, Check, X, Users, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
  status?: string;
}

interface ClientSelectorProps {
  selectedContacts: Cliente[];
  onContactsChange: (contacts: Cliente[]) => void;
  onClose: () => void;
}

export const ClientSelector: React.FC<ClientSelectorProps> = ({
  selectedContacts,
  onContactsChange,
  onClose
}) => {
  const { currentCompany } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Cliente[]>([]);
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar clientes
  useEffect(() => {
    const fetchClients = async () => {
      if (!currentCompany?.id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clientes')
          .select('id, nome, telefone, email, status')
          .eq('company_id', currentCompany.id)
          .not('telefone', 'is', null)
          .neq('telefone', '')
          .order('nome', { ascending: true });

        if (error) throw error;
        
        // Converter id para string se necessário
        const clientsWithStringId = (data || []).map(client => ({
          ...client,
          id: client.id.toString()
        }));
        
        setClients(clientsWithStringId);
        setFilteredClients(clientsWithStringId);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        toast.error('Erro ao carregar lista de clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [currentCompany?.id]);

  // Filtrar clientes conforme busca
  useEffect(() => {
    const filtered = clients.filter(client => 
      client.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  const handleToggleContact = (client: Cliente) => {
    const isSelected = selectedContacts.some(c => c.id === client.id);
    
    if (isSelected) {
      onContactsChange(selectedContacts.filter(c => c.id !== client.id));
    } else {
      onContactsChange([...selectedContacts, client]);
    }
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredClients.length) {
      onContactsChange([]);
    } else {
      onContactsChange(filteredClients);
    }
  };

  const isContactSelected = (clientId: string) => {
    return selectedContacts.some(c => c.id === clientId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Users className="text-blue-600" size={20} />
              <span>Selecionar Contatos</span>
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, telefone ou email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>{filteredClients.length} contatos encontrados</span>
            <span>{selectedContacts.length} selecionados</span>
          </div>
        </div>

        {/* Lista de clientes */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
              <span className="ml-2 text-gray-600">Carregando clientes...</span>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Botão selecionar todos */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                    selectedContacts.length === filteredClients.length 
                      ? 'bg-blue-600 border-blue-600' 
                      : 'border-gray-300'
                  }`}>
                    {selectedContacts.length === filteredClients.length && (
                      <Check size={12} className="text-white" />
                    )}
                  </div>
                  <span>
                    {selectedContacts.length === filteredClients.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </span>
                </button>
              </div>

              {/* Lista de clientes */}
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isContactSelected(client.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => handleToggleContact(client)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                      isContactSelected(client.id) 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300'
                    }`}>
                      {isContactSelected(client.id) && (
                        <Check size={12} className="text-white" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{client.nome}</div>
                      <div className="text-sm text-gray-600">{client.telefone}</div>
                      {client.email && (
                        <div className="text-xs text-gray-500">{client.email}</div>
                      )}
                    </div>
                    
                    {client.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        client.status === 'ativo' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {client.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedContacts.length} contatos selecionados
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar Seleção
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};