
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, MessageCircle, Wallet, DollarSign } from 'lucide-react';
import { useCustomerCashback } from '@/hooks/useCashbackConfig';
import { useAuth } from '@/contexts/AuthContext';

interface Cliente {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  documento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  data_cadastro?: string;
  status?: string;
  data_nascimento?: string;
  dias_sem_comprar?: number;
  total_pedidos?: number;
}

interface ClienteTableProps {
  clientes: Cliente[];
  onEdit: (cliente: Cliente) => void;
  onDelete: (id: number) => void;
  onAddCashback: (cliente: Cliente) => void;
  searchTerm: string;
}

export const ClienteTable: React.FC<ClienteTableProps> = ({
  clientes,
  onEdit,
  onDelete,
  onAddCashback,
  searchTerm
}) => {
  const { currentCompany } = useAuth();
  const { data: customerCashback } = useCustomerCashback(currentCompany?.id);
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.telefone?.includes(searchTerm) ||
    cliente.documento?.includes(searchTerm)
  );

  console.log('📋 ClienteTable - Dados recebidos:', {
    clientesTotal: clientes.length,
    searchTerm,
    filteredTotal: filteredClientes.length,
    primeirosClientes: clientes.slice(0, 3).map(c => ({ nome: c.nome, status: c.status }))
  });

  return (
    <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
      <CardContent className="px-0 pb-6">
        {filteredClientes.length === 0 ? (
          <div className="text-center py-12 text-gray-600 text-lg">
            {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Cliente</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Dias sem Comprar</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Total Pedidos</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Cashback</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Contato</th>
                  <th className="px-2 py-2 text-center font-semibold text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredClientes.map((cliente) => {
                  const cashback = customerCashback?.find(cb => cb.customer_phone === cliente.telefone);
                  
                  return (
                    <tr key={cliente.id} className="hover:bg-gray-50 transition">
                      <td className="px-3 py-2 font-medium text-gray-900">{cliente.nome}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {cliente.dias_sem_comprar !== undefined ? `${cliente.dias_sem_comprar} dias` : '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {cliente.total_pedidos !== undefined ? cliente.total_pedidos : '-'}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {cashback ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">
                              R$ {cashback.saldo_disponivel.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">R$ 0,00</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-800">
                      {cliente.telefone || '-'}
                      {cliente.telefone && (
                        <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" title="WhatsApp" className="ml-1">
                          <MessageCircle className="inline-block h-4 w-4 text-green-500 hover:text-green-700 align-middle" />
                        </a>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                         <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onAddCashback(cliente)}
                          className="border-green-200 hover:bg-green-100 hover:border-green-300 p-1"
                          title="Adicionar Cashback"
                        >
                          <Wallet className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(cliente)}
                          className="border-gray-200 hover:bg-gray-100 hover:border-gray-300 p-1"
                        >
                          <Edit className="h-4 w-4 text-gray-700" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onDelete(cliente.id)}
                          className="border-red-200 hover:bg-red-100 hover:border-red-300 p-1"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
