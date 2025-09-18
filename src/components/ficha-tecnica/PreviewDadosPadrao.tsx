import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FichasTecnicasDefaultService } from '@/services/fichasTecnicasDefaultService';
import { Package2, ChefHat, Clock, Users, DollarSign } from 'lucide-react';

interface PreviewDadosPadraoProps {
  tipo: 'mercadorias' | 'receitas';
}

const PreviewDadosPadrao: React.FC<PreviewDadosPadraoProps> = ({ tipo }) => {
  const stats = FichasTecnicasDefaultService.getDadosEstatisticas()
  const dados = tipo === 'mercadorias' ? stats.mercadorias : stats.receitas;

  // Dados de exemplo para preview
  const exemplosMercadorias = [
    { nome: 'Farinha de Trigo Tipo 1', categoria: 'Farinhas e Massas', preco: 'R$ 3,50/kg', estoque: '50kg' },
    { nome: 'Mussarela Fatiada', categoria: 'Laticínios', preco: 'R$ 25,00/kg', estoque: '40kg' },
    { nome: 'Calabresa Defumada', categoria: 'Carnes', preco: 'R$ 22,00/kg', estoque: '20kg' },
    { nome: 'Molho de Tomate Pelado', categoria: 'Molhos e Bases', preco: 'R$ 8,00/kg', estoque: '30kg' },
    { nome: 'Orégano Seco', categoria: 'Temperos', preco: 'R$ 0,08/g', estoque: '200g' },;
  ];

  const exemplosReceitas = [
    { nome: 'Massa de Pizza Tradicional', categoria: 'Massas', tempo: '120 min', rendimento: '8 unidades', custo: 'R$ 12,50' },
    { nome: 'Pizza Margherita', categoria: 'Pizzas Tradicionais', tempo: '15 min', rendimento: '1 unidade', custo: 'R$ 8,75' },
    { nome: 'Molho Base Para Pizza', categoria: 'Molhos e Bases', tempo: '45 min', rendimento: '2 kg', custo: 'R$ 8,20' },
    { nome: 'Pizza 4 Queijos', categoria: 'Pizzas Especiais', tempo: '16 min', rendimento: '1 unidade', custo: 'R$ 18,50' },
    { nome: 'Borda Recheada', categoria: 'Técnicas Especiais', tempo: '10 min', rendimento: '1 unidade', custo: 'R$ 3,50' },;
  ];

  const exemplos = tipo === 'mercadorias' ? exemplosMercadorias : exemplosReceitas;

  return (
    <div className="space-y-4">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {tipo === 'mercadorias' ? (
                <Package2 className="h-5 w-5 text-blue-600" />
              ) : (
                <ChefHat className="h-5 w-5 text-green-600" />
              )}
              <div>
                <p className="font-semibold text-lg">{dados.total}</p>
                <p className="text-sm text-gray-600">
                  {tipo === 'mercadorias' ? 'Ingredientes' : 'Receitas'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 bg-purple-100 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-purple-600">{dados.categorias}</span>
              </div>
              <div>
                <p className="font-semibold text-lg">{dados.categorias}</p>
                <p className="text-sm text-gray-600">Categorias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categorias Incluídas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dados.categoriasNomes.map(categoria => (
              <Badge key={categoria} variant="secondary">
                {categoria}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exemplos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Exemplos ({exemplos.length} de {dados.total})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exemplos.map((item, index) => (
              <div key={index} className="border rounded-lg p-3 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{item.nome}</h4>
                  <Badge variant="outline" className="text-xs">
                    {item.categoria}
                  </Badge>
                </div>
                
                <div className="flex gap-4 text-sm text-gray-600">
                  {tipo === 'mercadorias' ? (
                    <>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {(item as any).preco}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package2 className="h-3 w-3" />
                        Estoque: {(item as any).estoque}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {(item as any).tempo}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {(item as any).rendimento}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {(item as any).custo}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
};

export default PreviewDadosPadrao; 
