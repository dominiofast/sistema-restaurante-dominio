import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';

const azul = '#1E3A8A'; // Azul escuro
const coral = '#FF6B57'; // Coral
const preto = '#222'; // Preto

const enderecosMock = [
  {
    id: 1,
    label: 'Endereço de entrega',
    endereco: 'Av. Porto Velho, 2828, Centro, Cacoal - RO',
  },
  {
    id: 2,
    label: 'Retirar no estabelecimento',
    endereco: 'Avenida Porto Velho, 2828, Centro, Cacoal - RO',
  },;
];

const ConfirmarEndereco: React.FC = () => {
  const location = useLocation()
  const { nome, telefone } = location.state || {};
  const [enderecoSelecionado, setEnderecoSelecionado] = useState<number | null>(null)

  return (
    <div className="max-w-md mx-auto py-10">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-6" style={{color: azul}}>Finalizar pedido</h2>
          <div className="mb-2 text-sm" style={{color: preto}}>
            Este pedido será entregue a:<br />
            <span className="font-bold">{nome || 'Cliente'}</span><br />
            <span>{telefone}</span>
          </div>
          <div className="bg-black/80 rounded mb-4 p-2">
            <div className="font-semibold mb-2 text-white">Escolha como receber o pedido</div>
            <div className="bg-white rounded">
              {enderecosMock.map((end, idx) => (
                <div key={end.id} className="flex items-center border-b last:border-b-0 px-2 py-3">
                  <input
                    type="radio"
                    name="endereco"
                    checked={enderecoSelecionado === end.id}
                    onChange={() => setEnderecoSelecionado(end.id)}
                    className="mr-2"
                    style={{ accentColor: coral }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-black">{end.label}</div>
                    <div className="text-xs text-gray-600">{end.endereco}</div>
                  </div>
                  {end.label === 'Endereço de entrega' && (
                    <button className="ml-4 text-xs text-red-500 hover:underline">Excluir</button>
                  )}
                </div>
              ))}
              <div className="px-2 py-3">
                <button className="text-xs text-blue-700 hover:underline" style={{color: azul}}>Cadastrar novo endereço</button>
              </div>
            </div>
          </div>
          <Button
            className="w-full font-bold text-white mt-4"
            style={{background: enderecoSelecionado ? coral : azul, borderColor: azul}}
            disabled={!enderecoSelecionado}
          >
            Avançar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
};

export default ConfirmarEndereco;
