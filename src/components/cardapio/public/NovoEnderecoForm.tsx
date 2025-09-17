import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerAddress } from '@/hooks/useCustomerAddresses';

interface NovoEnderecoFormProps {
  onSave: (endereco: Omit<CustomerAddress, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  loading: boolean;
}

const azul = '#1E3A8A';
const coral = '#FF6B57';
const preto = '#222';

export const NovoEnderecoForm: React.FC<NovoEnderecoFormProps> = ({ onSave, onCancel, loading }) => {
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: ''
  });
  const [buscandoCep, setBuscandoCep] = useState(false);

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setEndereco(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleCepChange = (value: string) => {
    setEndereco(prev => ({ ...prev, cep: value }));
    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
    }
  };

  const handleSalvar = () => {
    if (!endereco.logradouro || !endereco.numero || !endereco.bairro || !endereco.cidade) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    onSave(endereco);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md my-8 animate-slide-up max-h-[90vh] overflow-y-auto cardapio-scroll-sutil">
        <Card>
          <CardContent>
            <h2 className="text-xl font-bold mb-6" style={{color: azul}}>Cadastrar Endereço</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium" style={{color: preto}}>CEP *</label>
                <input
                  type="text"
                  placeholder="00000-000"
                  value={endereco.cep}
                  onChange={e => handleCepChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                  style={{borderColor: azul, color: preto}}
                  maxLength={9}
                />
                {buscandoCep && <p className="text-xs text-gray-500 mt-1">Buscando CEP...</p>}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block mb-1 font-medium" style={{color: preto}}>Logradouro *</label>
                  <input
                    type="text"
                    placeholder="Rua, Avenida..."
                    value={endereco.logradouro}
                    onChange={e => setEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                    style={{borderColor: azul, color: preto}}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium" style={{color: preto}}>Número *</label>
                  <input
                    type="text"
                    placeholder="123"
                    value={endereco.numero}
                    onChange={e => setEndereco(prev => ({ ...prev, numero: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                    style={{borderColor: azul, color: preto}}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 font-medium" style={{color: preto}}>Complemento</label>
                <input
                  type="text"
                  placeholder="Apto, Casa, Bloco..."
                  value={endereco.complemento}
                  onChange={e => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                  style={{borderColor: azul, color: preto}}
                />
              </div>

              <div>
                <label className="block mb-1 font-medium" style={{color: preto}}>Bairro *</label>
                <input
                  type="text"
                  placeholder="Nome do bairro"
                  value={endereco.bairro}
                  onChange={e => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                  style={{borderColor: azul, color: preto}}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block mb-1 font-medium" style={{color: preto}}>Cidade *</label>
                  <input
                    type="text"
                    value={endereco.cidade}
                    onChange={e => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                    style={{borderColor: azul, color: preto}}
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium" style={{color: preto}}>Estado *</label>
                  <input
                    type="text"
                    value={endereco.estado}
                    onChange={e => setEndereco(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
                    style={{borderColor: azul, color: preto}}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                className="flex-1"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 font-bold text-white"
                style={{backgroundColor: coral}}
                onClick={handleSalvar}
                disabled={loading}
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
