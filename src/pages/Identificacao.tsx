import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';

const azul = '#1E3A8A'; // Azul escuro
const coral = '#FF6B57'; // Coral
const preto = '#222'; // Preto

const Identificacao: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { produto } = location.state || {};

  const [telefone, setTelefone] = useState('');
  const [nome, setNome] = useState('');

  const podeAvancar = telefone.length >= 10 && nome.length > 3;

  return (
    <div className="max-w-md mx-auto py-10">
      <Card>
        <CardContent>
          <h2 className="text-xl font-bold mb-6" style={{color: azul}}>Identifique-se</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium" style={{color: preto}}>Seu número de WhatsApp:</label>
            <input
              type="tel"
              placeholder="(99) 99999-9999"
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
              style={{borderColor: azul, color: preto}}
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium" style={{color: preto}}>Seu nome e sobrenome:</label>
            <input
              type="text"
              placeholder="Nome e sobrenome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2"
              style={{borderColor: azul, color: preto}}
            />
          </div>
          <Button
            className="w-full font-bold text-white"
            style={{background: podeAvancar ? coral : azul, borderColor: azul}}
            disabled={!podeAvancar}
            onClick={() => navigate('/confirmar-endereco', { state: { produto, telefone, nome } })}
          >
            Avançar
          </Button>
          <p className="text-xs text-center mt-4" style={{color: preto, opacity: 0.6}}>
            Para realizar seu pedido vamos precisar de suas informações, este é um ambiente protegido.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Identificacao;
