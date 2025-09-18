import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';

const RevisaoProduto: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { produto } = location.state || {};

  if (!produto) {
    return <div>Produto não encontrado.</div>;
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardContent>
          <h2 className="text-2xl font-bold mb-2">{produto.name}</h2>
          <p className="mb-4">{produto.description}</p>
          <img src={produto.image} alt={produto.name} className="mb-4 max-h-48" />
          <div className="mb-4">
            <span className="font-bold text-lg">R$ {produto.price?.toFixed(2).replace('.', ',')}</span>
          </div>
          {/* Adicionais e resumo podem ser exibidos aqui */}
          <div className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
              Continuar comprando
            </Button>
            <Button className="flex-1" onClick={() => navigate('/identificacao', { state: { produto } })}>
              Avançar para o carrinho
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default RevisaoProduto;
