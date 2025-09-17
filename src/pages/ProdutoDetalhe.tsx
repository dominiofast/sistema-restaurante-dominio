import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';

interface ProdutoDetalheProps {}

const ProdutoDetalhe: React.FC<ProdutoDetalheProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { produto } = location.state || {};

  // Simula adicionais, ajuste conforme necessário
  const [adicionais, setAdicionais] = useState<any[]>([]);

  if (!produto) {
    return <div>Produto não encontrado.</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardContent>
          <h2 className="font-playfair font-semibold text-2xl md:text-3xl mb-2 leading-tight">{produto.name}</h2>
          <p className="font-inter text-base md:text-lg mb-4 leading-relaxed">{produto.description}</p>
          <img src={produto.image} alt={produto.name} className="mb-4 max-h-48" />
          <div className="mb-4">
            <span className="font-inter font-bold text-2xl md:text-3xl tracking-wide">R$ {produto.price?.toFixed(2).replace('.', ',')}</span>
          </div>
          {/* Adicionais (exemplo) */}
          <div className="mb-4">
            <h4 className="font-semibold">Adicionais</h4>
            <div className="flex flex-col gap-2">
              {/* Renderize opções reais de adicionais aqui */}
              <label>
                <input type="checkbox" /> Queijo extra (+R$ 2,00)
              </label>
              <label>
                <input type="checkbox" /> Bacon (+R$ 3,00)
              </label>
            </div>
          </div>
          <Button className="w-full mt-4 font-inter font-medium text-base tracking-wide" onClick={() => navigate('/produto/revisao', { state: { produto } })}>
            Avançar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProdutoDetalhe;
