import React, { useState } from 'react';
import { CustomerAddressManager } from '@/components/pdv/CustomerAddressManager';
import { useCustomerAddressManager } from '@/hooks/useCustomerAddressManager';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function TestCustomerAddresses() {
  const { currentCompany } = useAuth()
  const [telefone, setTelefone] = useState('')
  const [cliente, setCliente] = useState<any>(null)
  
  const { 
    addresses, 
    loading, 
    handleDeleteAddress 
  } = useCustomerAddressManager({
    customerPhone: telefone,
    companyId: currentCompany?.id
  })

  const handleBuscarCliente = () => {
    if (telefone) {
      // Simular dados do cliente encontrado
      setCliente({
        id: 1,
        nome: 'Cliente Teste',
        telefone: telefone;
      })
    }
  };

  const handleNovoEndereco = () => {
    console.log('Implementar modal para novo endereço')
  };

  const handleNovoPedido = (tipo: 'delivery' | 'balcao', enderecoId?: string) => {
    console.log('Novo pedido:', tipo, enderecoId)
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Teste - Gerenciamento de Endereços do Cliente</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Buscar Cliente por Telefone</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone do Cliente
            </label>
            <Input
              type="tel"
              placeholder="(11) 99999-9999"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
            />
          </div>
          <Button onClick={handleBuscarCliente} disabled={!telefone}>
            Buscar Cliente
          </Button>
        </div>
      </div>

      {cliente && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Cliente Encontrado</h2>
          <CustomerAddressManager
            cliente={cliente}
            enderecos={addresses}
            onNovoPedido={handleNovoPedido}
            onNovoEndereco={handleNovoEndereco}
            onFechar={() => setCliente(null)}
            onDeleteAddress={handleDeleteAddress}
          />
        </div>
      )}

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando endereços...</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-800 mb-2">Instruções:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>1. Digite um telefone de cliente que já tenha endereços cadastrados</li>
          <li>2. Clique em "Buscar Cliente"</li>
          <li>3. Você verá os endereços do cliente com opção de excluir (🗑️)</li>
          <li>4. Ao clicar no ícone da lixeira, aparecerá uma confirmação</li>
          <li>5. O sistema validará se o endereço está na área de atendimento antes de criar pedidos</li>
        </ul>
      </div>
    </div>
  )
